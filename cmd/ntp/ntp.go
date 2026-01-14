// ntp is a minimal NTP client for gokrazy.
package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/beevik/ntp"
)

const timefile = "ntp-time-at-last-shutdown" // Our process is started in /perm/home/ntp.

var servers = []string{
	"0.gokrazy.pool.ntp.org",
	"1.gokrazy.pool.ntp.org",
	"2.gokrazy.pool.ntp.org",
	"3.gokrazy.pool.ntp.org",
}

func setTimeOfDay(t time.Time, source string) error {
	tv := syscall.NsecToTimeval(t.UnixNano())
	if err := syscall.Settimeofday(&tv); err != nil {
		return fmt.Errorf("syscall.Settimeofday(%v): %v", tv, err)
	}
	log.Printf("clock set to %v (from %s)", t, source)
	return nil
}

func set(rtc *os.File) error {
	server := servers[rand.Intn(len(servers))]
	r, err := ntp.Query(server)
	if err != nil {
		return err
	}

	if err := setTimeOfDay(r.Time, server); err != nil {
		return fmt.Errorf("setTimeOfDay: %v", err)
	}

	if rtc == nil {
		return nil
	}
	return setRTC(rtc, r.Time.UTC())
}

func loadTime(cookie *os.File) error {
	buf, err := io.ReadAll(cookie)
	if err != nil {
		return fmt.Errorf("io.ReadAll(%v): %v", timefile, err)
	}
	var t time.Time
	if err := t.UnmarshalText(buf); err != nil {
		return fmt.Errorf("t.UnmarshalText(%v): %v", string(buf), err)
	}
	if err := setTimeOfDay(t, timefile); err != nil {
		return fmt.Errorf("setTimeOfDay: %v", err)
	}
	return nil
}

func saveTime(cookie *os.File) error {
	buf, err := time.Now().MarshalText()
	if err != nil {
		return fmt.Errorf("time.Now().MarshalText: %v", err)
	}
	if err := cookie.Truncate(0); err != nil {
		return fmt.Errorf("cookie.Truncate: %v", err)
	}
	if _, err := cookie.Seek(0, 0); err != nil {
		log.Printf("cookie.Seek(0, 0): %v", err)
	}
	if _, err := cookie.Write(buf); err != nil {
		return fmt.Errorf("cookie.Write(%v): %v", buf, err)
	}
	if err := cookie.Close(); err != nil {
		return fmt.Errorf("cookie.Close: %v", err)
	}
	return nil
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	flag.Parse()

	if len(flag.Args()) > 0 {
		servers = flag.Args()
		log.Printf("using command line supplied server list: %v", servers)
	}

	var rtc, cookie *os.File
	var err error
	if os.Getenv("NTP_PRIVILEGES_DROPPED") == "1" {
		var nextFD uintptr = 3
		if os.Getenv("NTP_RTC") == "1" {
			rtc = os.NewFile(nextFD, "/dev/rtc0")
			nextFD++
		}
		if os.Getenv("NTP_COOKIE") == "1" {
			cookie = os.NewFile(nextFD, timefile)
			nextFD++
		}
	} else {
		rtc, err = os.Open("/dev/rtc0")
		if err != nil && !os.IsNotExist(err) {
			log.Fatal(err)
		}
		cookie, err = os.OpenFile(timefile, os.O_RDWR|os.O_CREATE, 0600)
		if err != nil {
			log.Printf("os.Open(%v): %v", timefile, err)
		}
		mustDropPrivileges(rtc, cookie) // Never returns.
	}

	if cookie != nil {
		// Save current time at shutdown.
		go func() {
			// Wait for SIGTERM to save time to /perm.
			ch := make(chan os.Signal, 1)
			signal.Notify(ch, syscall.SIGTERM)
			<-ch
			if err := saveTime(cookie); err != nil {
				log.Printf("persisting time to /perm failed: %v", err)
			}
			os.Exit(128 + int(syscall.SIGTERM))
		}()
		// Load time saved at previous shutdown, if any.
		if err := loadTime(cookie); err != nil {
			log.Printf("loadTime: %v", err)
		}
	}

	jitter := time.Duration(rand.Int63n(250)) * time.Millisecond
	for {
		time.Sleep(jitter)
		if err := set(rtc); err != nil {
			log.Printf("setting time failed: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}
		time.Sleep(1 * time.Hour)
	}
}
