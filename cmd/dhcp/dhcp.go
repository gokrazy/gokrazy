// dhcp is a minimal DHCP client for gokrazy.
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gokrazy/gokrazy/internal/iface"
	"github.com/google/gopacket/layers"
	"github.com/mdlayher/packet"
	"github.com/rtr7/dhcp4"
	"golang.org/x/sys/unix"
)

var (
	defaultDst     = net.IP([]byte{0, 0, 0, 0})
	defaultNetmask = net.IPMask([]byte{0, 0, 0, 0})
)

type client struct {
	hostname     string
	hardwareAddr net.HardwareAddr
	generateXID  func() uint32
	conn         net.PacketConn
}

func (c *client) packet(xid uint32, opts []layers.DHCPOption) *layers.DHCPv4 {
	return &layers.DHCPv4{
		Operation:    layers.DHCPOpRequest,
		HardwareType: layers.LinkTypeEthernet,
		HardwareLen:  uint8(len(layers.EthernetBroadcast)),
		HardwareOpts: 0, // clients set this to zero (used by relay agents)
		Xid:          xid,
		Secs:         0, // TODO: fill in?
		Flags:        0, // we can receive IP packets via unicast
		ClientHWAddr: c.hardwareAddr,
		ServerName:   nil,
		File:         nil,
		Options:      opts,
	}
}

func (c *client) discover() (*layers.DHCPv4, error) {
	discover := c.packet(c.generateXID(), []layers.DHCPOption{
		dhcp4.MessageTypeOpt(layers.DHCPMsgTypeDiscover),
		dhcp4.HostnameOpt(c.hostname),
		dhcp4.ClientIDOpt(layers.LinkTypeEthernet, c.hardwareAddr),
		dhcp4.ParamsRequestOpt(
			layers.DHCPOptDNS,
			layers.DHCPOptRouter,
			layers.DHCPOptSubnetMask,
			layers.DHCPOptDomainName),
	})
	if err := dhcp4.Write(c.conn, discover); err != nil {
		return nil, err
	}

	// Look for DHCPOFFER packet (described in RFC2131 4.3.1):
	c.conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	for {
		offer, err := dhcp4.Read(c.conn)
		if err != nil {
			return nil, err
		}
		if offer == nil {
			continue // not a DHCPv4 packet
		}
		if offer.Xid != discover.Xid {
			continue // broadcast reply for different DHCP transaction
		}
		if !dhcp4.HasMessageType(offer.Options, layers.DHCPMsgTypeOffer) {
			continue
		}
		return offer, nil
	}
}

func (c *client) request(last *layers.DHCPv4) (*layers.DHCPv4, error) {
	// Build a DHCPREQUEST packet:
	request := c.packet(last.Xid, append([]layers.DHCPOption{
		dhcp4.MessageTypeOpt(layers.DHCPMsgTypeRequest),
		dhcp4.RequestIPOpt(last.YourClientIP),
		dhcp4.HostnameOpt(c.hostname),
		dhcp4.ClientIDOpt(layers.LinkTypeEthernet, c.hardwareAddr),
		dhcp4.ParamsRequestOpt(
			layers.DHCPOptDNS,
			layers.DHCPOptRouter,
			layers.DHCPOptSubnetMask,
			layers.DHCPOptDomainName),
	}, dhcp4.ServerID(last.Options)...))
	if err := dhcp4.Write(c.conn, request); err != nil {
		return nil, err
	}

	c.conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	for {
		// Look for DHCPACK packet (described in RFC2131 4.3.1):
		ack, err := dhcp4.Read(c.conn)
		if err != nil {
			return nil, err
		}
		if ack == nil {
			continue // not a DHCPv4 packet
		}
		if ack.Xid != request.Xid {
			continue // broadcast reply for different DHCP transaction
		}
		if !dhcp4.HasMessageType(ack.Options, layers.DHCPMsgTypeAck) {
			continue
		}
		return ack, nil
	}
}

