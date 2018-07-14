package gokrazy

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"syscall"
	"unsafe"

	"github.com/gokrazy/internal/rootdev"
	"golang.org/x/sys/unix"
)

// TODO: get these constants into sys/unix
const (
	KEXEC_ARCH_DEFAULT      = (0 << 16)
	KEXEC_FILE_NO_INITRAMFS = 0x00000004
)

func kexecReboot() error {
	tmpdir, err := ioutil.TempDir("", "kexec")
	if err != nil {
		return err
	}

	if err := syscall.Mount(rootdev.MustFind()+"1", tmpdir, "vfat", 0, ""); err != nil {
		return err
	}

	kernel, err := os.Open(filepath.Join(tmpdir, "vmlinuz"))
	if err != nil {
		return err
	}
	defer kernel.Close()
	cmdline, err := ioutil.ReadFile("/proc/cmdline")
	if err != nil {
		return err
	}
	rep := rootRe.ReplaceAllLiteral(cmdline, []byte("root="+rootdev.MustFind()+inactiveRootPartition))
	// NUL-terminate cmdline
	cmdlinebuf := make([]byte, len(rep)+1)
	copy(cmdlinebuf, rep)
	_, _, errno := unix.Syscall6(
		unix.SYS_KEXEC_FILE_LOAD,
		uintptr(kernel.Fd()), // kernel_fd
		0,                    // initrd_fd
		uintptr(len(cmdline)+1),                    // cmdline_len
		uintptr(unsafe.Pointer(&cmdlinebuf[0])),    // cmdline
		KEXEC_ARCH_DEFAULT|KEXEC_FILE_NO_INITRAMFS, // flags
		0)
	if errno != 0 {
		// errno is syscall.ENOSYS on kernels without CONFIG_KEXEC_FILE_LOAD=y
		return errno
	}

	return unix.Reboot(unix.LINUX_REBOOT_CMD_KEXEC)
}

func reboot() error {
	if err := kexecReboot(); err != nil {
		log.Printf("kexec reboot failed: %v", err)
		return unix.Reboot(unix.LINUX_REBOOT_CMD_RESTART)
	}
	return nil
}
