// Boot and Supervise are called by the auto-generated init
// program. They are provided in case you need to implement a custom
// init program.
//
// PrivateInterfaceAddrs is useful for init and other processes.
//
// DontStartOnBoot and WaitForClock are useful for non-init processes.
package gokrazy

import (
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gokrazy/gokrazy/internal/iface"

	"golang.org/x/sys/unix"
)

var (
	buildTimestamp = "uninitialized"
	httpPassword   string
	hostname       string
	tlsConfig      *tls.Config
	useTLS         bool
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

// watchdog periodically pings the hardware watchdog.
func watchdog() {
	f, err := os.OpenFile("/dev/watchdog", os.O_WRONLY, 0)
	if err != nil {
		log.Printf("disabling hardware watchdog, as it could not be opened: %v", err)
		return
	}
	defer f.Close()
	for {
		if _, _, errno := unix.Syscall(unix.SYS_IOCTL, f.Fd(), unix.WDIOC_KEEPALIVE, 0); errno != 0 {
			log.Printf("hardware watchdog ping failed: %v", errno)
		}
		time.Sleep(1 * time.Second)
	}
}

func setupTLS() error {
	if _, err := os.Stat("/etc/ssl/gokrazy-web.pem"); !os.IsNotExist(err) {
		cert, err := tls.LoadX509KeyPair("/etc/ssl/gokrazy-web.pem", "/etc/ssl/gokrazy-web.key.pem")
		if err != nil {
			return fmt.Errorf("failed loading certificate: %v", err)
		}
		useTLS = true
		// See https://cipherlist.eu/
		tlsConfig = &tls.Config{
			Certificates:             []tls.Certificate{cert},
			MinVersion:               tls.VersionTLS12,
			CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
			PreferServerCipherSuites: true,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
			},
		}
	}
}

// Boot configures basic system settings. More specifically, it:
//
//   - mounts /dev, /tmp, /proc, /sys and /perm file systems
//   - mounts and populate /etc tmpfs overlay
//   - sets hostname from the /etc/hostname file
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
	go watchdog()

	buildTimestamp = userBuildTimestamp

	if err := mountfs(); err != nil {
		return err
	}

	hostnameb, err := ioutil.ReadFile("/etc/hostname")
	if err != nil && os.IsNotExist(err) {
		hostnameb, err = ioutil.ReadFile("/hostname")
	}
	if err != nil {
		return err
	}
	if err := unix.Sethostname(hostnameb); err != nil {
		return err
	}
	hostname = string(hostnameb)

	pw, err := ioutil.ReadFile("/perm/gokr-pw.txt")
	if err != nil {
		pw, err = ioutil.ReadFile("/etc/gokr-pw.txt")
	}
	if err != nil && os.IsNotExist(err) {
		pw, err = ioutil.ReadFile("/gokr-pw.txt")
	}
	if err != nil {
		return fmt.Errorf("could read neither /perm/gokr-pw.txt, nor /etc/gokr-pw.txt, nor /gokr-pw.txt: %v", err)
	}

	httpPassword = strings.TrimSpace(string(pw))

	if err := configureLoopback(); err != nil {
		return err
	}

	initRemoteSyslog()
    if err := setupTLS(); err != nil {
    	return err
	}

	return nil
}

func updateListenerPairs(httpPort, httpsPort string, useTLS bool, tlsConfig *tls.Config) error {
	if err := updateListeners(httpPort, useTLS, nil); err != nil {
		return err
	}
	if useTLS {
		if err := updateListeners(httpsPort, useTLS, tlsConfig); err != nil {
			return err
		}
	}
	return nil
}

func tryStartShell() error {
	var lastErr error
	for _, shell := range []string{
		"/tmp/serial-busybox/ash",
		"/perm/sh",
	} {
		_, err := os.Stat(shell)
		lastErr = err
		if err != nil {
			continue
		}
		log.Printf("starting shell %s upon input on serial console", shell)
		sh := exec.Command(shell)
		sh.Stdin = os.Stdin
		sh.Stdout = os.Stdout
		sh.Stderr = os.Stderr
		if err := sh.Run(); err != nil {
			log.Printf("sh: %v", err)
			lastErr = err
		}
		return nil
	}
	return lastErr
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

	if err := updateListenerPairs("80", "443", useTLS, tlsConfig); err != nil {
		return fmt.Errorf("updating listeners: %v", err)
	}

	if nl, err := listenNetlink(); err == nil {
		go func() {
			for {
				msgs, err := nl.ReadMsgs()
				if err != nil {
					log.Printf("netlink.ReadMsgs: %v", err)
					return
				}

				for _, m := range msgs {
					if m.Header.Type != syscall.RTM_NEWADDR &&
						m.Header.Type != syscall.RTM_DELADDR {
						continue
					}
					if err := updateListenerPairs("80", "443", useTLS, tlsConfig); err != nil {
						log.Printf("updating listeners: %v", err)
					}
				}
			}
		}()
	} else {
		log.Printf("cannot listen for new IP addresses: %v", err)
	}

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, unix.SIGHUP)

		for range c {
			if err := updateListenerPairs("80", "443", useTLS, tlsConfig); err != nil {
				log.Printf("updating listeners: %v", err)
			}
		}
	}()

	go func() {
		buf := make([]byte, 1)
		for {
			if _, err := os.Stdin.Read(buf); err != nil {
				log.Printf("read(stdin): %v", err)
				break
			}

			if err := tryStartShell(); err != nil {
				log.Printf("could not start shell: %v", err)
				if err := updateListenerPairs("80", "443", useTLS, tlsConfig); err != nil {
					log.Printf("updating listeners: %v", err)
				}
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
