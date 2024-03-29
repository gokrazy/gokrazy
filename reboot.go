//go:build !amd64
// +build !amd64

package gokrazy

import "golang.org/x/sys/unix"

func reboot(tryKexec bool) error {
	return unix.Reboot(unix.LINUX_REBOOT_CMD_RESTART)
}
