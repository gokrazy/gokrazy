package gokrazy

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"syscall"

	"github.com/gokrazy/internal/rootdev"
	"golang.org/x/sys/unix"
)

func kexecReboot() error {
	tmpdir, err := ioutil.TempDir("", "kexec")
	if err != nil {
		return err
	}

	if err := syscall.Mount(rootdev.Partition(rootdev.Boot), tmpdir, "vfat", 0, ""); err != nil {
		return err
	}

	kernel, err := os.Open(filepath.Join(tmpdir, "vmlinuz"))
	if err != nil {
		return err
	}
	defer kernel.Close()
	cmdline, err := ioutil.ReadFile(filepath.Join(tmpdir, "cmdline.txt"))
	if err != nil {
		return err
	}

	flags := unix.KEXEC_ARCH_DEFAULT | unix.KEXEC_FILE_NO_INITRAMFS
	if err := unix.KexecFileLoad(int(kernel.Fd()), 0, string(cmdline), flags); err != nil {
		// err is syscall.ENOSYS on kernels without CONFIG_KEXEC_FILE_LOAD=y
		return err
	}

	return unix.Reboot(unix.LINUX_REBOOT_CMD_KEXEC)
}

func reboot(tryKexec bool) error {
	if tryKexec {
		if err := kexecReboot(); err != nil {
			log.Printf("kexec reboot failed: %v", err)
		}
	}
	return unix.Reboot(unix.LINUX_REBOOT_CMD_RESTART)
}
