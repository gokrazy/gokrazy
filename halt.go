//go:build !arm
// +build !arm

package gokrazy

import (
	"log"

	"golang.org/x/sys/unix"
)

func halt() {
	log.Println("Halting")
	if err := unix.Reboot(unix.LINUX_REBOOT_CMD_HALT); err != nil {
		log.Printf("HALT: %v", err)
	}
}
