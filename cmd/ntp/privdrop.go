//go:build go1.9
// +build go1.9

package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"syscall"
	"unsafe"
)

type capHeader struct {
	version uint32
	pid     int
}

type capData struct {
	effective   uint32
	permitted   uint32
	inheritable uint32
}

type caps struct {
	hdr  capHeader
	data [2]capData
}

func getCaps() (caps, error) {
	var c caps

	// Get capability version
	if _, _, errno := syscall.Syscall(syscall.SYS_CAPGET, uintptr(unsafe.Pointer(&c.hdr)), uintptr(unsafe.Pointer(nil)), 0); errno != 0 {
		return c, fmt.Errorf("SYS_CAPGET: %v", errno)
	}

	// Get current capabilities
	if _, _, errno := syscall.Syscall(syscall.SYS_CAPGET, uintptr(unsafe.Pointer(&c.hdr)), uintptr(unsafe.Pointer(&c.data[0])), 0); errno != 0 {
		return c, fmt.Errorf("SYS_CAPGET: %v", errno)
	}

	return c, nil
}

// mustDropPrivileges executes the program in a child process, dropping root
// privileges, but retaining the CAP_SYS_TIME capability to change the system
// clock.
func mustDropPrivileges(rtc *os.File) {
	if os.Getenv("NTP_PRIVILEGES_DROPPED") == "1" {
		return
	}

	// From include/uapi/linux/capability.h:
	// Allow setting the real-time clock
	const CAP_SYS_TIME = 25

	caps, err := getCaps()
	if err != nil {
		log.Fatal(err)
	}

	// Add CAP_SYS_TIME to the permitted and inheritable capability mask,
	// otherwise we will not be able to add it to the ambient capability mask.
	caps.data[0].permitted |= 1 << uint(CAP_SYS_TIME)
	caps.data[0].inheritable |= 1 << uint(CAP_SYS_TIME)

	if _, _, errno := syscall.Syscall(syscall.SYS_CAPSET, uintptr(unsafe.Pointer(&caps.hdr)), uintptr(unsafe.Pointer(&caps.data[0])), 0); errno != 0 {
		log.Fatalf("SYS_CAPSET: %v", errno)
	}

	cmd := exec.Command(os.Args[0])
	cmd.Env = append(os.Environ(), "NTP_PRIVILEGES_DROPPED=1")
	if rtc != nil {
		cmd.Env = append(cmd.Env, "NTP_RTC=1")
		cmd.ExtraFiles = []*os.File{rtc}
	}
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Credential: &syscall.Credential{
			Uid: 65534,
			Gid: 65534,
		},
		AmbientCaps: []uintptr{CAP_SYS_TIME},
	}
	log.Fatal(cmd.Run())
}
