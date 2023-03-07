package gokrazy

import (
	"context"
	"log"
	"path/filepath"
	"time"

	"github.com/kenshaw/evdev"
	"golang.org/x/sys/unix"
)

func pollPowerButton1(path string) error {
	dev, err := evdev.OpenFile(path)
	if err != nil {
		return err
	}
	defer dev.Close()

	if !dev.KeyTypes()[evdev.KeyPower] {
		return nil
	}
	log.Printf("polling device %s for power button events", path)

	ch := dev.Poll(context.Background())
	for event := range ch {
		k, ok := event.Type.(evdev.KeyType)
		if !ok {
			continue
		}
		if k != evdev.KeyPower {
			continue
		}
		if event.Value != 1 {
			continue
		}
		log.Printf("power pressed, event %+v", event)

		// Allow for slow VM shutdown of 90 seconds, and then some
		const signalDelay = 145 * time.Second
		killSupervisedServicesAndUmountPerm(signalDelay)

		log.Println("Powering off")
		if err := unix.Reboot(unix.LINUX_REBOOT_CMD_POWER_OFF); err != nil {
			return err
		}
	}
	return nil
}

func pollPowerButtons() error {
	matches, err := filepath.Glob("/dev/input/event*")
	if err != nil {
		return err
	}
	for _, match := range matches {
		match := match // copy
		go func() {
			if err := pollPowerButton1(match); err != nil {
				log.Printf("pollPowerButton1(%s): %v", match, err)
			}
		}()
	}
	return nil
}
