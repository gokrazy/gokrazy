package main

import (
	"log"
	"os"
	"time"
	"unsafe"

	"golang.org/x/sys/unix"
)

func setRTC(rtc *os.File, now time.Time) error {
	c := unix.RTCTime{
		Sec:  int32(now.Second()),
		Min:  int32(now.Minute()),
		Hour: int32(now.Hour()),
		Mday: int32(now.Day()),
		Mon:  int32(now.Month() - 1),
		Year: int32(now.Year() - 1900),
	}
	if _, _, errno := unix.Syscall(unix.SYS_IOCTL, rtc.Fd(), unix.RTC_SET_TIME, uintptr(unsafe.Pointer(&c))); errno != 0 {
		return errno
	}
	log.Printf("RTC set to %+v", c)
	return nil
}
