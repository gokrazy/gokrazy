package gokrazy

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"syscall"
)

// mountCompat deals with old FAT root file systems, to cover the case where
// users use an old gokr-packer with a new github.com/gokrazy/gokrazy package.
func mountCompat() error {
	// Symlink /etc/resolv.conf. We cannot do this in the root file
	// system itself, as FAT does not support symlinks.
	if err := syscall.Mount("tmpfs", "/etc", "tmpfs", syscall.MS_NOSUID|syscall.MS_NODEV|syscall.MS_RELATIME, "size=1M"); err != nil {
		return fmt.Errorf("tmpfs on /etc: %v", err)
	}

	if err := os.Symlink("/proc/net/pnp", "/etc/resolv.conf"); err != nil {
		return fmt.Errorf("etc: %v", err)
	}

	// Symlink /etc/localtime. We cannot do this in the root file
	// system, as FAT filenames are limited to 8.3.
	if err := os.Symlink("/localtim", "/etc/localtime"); err != nil {
		return fmt.Errorf("etc: %v", err)
	}

	if err := os.Mkdir("/etc/ssl", 0755); err != nil {
		return fmt.Errorf("/etc/ssl: %v", err)
	}

	if err := os.Symlink("/cacerts", "/etc/ssl/ca-bundle.pem"); err != nil {
		return fmt.Errorf("/etc/ssl: %v", err)
	}

	if err := ioutil.WriteFile("/etc/hosts", []byte("127.0.0.1 localhost\n::1 localhost\n"), 0644); err != nil {
		return fmt.Errorf("/etc/hosts: %v", err)
	}
	return nil
}

func mountfs() error {
	if err := syscall.Mount("tmpfs", "/tmp", "tmpfs", syscall.MS_NOSUID|syscall.MS_NODEV|syscall.MS_RELATIME, "size=50M"); err != nil {
		return fmt.Errorf("tmpfs on /tmp: %v", err)
	}

	if err := os.Symlink("/proc/net/pnp", "/tmp/resolv.conf"); err != nil {
		return fmt.Errorf("etc: %v", err)
	}

	if _, err := os.Lstat("/etc/resolv.conf"); err != nil && os.IsNotExist(err) {
		if err := mountCompat(); err != nil {
			return err
		}
	}

	if err := syscall.Mount("devtmpfs", "/dev", "devtmpfs", 0, ""); err != nil {
		if sce, ok := err.(syscall.Errno); ok && sce == syscall.EBUSY {
			// /dev was already mounted (common in setups using nfsroot= or initramfs)
		} else {
			return fmt.Errorf("devtmpfs: %v", err)
		}
	}

	if err := os.MkdirAll("/dev/pts", 0755); err != nil {
		return fmt.Errorf("mkdir /dev/pts: %v", err)
	}

	if err := syscall.Mount("devpts", "/dev/pts", "devpts", 0, ""); err != nil {
		return fmt.Errorf("devpts: %v", err)
	}

	// /proc is useful for exposing process details and for
	// interactive debugging sessions.
	if err := syscall.Mount("proc", "/proc", "proc", 0, ""); err != nil {
		if sce, ok := err.(syscall.Errno); ok && sce == syscall.EBUSY {
			// /proc was already mounted (common in setups using nfsroot= or initramfs)
		} else {
			return fmt.Errorf("proc: %v", err)
		}
	}

	// /sys is useful for retrieving additional status from the
	// kernel, e.g. ethernet device carrier status.
	if err := syscall.Mount("sysfs", "/sys", "sysfs", 0, ""); err != nil {
		if sce, ok := err.(syscall.Errno); ok && sce == syscall.EBUSY {
			// /sys was already mounted (common in setups using nfsroot= or initramfs)
		} else {
			return fmt.Errorf("sys: %v", err)
		}
	}

	dev := mustFindRootDevice() + "4"
	if err := syscall.Mount(dev, "/perm", "ext4", 0, ""); err != nil {
		log.Printf("Could not mount permanent storage partition %s: %v", dev, err)
	}

	return nil
}
