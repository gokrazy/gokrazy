package gokrazy

import (
	"errors"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/vishvananda/netlink"
)

// WaitFor allows waiting for one or more conditions to be true.
// The currently defined conditions are:
//
//   - clock: Wait for the system clock to be set, signaling
//     that devices like the Raspberry Pi (which loses the time
//     when power is lost and boots with the clock set to
//     January 1, 1970 UTC (UNIX epoch)) have obtained the
//     current time via NTP. On machines that boot with a
//     correct time, such as most PCs, this is a no-op.
//   - net-route: Wait for a default route to be installed,
//     signaling that local network connectivity is available
//     (typically via DHCP, or statically configured). Note
//     that while the local network may be up, internet connectivity
//     might not be available (see net-online), for example
//     right after a power outage.
//   - net-online: wait for a connectivity check to succeed
//
// TODO(https://github.com/gokrazy/gokrazy/issues/168): implement
// net-online connectivity check
func WaitFor(things ...string) {
	if len(things) == 0 {
		return // skip log messages for no-op waits
	}

	start := time.Now()
	// Wait in sequence (but we might wait concurrently in the future).
	for _, thing := range things {
		switch thing {
		case "clock":
			log.Printf("waiting for clock")
			waitForClock()
		case "net-route":
			log.Printf("waiting for net-route")
			waitForNetRoute()
		case "net-online":
			log.Printf("waiting for net-online")
			waitForNetRoute() // TODO: implement net-online check
		default:
			panic(fmt.Sprintf("BUG: gokrazy.WaitFor(%q) unknown", thing))
		}
	}
	log.Printf("done waiting after %v", time.Since(start))
}

// WaitForClock returns once the system clock appears to have been set.
//
// New usages should prefer directly calling WaitFor("clock") instead.
func WaitForClock() {
	WaitFor("clock")
}

func waitForClock() {
	epochPlus1Year := time.Unix(60*60*24*365, 0)
	for {
		if time.Now().After(epochPlus1Year) {
			return
		}
		// Sleeps for 1 real second, regardless of wall-clock time.
		// See https://github.com/golang/proposal/blob/master/design/12914-monotonic.md
		time.Sleep(1 * time.Second)
	}
}

var errNoDefaultRoute = errors.New("no default route found")

func waitForNetRoute1() error {
	nl, err := netlink.NewHandle(netlink.FAMILY_V4)
	if err != nil {
		return fmt.Errorf("netlink.New: %v", err)
	}
	defer nl.Delete()
	// This is the address of k.root-servers.net,
	// but it does not matter; we just need an IP address
	// that will not be null-routed explicitly, so avoid
	// public DNS server addresses in case any filtering
	// software blocks these.
	arbitraryIP := net.ParseIP("193.0.14.129")
	routes, err := nl.RouteGet(arbitraryIP)
	if err != nil {
		return fmt.Errorf("RouteGet(%v): %v", arbitraryIP, err)
	}
	// We are looking for a route with a gateway, e.g.:
	// [{Ifindex: 3 Dst: 193.0.14.129/32 Src: 10.0.0.135 Gw: 10.0.0.1 Flags: [] Table: 254}]
	for _, route := range routes {
		if route.Gw.IsUnspecified() {
			continue
		}
		return nil // stop waiting, route with gateway found
	}
	return errNoDefaultRoute
}

func waitForNetRoute() {
	for {
		if err := waitForNetRoute1(); err != nil {
			log.Printf("waiting for net-route: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}
		break // no error, wait succeeded
	}
}
