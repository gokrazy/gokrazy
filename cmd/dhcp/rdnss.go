package main

import (
	"fmt"
	"log"
	"net"
	"net/netip"
	"strings"
	"sync"
	"time"

	"github.com/mdlayher/ndp"
	"github.com/vishvananda/netlink/nl"
	"golang.org/x/sys/unix"
)

// The kernel processes IPv6 router advertisements (SLAAC) itself, but passes
// options it does not handle, like RDNSS (RFC 8106), to user space as
// RTM_NEWNDUSEROPT netlink messages. See ndisc_ra_useropt() in
// net/ipv6/ndisc.c.

const (
	sizeofNDUserOptMsg = 16 // struct nduseroptmsg

	icmpv6RouterAdvertisement = 134
	sizeofRouterAdvertisement = 16 // ICMPv6 header and fixed fields

	// maxNameservers is the number of nameserver lines resolvers (glibc, musl
	// and Go’s net package) consider.
	maxNameservers = 3
)

// parseNDUserOpt parses the payload of an RTM_NEWNDUSEROPT netlink message
// (struct nduseroptmsg followed by the ND options) and returns the interface
// index and the options. Messages which do not stem from a router
// advertisement result in no options.
func parseNDUserOpt(b []byte) (int, []ndp.Option, error) {
	if len(b) < sizeofNDUserOptMsg {
		return 0, nil, fmt.Errorf("nduseroptmsg too short: %d < %d", len(b), sizeofNDUserOptMsg)
	}
	var (
		family   = b[0]
		optsLen  = int(nl.NativeEndian().Uint16(b[2:4]))
		icmpType = b[8]
		icmpCode = b[9]
	)
	ifindex := int(int32(nl.NativeEndian().Uint32(b[4:8])))
	if family != unix.AF_INET6 || icmpType != icmpv6RouterAdvertisement || icmpCode != 0 {
		return ifindex, nil, nil
	}
	b = b[sizeofNDUserOptMsg:]
	if len(b) < optsLen {
		return ifindex, nil, fmt.Errorf("ND options truncated: %d < %d", len(b), optsLen)
	}
	// Package ndp parses complete messages only, so put the options into an
	// otherwise empty router advertisement.
	ra := make([]byte, sizeofRouterAdvertisement, sizeofRouterAdvertisement+optsLen)
	ra[0] = icmpv6RouterAdvertisement
	m, err := ndp.ParseMessage(append(ra, b[:optsLen]...))
	if err != nil {
		return ifindex, nil, err
	}
	return ifindex, m.(*ndp.RouterAdvertisement).Options, nil
}

// raEntry is a nameserver learned from a router advertisement.
type raEntry struct {
	value string // nameserver address (with %zone if link-local)

	// expiry is zero for an infinite lifetime. In production, expiry is
	// derived from time.Now() and thus carries a monotonic clock reading, so
	// the clock being set by NTP after boot does not expire entries early.
	expiry time.Time
}

func (e raEntry) usable(now time.Time) bool {
	return e.expiry.IsZero() || now.Before(e.expiry)
}

// updateEntries applies values with the given lifetime to entries and reports
// whether the set of usable values changed, as opposed to only their lifetime
// being refreshed. Known values keep their position, so that refreshes do not
// reorder resolv.conf.
func updateEntries(entries []raEntry, values []string, lifetime time.Duration, now time.Time) (_ []raEntry, changed bool) {
	for _, value := range values {
		idx := -1
		for i, e := range entries {
			if e.value == value {
				idx = i
				break
			}
		}
		wasUsable := idx > -1 && entries[idx].usable(now)
		if lifetime == 0 {
			// RFC 8106: lifetime 0 means stop using this value
			if idx > -1 {
				entries = append(entries[:idx], entries[idx+1:]...)
			}
			changed = changed || wasUsable
			continue
		}
		e := raEntry{value: value}
		if lifetime != ndp.Infinity {
			e.expiry = now.Add(lifetime)
		}
		if idx > -1 {
			entries[idx] = e
		} else {
			entries = append(entries, e)
		}
		changed = changed || !wasUsable
	}
	return entries, changed
}

// pruneEntries removes expired entries.
func pruneEntries(entries []raEntry, now time.Time) []raEntry {
	result := entries[:0]
	for _, e := range entries {
		if e.usable(now) {
			result = append(result, e)
		}
	}
	return result
}

// resolvState holds the nameservers learned via DHCPv4 and via IPv6 router
// advertisements, so that neither source clobbers the other
// when writing /tmp/resolv.conf.
type resolvState struct {
	mu     sync.Mutex
	domain string
	v4     []net.IP
	v6     []raEntry

	// leased is set once the first DHCPv4 lease (or the static config) was
	// applied. Before that, resolv.conf is not written.
	leased bool
	// wroteRA is set if the last written resolv.conf listed nameservers from
	// router advertisements.
	wroteRA bool

	// writeFile defaults to writeResolvConf and is overridden in tests.
	writeFile func(contents []byte) error
}

func newResolvState() *resolvState {
	return &resolvState{
		writeFile: writeResolvConf,
	}
}

var resolv = newResolvState()

func (s *resolvState) setLease(domain string, dns []net.IP) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.domain = domain
	s.v4 = dns
	s.leased = true
}