func applyLease(cs iface.Configsocket, source string, lease dhcp4.Lease) error {
	// Log the received DHCPACK packet:
	details := []string{
		fmt.Sprintf("IP %v", lease.IP),
	}
	if len(lease.Netmask) > 0 {
		ipnet := net.IPNet{
			IP:   lease.IP,
			Mask: lease.Netmask,
		}
		details[0] = fmt.Sprintf("IP %v", ipnet.String())
	}
	if len(lease.Router) > 0 {
		details = append(details, fmt.Sprintf("router %v", lease.Router))
	}
	if len(lease.DNS) > 0 {
		details = append(details, fmt.Sprintf("DNS %v", lease.DNS))
	}
	if len(lease.Broadcast) > 0 {
		details = append(details, fmt.Sprintf("broadcast %v", lease.Broadcast))
	}

	log.Printf("%s: %v", source, strings.Join(details, ", "))

	// Apply the received settings:
	if err := cs.SetAddress(lease.IP); err != nil {
		return err
	}
	if len(lease.Netmask) > 0 {
		if err := cs.SetNetmask(lease.Netmask); err != nil {
			return fmt.Errorf("setNetmask(%v): %v", lease.Netmask, err)
		}
	}
	if b := lease.Broadcast; len(b) > 0 {
		if err := cs.SetBroadcast(b); err != nil {
			return fmt.Errorf("setBroadcast(%v): %v", b, err)
		}
	}

	if err := cs.Up(); err != nil {
		return err
	}

	if r := lease.Router; len(r) > 0 {
		if errno := cs.AddRoute(defaultDst, r, defaultNetmask); errno != 0 {
			if errno == syscall.EEXIST {
				if errno := cs.DelRoute(defaultDst, r, defaultNetmask); errno != 0 {
					log.Printf("delRoute(%v): %v", r, errno)
				}
				if errno := cs.AddRoute(defaultDst, r, defaultNetmask); errno != 0 {
					return fmt.Errorf("addRoute(%v): %v", r, errno)
				}
			} else {
				return fmt.Errorf("addRoute(%v): %v", r, errno)
			}
		}
	}

	if len(lease.DNS) > 0 {
		resolvConf := "/etc/resolv.conf"
		if dest, err := os.Readlink("/etc/resolv.conf"); err == nil && dest == "/tmp/resolv.conf" {
			resolvConf = "/tmp/resolv.conf"
		}
		// Get the symlink out of the way, if any.
		if err := os.Remove(resolvConf); err != nil && !os.IsNotExist(err) {
			return fmt.Errorf("resolv.conf: %v", err)
		}
		var lines []string
		if domain := lease.Domain; domain != "" {
			lines = append(lines, fmt.Sprintf("domain %s", domain))
			lines = append(lines, fmt.Sprintf("search %s", domain))
		}
		for _, ns := range lease.DNS {
			lines = append(lines, fmt.Sprintf("nameserver %v", ns))
		}
		if err := ioutil.WriteFile(resolvConf, []byte(strings.Join(lines, "\n")+"\n"), 0644); err != nil {
			return fmt.Errorf("resolv.conf: %v", err)
		}
	}

	// Notify init of new addresses
	p, _ := os.FindProcess(1)
	if err := p.Signal(syscall.SIGHUP); err != nil {
		log.Printf("send SIGHUP to init: %v", err)
	}

	return nil
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	var (
		ifname = flag.String(
			"interface",
			"eth0",
			"network interface to obtain a DHCP lease on")

		staticConfig = flag.String(
			"static_network_config",
			"",
			"network configuration to apply instead of querying DHCP")
	)
	flag.Parse()

	// NOTE: cannot gokrazy.WaitForClock() here, since the clock can only be
	// initialized once the network is up.

	var utsname unix.Utsname
	if err := unix.Uname(&utsname); err != nil {
		log.Fatal(err)
	}
	hostname := string(utsname.Nodename[:bytes.IndexByte(utsname.Nodename[:], 0)])

	intf, err := net.InterfaceByName(*ifname)
	if err != nil {
		log.Fatal(err)
	}

	cs, err := iface.NewConfigSocket(*ifname)
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
		b, err := ioutil.ReadFile(filepath.Join("/sys/class/net", *ifname, "carrier"))
		if err == nil && strings.TrimSpace(string(b)) == "1" {
			break
		}
		time.Sleep(1 * time.Second)
	}

	if *staticConfig != "" {
		var l dhcp4.Lease
		if err := json.Unmarshal([]byte(*staticConfig), &l); err != nil {
			log.Fatal(err)
		}
		if ones, bits := l.Netmask.Size(); ones == 0 && bits == 0 {
			l.Netmask = net.CIDRMask(24, 32) // IPv4 /24
		}
		// When unmarshaling IP addresses from a string, Go does not use the
		// compact IPv4 byte slice representation, but our interface
		// configuration routines require that:
		if l.IP != nil {
			l.IP = l.IP.To4()
		}
		if l.Broadcast != nil {
			l.Broadcast = l.Broadcast.To4()
		}
		if l.Router != nil {
			l.Router = l.Router.To4()
		}
		for idx, dns := range l.DNS {
			l.DNS[idx] = dns.To4()
		}

		if err := applyLease(cs, "-static_network_config", l); err != nil {
			log.Fatal(err)
		}
		// Leave the process running indefinitely
		time.Sleep(time.Duration(1<<63 - 1))
	}

	conn, err := packet.Listen(intf, packet.Datagram, unix.ETH_P_IP, nil)
	if err != nil {
		log.Fatal(err)
	}

	c := &client{
		hostname:     hostname,
		hardwareAddr: intf.HardwareAddr,
		generateXID:  dhcp4.XIDGenerator(intf.HardwareAddr),
		conn:         conn,
	}
	offer, err := c.discover()
	if err != nil {
		log.Fatal(err)
	}
	last := offer
	for {
		last, err = c.request(last)
		if err != nil {
			log.Fatal(err)
		}

		lease := dhcp4.LeaseFromACK(last)

		if err := applyLease(cs, "DHCPACK", lease); err != nil {
			log.Fatal(err)
		}

		time.Sleep(lease.RenewalTime)
	}
}
