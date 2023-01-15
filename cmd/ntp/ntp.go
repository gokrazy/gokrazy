// ntp is a minimal NTP client for gokrazy.
package main

import (
	"log"
	"math/rand"
	"os"
	"syscall"
	"time"

	"github.com/beevik/ntp"
)

var servers = []string{
	"0.gokrazy.pool.ntp.org",
	"1.gokrazy.pool.ntp.org",
	"2.gokrazy.pool.ntp.org",
	"3.gokrazy.pool.ntp.org",
}

func set(rtc *os.File) error {
	server := servers[rand.Intn(len(servers))]
	r, err := ntp.Query(server)
	if err != nil {
		return err
	}

	tv := syscall.NsecToTimeval(r.Time.UnixNano())
	if err := syscall.Settimeofday(&tv); err != nil {
		return err
	}
	log.Printf("clock set to %v (from %s)", r.Time, server)

	if rtc == nil {
		return nil
	}
	return setRTC(rtc, r.Time.UTC())
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	var rtc *os.File
	var err error
	if os.Getenv("NTP_PRIVILEGES_DROPPED") == "1" {
		if os.Getenv("NTP_RTC") == "1" {
			rtc = os.NewFile(3, "/dev/rtc0")
		}
	} else {
		rtc, err = os.Open("/dev/rtc0")
		if err != nil && !os.IsNotExist(err) {
			log.Fatal(err)
		}
	}

	mustDropPrivileges(rtc)

	for {
		jitter := time.Duration(rand.Int63n(250)) * time.Millisecond
		if err := set(rtc); err != nil {
			time.Sleep(jitter)
			log.Fatalf("setting time failed: %v", err)
		}
		time.Sleep(1*time.Hour + jitter)
	}
}
