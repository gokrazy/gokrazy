// Only build for (linux AND (amd64 OR arm64)) due to using
// linux-specific syscalls with uint64 for “unsigned long”:

// +build linux
// +build amd64 arm64

// dhcp is a minimal DHCP client for gokrazy.
package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"strings"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

	"github.com/d2g/dhcp4"
	"github.com/d2g/dhcp4client"
	"github.com/gokrazy/gokrazy/internal/iface"
)

func parseDHCPDuration(b []byte) time.Duration {
	return time.Duration(binary.BigEndian.Uint32(b)) * time.Second
}

var (
	defaultDst     = net.IP([]byte{0, 0, 0, 0})
	defaultNetmask = net.IPMask([]byte{0, 0, 0, 0})

	hardwareAddr net.HardwareAddr
)

func addHostname(p *dhcp4.Packet) {
	var utsname unix.Utsname
	if err := unix.Uname(&utsname); err != nil {
		log.Fatal(err)
	}
	nnb := utsname.Nodename[:bytes.IndexByte(utsname.Nodename[:], 0)]
	p.AddOption(dhcp4.OptionHostName, nnb)
}

func addClientId(p *dhcp4.Packet) {
	id := make([]byte, len(hardwareAddr)+1)
	id[0] = 1 // hardware type ethernet, https://tools.ietf.org/html/rfc1700
	copy(id[1:], hardwareAddr)
	p.AddOption(dhcp4.OptionClientIdentifier, id)
}

// dhcpRequest is a copy of (dhcp4client/Client).Request which
// includes the hostname.
func dhcpRequest(c *dhcp4client.Client) (bool, dhcp4.Packet, error) {
	discoveryPacket := c.DiscoverPacket()
	addHostname(&discoveryPacket)
	addClientId(&discoveryPacket)
	discoveryPacket.PadToMinSize()

	if err := c.SendPacket(discoveryPacket); err != nil {
		return false, discoveryPacket, err
	}

	offerPacket, err := c.GetOffer(&discoveryPacket)
	if err != nil {
		return false, offerPacket, err
	}

	requestPacket := c.RequestPacket(&offerPacket)
	addHostname(&requestPacket)
	addClientId(&requestPacket)
	requestPacket.PadToMinSize()

	if err := c.SendPacket(requestPacket); err != nil {
		return false, requestPacket, err
	}

	acknowledgement, err := c.GetAcknowledgement(&requestPacket)
	if err != nil {
		return false, acknowledgement, err
	}

	acknowledgementOptions := acknowledgement.ParseOptions()
	if dhcp4.MessageType(acknowledgementOptions[dhcp4.OptionDHCPMessageType][0]) != dhcp4.ACK {
		return false, acknowledgement, nil
	}

	return true, acknowledgement, nil
}

