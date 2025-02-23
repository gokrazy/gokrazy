package gokrazy

import (
	"fmt"
	"time"
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
// net-route and net-online conditions instead of just waiting
// for the clock regardless of condition.
func WaitFor(things ...string) {
	// Wait in sequence (but we might wait concurrently in the future).
	for _, thing := range things {
		switch thing {
		case "clock":
			waitForClock()
		case "net-route":
			waitForClock() // TODO: implement net-route check
		case "net-online":
			waitForClock() // TODO: implement net-online check
		default:
			panic(fmt.Sprintf("BUG: gokrazy.WaitFor(%q) unknown", thing))
		}
	}
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
