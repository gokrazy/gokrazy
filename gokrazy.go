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
	httpPassword   string // or empty to only permit unix socket access
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

	log.Printf("cmdline: %s", string(cmdline))

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

	if err := loadModules(); err != nil {
		log.Printf("loading modules: %v", err)
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

	if _, err := os.Stat("/etc/gokr-pw.txt"); os.IsNotExist(err) {
		// This instance was built with the NoPassword option
		// (because there is no password file in the root fs),
		// so do not read a password from any location.
	} else {
		httpPassword, err = readConfigFile("gokr-pw.txt")
		if err != nil {
			return err
		}
	}

	if err := configureLoopback(); err != nil {
		return err
	}

	initRemoteSyslog()
	if err := setupTLS(); err != nil {
		return err
	}

	// create /dev/serial0 symlink in /dev, which was mounted by mountfs() earlier
	if err := createSerialSymlink(); err != nil {
		log.Printf("creating serial symlink failed: %v", err)
	}

	// create a /dev/ttyAMA0 symlink to /dev/ttyS0 so that software which does
	// not yet use /dev/serial0 keeps working without changes.
	if err := os.Symlink("/dev/ttyS0", "/dev/ttyAMA0"); err != nil && !os.IsExist(err) {
		log.Printf("creating compatibility symlink /dev/ttyAMA0 -> /dev/ttyS0 failed: %v", err)
	}

	if err := pollPowerButtons(); err != nil {
		log.Printf("polling power buttons: %v", err)
	}

	return nil
}

func createSerialSymlink() error {
	uart0, uart0err := ioutil.ReadFile("/proc/device-tree/aliases/uart0")
	uart1, uart1err := ioutil.ReadFile("/proc/device-tree/aliases/uart1")
	serial0, serial0err := ioutil.ReadFile("/proc/device-tree/aliases/serial0")
	if uart0err == nil && serial0err == nil && bytes.Equal(uart0, serial0) {
		// old kernel (before https://github.com/gokrazy/gokrazy/issues/49)
		return os.Symlink("/dev/ttyAMA0", "/dev/serial0")
	} else if os.IsNotExist(uart1err) ||
		(uart1err == nil && serial0err == nil && bytes.Equal(uart1, serial0)) {
		// new kernel (after https://github.com/gokrazy/gokrazy/issues/49)
		return os.Symlink("/dev/ttyS0", "/dev/serial0")
	}
	return fmt.Errorf("unexpected device tree state: uart0=%s, %v / uart1=%s, %v / serial0=%s, %v", string(uart0), uart0err, string(uart1), uart1err, string(serial0), serial0err)
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

// By default, stdio is open on /dev/console which cannot be a controlling tty
// so set up stdio on a normal tty (e.g. tty1, ttyS0, ttyAMA0)
// See https://busybox.net/FAQ.html#job_control
func runWithCtty(shell string) error {
	// find TTY device connected to /dev/console
	// https://www.kernel.org/doc/Documentation/ABI/testing/sysfs-tty
	buf, err := ioutil.ReadFile("/sys/class/tty/console/active")
	if err != nil {
		return err
	}

	devs := strings.Split(strings.TrimSpace(string(buf)), " ")
	ttyDev := "/dev/" + devs[len(devs)-1]

	stdin, err := os.OpenFile(ttyDev, os.O_RDWR, 0600)
	if err != nil {
		return fmt.Errorf("stdin: %v", err)
	}
	defer stdin.Close()

	stdout, err := os.OpenFile(ttyDev, os.O_RDWR, 0600)
	if err != nil {
		return fmt.Errorf("stdout: %v", err)
	}
	defer stdout.Close()

	stderr, err := os.OpenFile(ttyDev, os.O_RDWR, 0600)
	if err != nil {
		return fmt.Errorf("stderr: %v", err)
	}
	defer stderr.Close()

	sh := exec.Command(shell)
	sh.Stdin = stdin
	sh.Stdout = stdout
	sh.Stderr = stderr
	sh.SysProcAttr = &syscall.SysProcAttr{
		Setsid:  true,
		Setctty: true,
		Ctty:    0,
	}

	return sh.Run()
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

		if err := runWithCtty(shell); err != nil {
			log.Printf("runWithCtty: %v", err)
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

func newService(cmd *exec.Cmd, stopped, waitForClock bool) *Service {
	s := &service{
		cmd:          cmd,
		stopped:      stopped,
		waitForClock: waitForClock,
	}

	s.state = NewProcessState()

	tag := filepath.Base(s.Cmd().Path)
	s.Stdout = newLogWriter(tag)
	s.Stderr = newLogWriter(tag)

	return &Service{s}
}

// NewService constructs a new gokrazy service from the specified command.
func NewService(cmd *exec.Cmd) *Service {
	return newService(cmd, false, false)
}

// NewStoppedService is like NewService, but the created gokrazy service will
// not be supervised, i.e. remain stopped on boot.
func NewStoppedService(cmd *exec.Cmd) *Service {
	return newService(cmd, true, false)
}

// NewWaitForClockService is like NewService, but the created gokrazy service
// will wait for clock to be synchronized, i.e. blocked till the clock is accurate.
func NewWaitForClockService(cmd *exec.Cmd) *Service {
	return newService(cmd, false, true)
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

	var err error
	lastInstalledEepromVersion, err = readLastInstalledEepromVersion()
	if err != nil {
		log.Printf("getting EEPROM version: %v", err)
	}

	initStatus()
	setupDeviceSpecifics()

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

	listenForSignals(func() {
		if err := updateListenerPairs(httpPort, httpsPort, useTLS, tlsConfig); err != nil {
			log.Printf("updating listeners: %v", err)
		}
	})

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

// DontStartOnBoot informs the gokrazy init process to not supervise
// the process and exits. The user can manually start supervision,
// which turns DontStartOnBoot into a no-op.
func DontStartOnBoot() {
	if os.Getenv("GOKRAZY_FIRST_START") == "1" {
		os.Exit(125)
	}
}
