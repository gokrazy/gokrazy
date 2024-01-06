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

	"github.com/google/gopacket/layers"
	"github.com/google/renameio/v2"
	"github.com/mdlayher/packet"
	"github.com/rtr7/dhcp4"
	"github.com/vishvananda/netlink"
	"golang.org/x/sys/unix"
)

var defaultDst = func() *net.IPNet {
	_, net, err := net.ParseCIDR("0.0.0.0/0")
	if err != nil {
		log.Fatal(err)
	}
	return net
}()

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

func priorityFromName(ifname string) int {
	if strings.HasPrefix(ifname, "eth") {
		return 1
	}
	return 5 // wlan0 and others
}

func applyLease(nl *netlink.Handle, ifname string, source string, lease dhcp4.Lease, extraRoutePriority int) error {
	// Log the received DHCPACK packet:
	addrstr := lease.IP.String() + "/24"
	details := []string{
		fmt.Sprintf("IP %v", lease.IP),
	}
	if len(lease.Netmask) > 0 {
		ipnet := net.IPNet{
			IP:   lease.IP,
			Mask: lease.Netmask,
		}
		details[0] = fmt.Sprintf("IP %v", ipnet.String())
		addrstr = ipnet.String()
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

	l, err := nl.LinkByName(ifname)
	if err != nil {
		return fmt.Errorf("LinkByName: %v", err)
	}

	// Apply the received settings:
	addr, err := netlink.ParseAddr(addrstr)
	if err != nil {
		return err
	}
	if err := nl.AddrReplace(l, addr); err != nil {
		return fmt.Errorf("AddrReplace: %v", err)
	}

	if l.Attrs().OperState != netlink.OperUp {
		if err := nl.LinkSetUp(l); err != nil {
			return fmt.Errorf("LinkSetUp: %v", err)
		}
	}

	// Adjust the priority of the network routes on this interface; the kernel
	// adds at least one based on the configured address.
	if err := changeRoutePriority(nl, l, priorityFromName(ifname)+extraRoutePriority); err != nil {
		return fmt.Errorf("changeRoutePriority: %v", err)
	}

	if r := lease.Router; len(r) > 0 {
		err = nl.RouteReplace(&netlink.Route{
			LinkIndex: l.Attrs().Index,
			Dst:       defaultDst,
			Gw:        r,
			Priority:  priorityFromName(ifname) + extraRoutePriority,
		})
		if err != nil {
			return fmt.Errorf("RouteReplace: %v", err)
		}
	}

	if len(lease.DNS) > 0 {
		if err := writeResolvConf(lease); err != nil {
			return fmt.Errorf("writing resolv.conf: %v", err)
		}
	}

	// Notify init of new addresses
	p, _ := os.FindProcess(1)
	if err := p.Signal(syscall.SIGHUP); err != nil {
		log.Printf("send SIGHUP to init: %v", err)
	}

	return nil
}

func writeResolvConf(lease dhcp4.Lease) error {
	const resolvConf = "/tmp/resolv.conf"

	// Has another program (e.g. tailscale) replaced our resolv.conf?
	// Note: at boot, /tmp/resolv.conf is a symlink to /proc/net/pnp,
	// which contains no “generated by” marker.
	if b, err := os.ReadFile(resolvConf); err == nil {
		if bytes.Contains(b, []byte("generated by")) &&
			!bytes.Contains(b, []byte("generated by gokrazy/dhcp")) {
			log.Printf("%s updated outside of gokrazy/dhcp, not updating", resolvConf)
			return nil
		}
	}

	lines := []string{
		"# generated by gokrazy/dhcp",
	}
	if domain := lease.Domain; domain != "" {
		lines = append(lines, fmt.Sprintf("domain %s", domain))
		lines = append(lines, fmt.Sprintf("search %s", domain))
	}
	for _, ns := range lease.DNS {
		lines = append(lines, fmt.Sprintf("nameserver %v", ns))
	}
	if err := renameio.WriteFile(resolvConf, []byte(strings.Join(lines, "\n")+"\n"), 0644); err != nil {
		return fmt.Errorf("resolv.conf: %v", err)
	}
	return nil
}

func changeRoutePriority(nl *netlink.Handle, l netlink.Link, priority int) error {
	routes, err := nl.RouteList(l, netlink.FAMILY_V4)
	if err != nil {
		return fmt.Errorf("netlink.RouteList: %v", err)
	}
	for _, route := range routes {
		if route.Priority == priority {
			continue // no change necessary
		}
		newRoute := route // copy
		log.Printf("adjusting route [dst=%v src=%v gw=%v] priority to %d", route.Dst, route.Src, route.Gw, priority)
		newRoute.Flags = 0 // prevent "invalid argument" error
		newRoute.Priority = priority
		if err := nl.RouteReplace(&newRoute); err != nil {
			return fmt.Errorf("RouteReplace: %v", err)
		}
		if err := nl.RouteDel(&route); err != nil {
			return fmt.Errorf("RouteDel: %v", err)
		}
	}
	return nil
}

func deprioritizeRoutesWhenDown(nl *netlink.Handle, ifname string, extraRoutePriority int) {
	last := netlink.LinkOperState(netlink.OperUp)
	for range time.Tick(1 * time.Second) {
		l, err := nl.LinkByName(ifname)
		if err != nil {
			log.Printf("netlink.LinkByName: %v", err)
			continue
		}
		operState := l.Attrs().OperState
		if last == operState {
			continue // no change
		}
		last = operState
		if operState == netlink.OperDown {
			log.Printf("lost carrier on interface %s, de-prioritizing routes", ifname)
			if err := changeRoutePriority(nl, l, 1024); err != nil {
				log.Print(err)
			}
		} else {
			log.Printf("regained carrier on interface %s, re-prioritizing routes", ifname)
			if err := changeRoutePriority(nl, l, priorityFromName(ifname)+extraRoutePriority); err != nil {
				log.Print(err)
			}
		}
	}
}

func waitForInterface(ifname string) {
	t := time.NewTicker(1 * time.Second)
	defer t.Stop()

	log.Printf("waiting indefinitely for %s to appear", ifname)
	for range t.C {
		if _, err := net.InterfaceByName(ifname); err == nil {
			return
		}
	}
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

		extraRoutePriority = flag.Int(
			"extra_route_priority",
			0,
			"extra value to add to the interface’s priority (eth* defaults to priority 1, wlan* defaults to priority 5, interfaces without link are set to priority 1024)")
	)
	flag.Parse()

	// NOTE: cannot gokrazy.WaitForClock() here, since the clock can only be
	// initialized once the network is up.

	var utsname unix.Utsname
	if err := unix.Uname(&utsname); err != nil {
		log.Fatal(err)
	}
	hostname := string(utsname.Nodename[:bytes.IndexByte(utsname.Nodename[:], 0)])

	waitForInterface(*ifname)

	nl, err := netlink.NewHandle(netlink.FAMILY_V4)
	if err != nil {
		log.Fatal(err)
	}
	go deprioritizeRoutesWhenDown(nl, *ifname, *extraRoutePriority)

	intf, err := net.InterfaceByName(*ifname)
	if err != nil {
		log.Fatal(err)
	}

	// Ensure the interface is up so that we can send DHCP packets.
	l, err := nl.LinkByName(*ifname)
	if err != nil {
		log.Fatalf("LinkByName: %v", err)
	}
	if l.Attrs().OperState != netlink.OperUp {
		if err := nl.LinkSetUp(l); err != nil {
			log.Fatalf("LinkSetUp: %v", err)
		}
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
		var sc []byte
		var lsrc string

		// Simple heuristic to check if we got JSON strings from the command line
		if strings.HasPrefix(strings.TrimSpace(*staticConfig), "{") {
			sc = []byte(*staticConfig)
			lsrc = "-static_network_config <string>"
		} else {
			sc, err = os.ReadFile(*staticConfig)
			if err != nil {
				log.Fatal(err)
			}

			lsrc = fmt.Sprintf("-static_network_config=%s", *staticConfig)
		}

		var l dhcp4.Lease
		if err := json.Unmarshal(sc, &l); err != nil {
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

		if err := applyLease(nl, *ifname, lsrc, l, *extraRoutePriority); err != nil {
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

		if err := applyLease(nl, *ifname, "DHCPACK", lease, *extraRoutePriority); err != nil {
			log.Fatal(err)
		}

		time.Sleep(lease.RenewalTime)
	}
}
