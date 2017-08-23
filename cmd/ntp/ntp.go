// ntp is a minimal NTP client for gokrazy.
package main

import (
	"log"
	"math/rand"
	"syscall"
	"time"

	"github.com/beevik/ntp"
)

func set() error {
	r, err := ntp.Query("pool.ntp.org")
	if err != nil {
		return err
	}

	tv := syscall.NsecToTimeval(r.Time.UnixNano())
	return syscall.Settimeofday(&tv)
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	for {
		if err := set(); err != nil {
			log.Fatalf("setting time failed: %v", err)
		}
		time.Sleep(1*time.Hour + time.Duration(rand.Int63n(250))*time.Millisecond)
	}
}
