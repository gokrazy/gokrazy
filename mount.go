package gokrazy

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gokrazy/internal/config"
	"github.com/gokrazy/internal/gpt"
	"github.com/gokrazy/internal/rootdev"
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
	if err := syscall.Mount("tmpfs", "/tmp", "tmpfs", syscall.MS_NOSUID|syscall.MS_NODEV|syscall.MS_RELATIME, ""); err != nil {
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

	if err := os.MkdirAll("/dev/shm", 0755); err != nil {
		return fmt.Errorf("mkdir /dev/shm: %v", err)
	}

	if err := syscall.Mount("tmpfs", "/dev/shm", "tmpfs", 0, ""); err != nil {
		return fmt.Errorf("tmpfs on /dev/shm: %v", err)
	}

	if err := syscall.Mount("tmpfs", "/run", "tmpfs", 0, ""); err != nil {
		log.Printf("tmpfs on /run: %v", err)
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

	dev := rootdev.Partition(rootdev.Perm)
	for _, fstype := range []string{"ext4", "vfat", "bcachefs"} {
		if err := syscall.Mount(dev, "/perm", fstype, 0, ""); err != nil {
			log.Printf("Could not mount permanent storage partition %s as %s: %v", dev, fstype, err)
		} else {
			break
		}
	}

	// Create /perm/var if needed so that the /var symlink resolves
	if err := os.MkdirAll("/perm/var", 0755); err != nil {
		log.Printf("mkdir /perm/var: %v", err)
	}

	if err := os.Symlink("/run", "/perm/var/run"); err != nil && !os.IsExist(err) {
		log.Printf("symlink /perm/var/run to /run: %v", err)
	}

	if err := syscall.Mount("cgroup2", "/sys/fs/cgroup", "cgroup2", 0, ""); err != nil {
		log.Printf("cgroup2 on /sys/fs/cgroup: %v", err)
	}

	if err := mountDevices(); err != nil {
		log.Printf("mountDevices: %v", err)
	}

	return nil
}

func findGPTPartUUID(uuid string) (_ string, _ error) {
	var dev string
	uuid = strings.ToLower(uuid)
	err := filepath.Walk("/sys/block", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("findGPTPartUUID: %v", err)
			return nil
		}
		if info.Mode()&os.ModeSymlink == 0 {
			return nil
		}
		devname := "/dev/" + filepath.Base(path)
		f, err := os.Open(devname)
		if err != nil {
			log.Printf("findGPTPartUUID: %v", err)
			return nil
		}
		defer f.Close()
		for idx, partUUID := range gpt.PartitionUUIDs(f) {
			if strings.ToLower(partUUID) != uuid {
				continue
			}
			dev = devname
			if (strings.HasPrefix(dev, "/dev/mmcblk") ||
				strings.HasPrefix(dev, "/dev/loop") ||
				strings.HasPrefix(dev, "/dev/nvme")) &&
				!strings.HasSuffix(dev, "p") {
				dev += "p"
			}
			dev += strconv.Itoa(idx + 1)

			// TODO: abort early with sentinel error code
			return nil
		}
		return nil
	})
	if err != nil {
		return "", err
	}
	if dev == "" {
		return "", fmt.Errorf("PARTUUID=%s not found", uuid)
	}
	return dev, nil
}

func deviceForSource(source string) (string, error) {
	if strings.HasPrefix(source, "PARTUUID=") {
		return findGPTPartUUID(strings.TrimPrefix(source, "PARTUUID="))
	}

	return source, nil
}

func mountDevice(md config.MountDevice) error {
	dev, err := deviceForSource(md.Source)
	if err != nil {
		return err
	}

	log.Printf("mounting %s on %s", dev, md.Target)
	if err := syscall.Mount(dev, md.Target, md.Type, 0, ""); err != nil {
		return err
	}

	return nil
}

// mountDevices mounts the user-specified devices. The packer persists them from
// the instance config to mountdevices.json.
func mountDevices() error {
	b, err := os.ReadFile("/etc/gokrazy/mountdevices.json")
	if err != nil {
		if os.IsNotExist(err) {
			return nil // packer too old
		}
		return fmt.Errorf("reading mountdevices.json: %v", err)
	}

	var mountdevices []config.MountDevice
	if err := json.Unmarshal(b, &mountdevices); err != nil {
		return err
	}

	// Start one goroutine per mount device
	for _, md := range mountdevices {
		md := md // remove once we are on Go 1.22
		go func() {
			for attempt := 0; ; attempt++ {
				err := mountDevice(md)
				if err == nil {
					return
				}
				log.Printf("mounting %s: %v", md.Source, err)
				if attempt < 10 {
					time.Sleep(1 * time.Second)
				} else {
					time.Sleep(5 * time.Second)
				}
			}
		}()
	}

	return nil
}
