// Boot and Supervise are called by the auto-generated init
// program. They are provided in case you need to implement a custom
// init program.
//
// PrivateInterfaceAddrs is useful for init and other processes.
//
// DontStartOnBoot and WaitForClock are useful for non-init processes.
package gokrazy

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/mdlayher/watchdog"
	"golang.org/x/sys/unix"

	"github.com/gokrazy/gokrazy/internal/iface"
	"github.com/gokrazy/internal/rootdev"
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

// runWatchdog periodically pings the hardware watchdog.
func runWatchdog() {
	d, err := watchdog.Open()
	if err != nil {
		log.Printf("disabling hardware watchdog, as it could not be opened: %v", err)
		return
	}
	defer d.Close()

	var timeout string
	if t, err := d.Timeout(); err != nil {
		// Assume the device cannot report the watchdog timeout.
		timeout = "unknown"
	} else {
		timeout = t.String()
	}

	log.Printf("found hardware watchdog %q with timeout %s, pinging...", d.Identity, timeout)

	for {
		if err := d.Ping(); err != nil {
			log.Printf("hardware watchdog ping failed: %v", err)
		}
		time.Sleep(1 * time.Second)
	}
}

func setupTLS() error {
	if _, err := os.Stat("/etc/ssl/gokrazy-web.pem"); os.IsNotExist(err) {
		return nil // Nothing to set up
	}
	cert, err := tls.LoadX509KeyPair("/etc/ssl/gokrazy-web.pem", "/etc/ssl/gokrazy-web.key.pem")
	if err != nil {
		return fmt.Errorf("failed loading certificate: %v", err)
	}
	useTLS = true
	tlsConfig = &tls.Config{
		Certificates:             []tls.Certificate{cert},
		MinVersion:               tls.VersionTLS12,
		CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
		PreferServerCipherSuites: true,
		CipherSuites: []uint16{
			// required for http/2
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
			// See https://cipherlist.eu/
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
		},
	}
	return nil
}

// readConfigFile reads configuration files from /perm /etc or / and returns trimmed content as string
func readConfigFile(fileName string) (string, error) {
	str, err := ioutil.ReadFile("/perm/" + fileName)
	if err != nil {
		str, err = ioutil.ReadFile("/etc/" + fileName)
	}
	if err != nil && os.IsNotExist(err) {
		str, err = ioutil.ReadFile("/" + fileName)
	}

	return strings.TrimSpace(string(str)), err
}

// readPortFromConfigFile reads port from config file
func readPortFromConfigFile(fileName, defaultPort string) string {
	port, err := readConfigFile(fileName)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("reading %s failed: %v", fileName, err)
		}
		return defaultPort
	}

	if _, err := strconv.Atoi(port); err != nil {
		log.Printf("invalid port in %s: %v", fileName, err)
		return defaultPort
	}

	return port
}

func switchToInactiveRoot() error {
	// mount the inactive root partition on a temporary mountpoint
	tmpmnt := filepath.Join(os.TempDir(), "mnt")
	if err := os.MkdirAll(tmpmnt, 0755); err != nil {
		return err
	}

	if err := syscall.Mount(rootdev.Partition(rootdev.InactiveRootPartition()), tmpmnt, "squashfs", syscall.MS_RDONLY, ""); err != nil {
		return fmt.Errorf("mount inactive root: %v", err)
	}

	if err := os.Chdir(tmpmnt); err != nil {
		return fmt.Errorf("chdir: %v", err)
	}

	if err := syscall.Mount(".", "/", "", syscall.MS_MOVE, ""); err != nil {
		return fmt.Errorf("mount . /: %v", err)
	}

	if err := syscall.Chroot("."); err != nil {
		return fmt.Errorf("chroot .: %v", err)
	}

	if err := os.Chdir("/"); err != nil {
		return fmt.Errorf("chdir: %v", err)
	}

	if err := syscall.Exec("/gokrazy/init", []string{"/gokrazy/init"}, os.Environ()); err != nil {
		return fmt.Errorf("exec(init): %v", err)
	}
	return nil
}

