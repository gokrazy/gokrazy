// ntp is a minimal NTP client for gokrazy.
package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/beevik/ntp"
)

const timefilePath = "ntp-time-at-last-shutdown" // Our process is started in /perm/home/ntp.

const dhcpNTPServersPath = "/tmp/ntp-servers"

var defaultServers = []string{
	"0.gokrazy.pool.ntp.org",
	"1.gokrazy.pool.ntp.org",
	"2.gokrazy.pool.ntp.org",
	"3.gokrazy.pool.ntp.org",
}

var (
	servers    = defaultServers
	cliServers bool
	lastSource string

	dhcpFailures     int
	dhcpFallbackTill time.Time
)

// After this many consecutive failed queries to DHCP-provided servers, the
// default pool is used for dhcpFallbackDuration before they are tried again.
const (
	dhcpFailureThreshold = 5
	dhcpFallbackDuration = 10 * time.Minute
)

func setTimeOfDay(t time.Time, source string) error {
	tv := syscall.NsecToTimeval(t.UnixNano())
	if err := syscall.Settimeofday(&tv); err != nil {
		return fmt.Errorf("syscall.Settimeofday(%v): %v", tv, err)
	}
	log.Printf("clock set to %v (from %s)", t, source)
	return nil
}

func readDHCPServers() []string {
	b, err := os.ReadFile(dhcpNTPServersPath)
	if err != nil {
		return nil
	}
	var servers []string
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if net.ParseIP(line) == nil {
			continue
		}
		servers = append(servers, line)
	}
	log.Printf("NTP servers from %s: %v", dhcpNTPServersPath, servers)
	return servers
}

// updateServers selects which servers to query next and reports whether the
// selected servers come from DHCP.
func updateServers() (fromDHCP bool) {
	if cliServers {
		return false
	}
	source := "default pool"
	s := defaultServers
	if dhcp := readDHCPServers(); len(dhcp) > 0 && time.Now().After(dhcpFallbackTill) {
		source = "DHCP"
		s = dhcp
		fromDHCP = true
	}
	if source != lastSource {
		log.Printf("using NTP servers from %s: %v", source, s)
		lastSource = source
	}
	servers = s
	return fromDHCP
}

func dhcpQueryFailed() {
	dhcpFailures++
	if dhcpFailures < dhcpFailureThreshold {
		return
	}
	dhcpFailures = 0
	dhcpFallbackTill = time.Now().Add(dhcpFallbackDuration)
	log.Printf("DHCP-provided NTP servers unreachable after %d attempts, using default pool for %v",
		dhcpFailureThreshold, dhcpFallbackDuration)
}

func set(rtc *os.File) error {
	fromDHCP := updateServers()
	server := servers[rand.Intn(len(servers))]
	r, err := ntp.Query(server)
	if err != nil {
		if fromDHCP {
			dhcpQueryFailed()
		}
		return err
	}
	dhcpFailures = 0

	if err := setTimeOfDay(r.Time, server); err != nil {
		return fmt.Errorf("setTimeOfDay: %v", err)
	}

	if rtc == nil {
		return nil
	}
	return setRTC(rtc, r.Time.UTC())
}

func loadTime(timefile *os.File) error {
	buf, err := io.ReadAll(timefile)
	if err != nil {
		return fmt.Errorf("io.ReadAll(%v): %v", timefilePath, err)
	}
	var t time.Time
	if err := t.UnmarshalText(buf); err != nil {
		return fmt.Errorf("time.UnmarshalText(%v): %v", string(buf), err)
	}
	// Only step the clock forwards. Machines without a battery-backed real time
	// clock boot at the epoch, so the saved time is later and is restored.
	// Machines that boot with a correct time (PCs, VMs, a Raspberry Pi with an
	// RTC hat) keep it: stepping them back to the last shutdown would make
	// every timestamp wrong until the first NTP query succeeds.
	if now := time.Now().Round(0); !t.After(now) {
		log.Printf("not setting clock to %v (from %s): system clock (%v) is already at or ahead of it", t, timefilePath, now)
		return nil
	}
	if err := setTimeOfDay(t, timefilePath); err != nil {
		return fmt.Errorf("setTimeOfDay: %v", err)
	}
	return nil
}

func saveTime(timefile *os.File) error {
	buf, err := time.Now().MarshalText()
	if err != nil {
		return fmt.Errorf("time.Now().MarshalText: %v", err)
	}
	if err := timefile.Truncate(0); err != nil {
		return fmt.Errorf("timefile.Truncate: %v", err)
	}
	if _, err := timefile.Seek(0, 0); err != nil {
		log.Printf("timefile.Seek(0, 0): %v", err)
	}
	if _, err := timefile.Write(buf); err != nil {
		return fmt.Errorf("timefile.Write(%v): %v", buf, err)
	}
	if err := timefile.Close(); err != nil {
		return fmt.Errorf("timefile.Close: %v", err)
	}
	return nil
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	flag.Parse()

	if len(flag.Args()) > 0 {
		servers = flag.Args()
		cliServers = true
		log.Printf("using command line supplied server list: %v", servers)
	}

	var rtc, timefile *os.File
	var err error
	if os.Getenv("NTP_PRIVILEGES_DROPPED") == "1" {
		var nextFD uintptr = 3
		if os.Getenv("NTP_RTC") == "1" {
			rtc = os.NewFile(nextFD, "/dev/rtc0")
			nextFD++
		}
		if os.Getenv("NTP_TIMEFILE") == "1" {
			timefile = os.NewFile(nextFD, timefilePath)
			nextFD++
		}
	} else {
		rtc, err = os.Open("/dev/rtc0")
		if err != nil && !os.IsNotExist(err) {
			log.Fatal(err)
		}
		timefile, err = os.OpenFile(timefilePath, os.O_RDWR|os.O_CREATE, 0600)
		if err != nil {
			log.Printf("os.Open(%v): %v", timefilePath, err)
		}
		mustDropPrivileges(rtc, timefile) // Never returns.
	}

	if timefile != nil {
		// Save current time at shutdown.
		go func() {
			// Wait for SIGTERM to save time to /perm.
			ch := make(chan os.Signal, 1)
			signal.Notify(ch, syscall.SIGTERM)
			<-ch
			if err := saveTime(timefile); err != nil {
				log.Printf("persisting time to /perm failed: %v", err)
			}
			os.Exit(128 + int(syscall.SIGTERM))
		}()
		// Load time saved at previous shutdown, if any.
		if err := loadTime(timefile); err != nil {
			log.Printf("loadTime: %v", err)
		}
	}

	for {
		// Choose a different jitter in every iteration to minimize
		// thundering herds when multiple hosts boot up without clock or
		// network sources of entropy.
		time.Sleep(time.Duration(rand.Int63n(250)) * time.Millisecond)

		if err := set(rtc); err != nil {
			log.Printf("setting time failed: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}
		time.Sleep(1 * time.Hour)
	}
}
