// Boot and Supervise are called by the auto-generated init
// program. They are provided in case you need to implement a custom
// init program.
//
// PrivateInterfaceAddrs is useful for init and other processes.
//
// DontStartOnBoot and WaitForClock are useful for non-init processes.
package gokrazy

import (
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"time"

	"github.com/gokrazy/gokrazy/internal/iface"

	"golang.org/x/sys/unix"
)

var (
	buildTimestamp = "uninitialized"
	httpPassword   string
	hostname       string
)

func configureLoopback() error {
	cs, err := iface.NewConfigSocket("lo")
	if err != nil {
		return fmt.Errorf("config socket: %v", err)
	}
	defer cs.Close()

	if err := cs.Up(); err != nil {
		return err
	}

	if err := cs.SetAddress(net.IP([]byte{127, 0, 0, 1})); err != nil {
		return err
	}

	return cs.SetNetmask(net.IPMask([]byte{255, 0, 0, 0}))
}

// Boot configures basic system settings. More specifically, it:
//
//   - mounts /dev, /tmp, /proc, /sys and /perm file systems
//   - mounts and populate /etc tmpfs overlay
//   - sets hostname from the /hostname file
//   - sets HTTP password from the gokr-pw.txt file
//   - configures the loopback network interface
//
// Boot should always be called to transition the machine into a
// useful state, even in custom init process implementations or
// single-process applications.
//
// userBuildTimestamp will be exposed on the HTTP status handlers that
// are set up by Supervise.
func Boot(userBuildTimestamp string) error {
	buildTimestamp = userBuildTimestamp

	if err := mountfs(); err != nil {
		return err
	}

	hostnameb, err := ioutil.ReadFile("/hostname")
	if err != nil {
		return err
	}
	if err := unix.Sethostname(hostnameb); err != nil {
		return err
	}
	hostname = string(hostnameb)

	pw, err := ioutil.ReadFile("/perm/gokr-pw.txt")
	if err != nil {
		pw, err = ioutil.ReadFile("/gokr-pw.txt")
		if err != nil {
			return fmt.Errorf("could read neither /perm/gokr-pw.txt nor /gokr-pw.txt: %v", err)
		}
	}

	httpPassword = strings.TrimSpace(string(pw))

	if err := configureLoopback(); err != nil {
		return err
	}

	return nil
}

// Supervise continuously restarts the processes specified in commands
// unless they run DontStartOnBoot.
//
// Password-protected HTTP handlers are installed, allowing to inspect
// the supervised services and update the gokrazy installation over
// the network.
//
// HTTP is served on PrivateInterfaceAddrs(). New IP addresses will be
// picked up upon receiving SIGHUP.
func Supervise(commands []*exec.Cmd) error {
	services := make([]*service, len(commands))
	for idx, cmd := range commands {
		services[idx] = &service{cmd: cmd}
	}
	superviseServices(services)

	initStatus(services)

	if err := initUpdate(); err != nil {
		return err
	}

	if err := updateListeners("80"); err != nil {
		return fmt.Errorf("updating listeners: %v", err)
	}

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, unix.SIGHUP)

		for range c {
			if err := updateListeners("80"); err != nil {
				log.Printf("updating listeners: %v", err)
			}
		}
	}()

	return nil
}

// WaitForClock returns once the system clock appears to have been
// set. Assumes that the system boots with a clock value of January 1,
// 1970 UTC (UNIX epoch), as is the case on the Raspberry Pi 3.
func WaitForClock() {
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

// DontStartOnBoot informs the gokrazy init process to not supervise
// the process and exits. The user can manually start supervision,
// which turns DontStartOnBoot into a no-op.
func DontStartOnBoot() {
	if os.Getenv("GOKRAZY_FIRST_START") == "1" {
		os.Exit(125)
	}
}