func maybeSwitchToInactive() {
	cmdline, err := readCmdline()
	if err != nil {
		log.Print(err)
		return
	}

	if !strings.Contains(string(cmdline), "gokrazy.try_boot_inactive=1") {
		return
	}
	log.Printf("switching to inactive root partition")

	// update the cmdline to have the device boot into the old environment next time
	if err := modifyCmdline(func(b []byte) []byte {
		return bytes.ReplaceAll(b,
			[]byte("gokrazy.try_boot_inactive=1"),
			[]byte("gokrazy.switch_on_boot=1"))
	}); err != nil {
		log.Print(err)
		return
	}

	// switch to the inactive root partition instead
	if err := switchToInactiveRoot(); err != nil {
		log.Print(err)
		return
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
	// TODO: think about whether the watchdog needs a different setup during the
	// update process
	go runWatchdog()

	buildTimestamp = userBuildTimestamp

	if err := mountfs(); err != nil {
		return err
	}

	maybeSwitchToInactive()

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

	pw, err := readConfigFile("gokr-pw.txt")
	if err != nil {
		return fmt.Errorf("could read neither /perm/gokr-pw.txt, nor /etc/gokr-pw.txt, nor /gokr-pw.txt: %v", err)
	}
	httpPassword = pw

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
	if err := updateListeners(httpPort, httpsPort, useTLS, nil); err != nil {
		return err
	}
	if useTLS {
		if err := updateListeners(httpsPort, "", useTLS, tlsConfig); err != nil {
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

// Service is a gokrazy service.
type Service struct {
	// TODO: refactor the fields of service into this type, but
	// visibility-restricted.
	s *service
}

// NewService constructs a new gokrazy service from the specified command.
func NewService(cmd *exec.Cmd) *Service {
	return &Service{&service{cmd: cmd}}
}

// NewStoppedService is like NewService, but the created gokrazy service will
// not be supervised, i.e. remain stopped on boot.
func NewStoppedService(cmd *exec.Cmd) *Service {
	return &Service{&service{cmd: cmd, stopped: true}}
}

// NewWaitForClockService is like NewService, but the created gokrazy service
// will wait for clock to be synchronized, i.e. blocked till the clock is accurate.
func NewWaitForClockService(cmd *exec.Cmd) *Service {
	return &Service{&service{cmd: cmd, waitForClock: true}}
}

// Supervise runs SuperviseServices, creating services from commands.
//
// Deprecated: newer versions of gokr-packer run gokrazy.SuperviseServices()
// instead
func Supervise(commands []*exec.Cmd) error {
	services := make([]*Service, len(commands))
	for idx, cmd := range commands {
		services[idx] = &Service{&service{cmd: cmd}}
	}
	return SuperviseServices(services)
}

// SuperviseServices continuously restarts the processes specified in services
// unless they run DontStartOnBoot.
//
// Password-protected HTTP handlers are installed, allowing to inspect
// the supervised services and update the gokrazy installation over
// the network.
//
// HTTP is served on PrivateInterfaceAddrs(). New IP addresses will be
// picked up upon receiving SIGHUP.
func SuperviseServices(services []*Service) error {
	unwrapped := make([]*service, len(services))
	for idx, svc := range services {
		unwrapped[idx] = svc.s
	}

	initStatus()

	if err := initUpdate(); err != nil {
		return err
	}

	httpPort := readPortFromConfigFile("http-port.txt", "80")
	httpsPort := readPortFromConfigFile("https-port.txt", "443")

	if err := updateListenerPairs(httpPort, httpsPort, useTLS, tlsConfig); err != nil {
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
					if err := updateListenerPairs(httpPort, httpsPort, useTLS, tlsConfig); err != nil {
						log.Printf("updating listeners: %v", err)
					}
				}
			}
		}()
	} else {
		log.Printf("cannot listen for new IP addresses: %v", err)
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, unix.SIGHUP)
	go func() {
		for range c {
			if err := updateListenerPairs(httpPort, httpsPort, useTLS, tlsConfig); err != nil {
				log.Printf("updating listeners: %v", err)
			}
		}
	}()

	// Only supervise services after the SIGHUP handler is set up, otherwise a
	// particularly fast dhcp client (e.g. when running in qemu) might send
	// SIGHUP before the signal handler is set up, thereby killing init and
	// panic the system!
	superviseServices(unwrapped)

	go func() {
		buf := make([]byte, 1)
		for {
			if _, err := os.Stdin.Read(buf); err != nil {
				log.Printf("read(stdin): %v", err)
				break
			}

			if err := tryStartShell(); err != nil {
				log.Printf("could not start shell: %v", err)
				if err := updateListenerPairs(httpPort, httpsPort, useTLS, tlsConfig); err != nil {
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