// updateRDNSS applies an RDNSS option received on interface ifname at now. It
// returns whether the set of usable IPv6 nameservers changed.
func (s *resolvState) updateRDNSS(ifname string, opt *ndp.RecursiveDNSServer, now time.Time) (changed bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	addrs := make([]string, 0, len(opt.Servers))
	for _, addr := range opt.Servers {
		if !validNameserver(addr) {
			continue
		}
		if addr.IsLinkLocalUnicast() {
			addr = addr.WithZone(ifname)
		}
		addrs = append(addrs, addr.String())
	}
	s.v6, changed = updateEntries(s.v6, addrs, opt.Lifetime, now)
	return changed
}

// validNameserver reports whether addr, taken from an RDNSS option, can be
// used as an IPv6 nameserver.
func validNameserver(addr netip.Addr) bool {
	return addr.Is6() &&
		!addr.Is4In6() &&
		!addr.IsUnspecified() &&
		!addr.IsLoopback() &&
		!addr.IsMulticast()
}

// render returns the contents of resolv.conf and how many nameservers it
// lists in total and from router advertisements. render must be called with
// s.mu held.
//
// IPv4 nameservers come first so that devices which work with DHCPv4 today
// keep working, followed by IPv6 nameservers, up to maxNameservers in total.
// If there are IPv6 nameservers, one slot is reserved for them.
func (s *resolvState) render(now time.Time) (contents []byte, nameservers, fromRA int) {
	lines := []string{
		"# generated by gokrazy/dhcp",
	}
	if domain := s.domain; domain != "" {
		lines = append(lines, fmt.Sprintf("domain %s", domain))
		lines = append(lines, fmt.Sprintf("search %s", domain))
	}
	var v6 []string
	for _, e := range s.v6 {
		if e.usable(now) {
			v6 = append(v6, e.value)
		}
	}
	v4 := s.v4
	if len(v6) > 0 && len(v4) >= maxNameservers {
		v4 = v4[:maxNameservers-1]
	}
	var addrs []string
	for _, ns := range v4 {
		addrs = append(addrs, ns.String())
	}
	addrs = append(addrs, v6...)
	if len(addrs) > maxNameservers {
		addrs = addrs[:maxNameservers]
	}
	for _, addr := range addrs {
		lines = append(lines, "nameserver "+addr)
	}
	return []byte(strings.Join(lines, "\n") + "\n"), len(addrs), max(len(addrs)-len(v4), 0)
}

// write prunes expired entries, then renders and writes resolv.conf.
//
// Nothing is written before the first lease was applied: until then,
// /tmp/resolv.conf stays the /proc/net/pnp symlink in place at boot, and the
// first write lists the IPv4 and IPv6 nameservers together. Like before RDNSS
// support, a resolv.conf without nameservers is not written, unless it
// replaces one listing nameservers from router advertisements, which must no
// longer be used.
func (s *resolvState) write(now time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.v6 = pruneEntries(s.v6, now)
	if !s.leased {
		return nil
	}
	contents, nameservers, fromRA := s.render(now)
	if nameservers == 0 && !s.wroteRA {
		return nil
	}
	if err := s.writeFile(contents); err != nil {
		return err
	}
	s.wroteRA = fromRA > 0
	return nil
}

// listenRDNSS subscribes to ND user options passed on by the kernel. The
// returned function updates resolv.conf whenever a router advertisement on
// ifname carries RDNSS options, and should be run in a goroutine.
func listenRDNSS(ifname string) (func(), error) {
	s, err := nl.Subscribe(unix.NETLINK_ROUTE, unix.RTNLGRP_ND_USEROPT)
	if err != nil {
		return nil, fmt.Errorf("subscribing to ND user options: %v", err)
	}
	return func() { receiveRDNSS(s, ifname) }, nil
}

func lifetimeString(lifetime time.Duration) string {
	if lifetime == ndp.Infinity {
		return "infinite"
	}
	return lifetime.String()
}

func receiveRDNSS(s *nl.NetlinkSocket, ifname string) {
	defer s.Close()
	for {
		msgs, from, err := s.Receive()
		if err == unix.ENOBUFS {
			// Receive buffer overrun: messages were dropped, but the router
			// re-sends its advertisements periodically.
			continue
		}
		if err != nil {
			log.Printf("not using IPv6 RDNSS: receiving ND user options: %v", err)
			return
		}
		if from.Pid != 0 {
			continue // not from the kernel
		}
		intf, err := net.InterfaceByName(ifname)
		if err != nil {
			log.Print(err)
			continue
		}
		changed := false
		for _, m := range msgs {
			if m.Header.Type != unix.RTM_NEWNDUSEROPT {
				continue
			}
			ifindex, opts, err := parseNDUserOpt(m.Data)
			if err != nil {
				log.Printf("parsing ND user option: %v", err)
				continue
			}
			if ifindex != intf.Index {
				continue
			}
			for _, opt := range opts {
				rdnss, ok := opt.(*ndp.RecursiveDNSServer)
				if !ok {
					continue
				}
				if resolv.updateRDNSS(ifname, rdnss, time.Now()) {
					log.Printf("router advertisement: RDNSS %v (lifetime %s)", rdnss.Servers, lifetimeString(rdnss.Lifetime))
					changed = true
				}
			}
		}
		if !changed {
			continue
		}
		if err := resolv.write(time.Now()); err != nil {
			log.Printf("writing resolv.conf: %v", err)
		}
	}
}