// dhcpRenew is a copy of (dhcp4client/Client).Renew which
// includes the hostname.
func dhcpRenew(c *dhcp4client.Client, packet dhcp4.Packet) (bool, dhcp4.Packet, error) {
	addHostname(&packet)
	addClientId(&packet)
	packet.PadToMinSize()

	if err := c.SendPacket(packet); err != nil {
		return false, packet, err
	}

	acknowledgement, err := c.GetAcknowledgement(&packet)
	if err != nil {
		return false, acknowledgement, err
	}

	acknowledgementOptions := acknowledgement.ParseOptions()
	if dhcp4.MessageType(acknowledgementOptions[dhcp4.OptionDHCPMessageType][0]) != dhcp4.ACK {
		return false, acknowledgement, nil
	}

	return true, acknowledgement, nil
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// NOTE: cannot gokrazy.WaitForClock() here, since the clock can only be
	// initialized once the network is up.

	eth0, err := net.InterfaceByName("eth0")
	if err != nil {
		log.Fatal(err)
	}

	cs, err := iface.NewConfigSocket("eth0")
	if err != nil {
		log.Fatalf("config socket: %v", err)
	}
	defer cs.Close()

	// Ensure the interface is up so that we can send DHCP packets.
	if err := cs.Up(); err != nil {
		log.Fatal(err)
	}

	// Wait for up to 10 seconds for the link to indicate it has a
	// carrier.
	for i := 0; i < 10; i++ {
		b, err := ioutil.ReadFile("/sys/class/net/eth0/carrier")
		if err == nil && strings.TrimSpace(string(b)) == "1" {
			break
		}
		time.Sleep(1 * time.Second)
	}

	hardwareAddr = eth0.HardwareAddr

	pktsock, err := dhcp4client.NewPacketSock(eth0.Index)
	if err != nil {
		log.Fatal(err)
	}
	dhcp, err := dhcp4client.New(
		dhcp4client.HardwareAddr(eth0.HardwareAddr),
		dhcp4client.Timeout(5*time.Second),
		dhcp4client.Broadcast(false),
		dhcp4client.Connection(pktsock),
	)
	if err != nil {
		log.Fatal(err)
	}

	ok, ack, err := dhcpRequest(dhcp)
	for {
		if err != nil {
			log.Fatal(err)
		}
		if !ok {
			log.Fatal("received DHCPNAK")
		}
		opts := ack.ParseOptions()

		// DHCPACK (described in RFC2131 4.3.1)
		// - yiaddr: IP address assigned to client
		details := []string{
			fmt.Sprintf("IP %v", ack.YIAddr()),
		}

		if b, ok := opts[dhcp4.OptionSubnetMask]; ok {
			ipnet := net.IPNet{
				IP:   ack.YIAddr(),
				Mask: net.IPMask(b),
			}
			details[0] = fmt.Sprintf("IP %v", ipnet.String())
		}

		if b, ok := opts[dhcp4.OptionBroadcastAddress]; ok {
			details = append(details, fmt.Sprintf("broadcast %v", net.IP(b)))
		}

		if b, ok := opts[dhcp4.OptionRouter]; ok {
			details = append(details, fmt.Sprintf("router %v", net.IP(b)))
		}

		if b, ok := opts[dhcp4.OptionDomainNameServer]; ok {
			details = append(details, fmt.Sprintf("DNS %v", net.IP(b)))
		}

		log.Printf("DHCPACK: %v", strings.Join(details, ", "))

		if err := cs.SetAddress(ack.YIAddr()); err != nil {
			log.Fatal(err)
		}

		if b, ok := opts[dhcp4.OptionSubnetMask]; ok {
			if err := cs.SetNetmask(net.IPMask(b)); err != nil {
				log.Fatalf("setNetmask(%v): %v", net.IPMask(b), err)
			}
		}

		if b, ok := opts[dhcp4.OptionBroadcastAddress]; ok {
			if err := cs.SetBroadcast(net.IP(b)); err != nil {
				log.Fatalf("setBroadcast(%v): %v", net.IP(b), err)
			}
		}

		if err := cs.Up(); err != nil {
			log.Fatal(err)
		}

		if b, ok := opts[dhcp4.OptionRouter]; ok {
			if errno := cs.AddRoute(defaultDst, net.IP(b), defaultNetmask); errno != 0 {
				if errno == syscall.EEXIST {
					if errno := cs.DelRoute(defaultDst, net.IP(b), defaultNetmask); errno != 0 {
						log.Printf("delRoute(%v): %v", net.IP(b), errno)
					}
					if errno := cs.AddRoute(defaultDst, net.IP(b), defaultNetmask); errno != 0 {
						log.Fatalf("addRoute(%v): %v", net.IP(b), errno)
					}
				} else {
					log.Fatalf("addRoute(%v): %v", net.IP(b), errno)
				}
			}
		}

		if b, ok := opts[dhcp4.OptionDomainNameServer]; ok {
			resolvConf := "/etc/resolv.conf"
			if dest, err := os.Readlink("/etc/resolv.conf"); err == nil && dest == "/tmp/resolv.conf" {
				resolvConf = "/tmp/resolv.conf"
			}
			// Get the symlink out of the way, if any.
			if err := os.Remove(resolvConf); err != nil && !os.IsNotExist(err) {
				log.Fatalf("resolv.conf: %v", err)
			}
			var lines []string
			if domain, ok := opts[dhcp4.OptionDomainName]; ok {
				lines = append(lines, fmt.Sprintf("domain %s", string(domain)))
				lines = append(lines, fmt.Sprintf("search %s", string(domain)))
			}
			lines = append(lines, fmt.Sprintf("nameserver %v", net.IP(b)))
			if err := ioutil.WriteFile(resolvConf, []byte(strings.Join(lines, "\n")+"\n"), 0644); err != nil {
				log.Fatalf("resolv.conf: %v", err)
			}
		}

		// Notify init of new addresses
		p, _ := os.FindProcess(1)
		if err := p.Signal(syscall.SIGHUP); err != nil {
			log.Printf("send SIGHUP to init: %v", err)
		}

		leaseTime := 10 * time.Minute // seems sensible as a fallback
		if b, ok := opts[dhcp4.OptionIPAddressLeaseTime]; ok && len(b) == 4 {
			leaseTime = parseDHCPDuration(b)
		}

		// As per RFC 2131 section 4.4.5:
		// renewal time defaults to 50% of the lease time
		renewalTime := time.Duration(float64(leaseTime) * 0.5)
		if b, ok := opts[dhcp4.OptionRenewalTimeValue]; ok && len(b) == 4 {
			renewalTime = parseDHCPDuration(b)
		}

		time.Sleep(renewalTime)
		ok, ack, err = dhcpRenew(dhcp, dhcp.RenewalRequestPacket(&ack))
	}
}
