package uefiboot_test

import (
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/anatol/vmtest"
)

func copyFile(dest, src string) error {
	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}

	st, err := in.Stat()
	if err != nil {
		return err
	}
	if err := out.Chmod(st.Mode()); err != nil {
		return err
	}
	return out.Close()
}

func findOVMF() string {
	locations := []string{
		"/usr/share/edk2-ovmf/x64/OVMF_CODE.fd", // Arch
		"/usr/share/OVMF/OVMF_CODE.fd",          // Ubuntu
	}
	for _, loc := range locations {
		if _, err := os.Stat(loc); err == nil {
			return loc
		}
	}
	return locations[len(locations)-1] // will fail
}

func TestUEFIBoot(t *testing.T) {
	tempdir := t.TempDir()
	err := ioutil.WriteFile(filepath.Join(tempdir, "go.mod"), []byte(`
module github.com/gokrazy/uefiboot
`), 0644)
	if err != nil {
		t.Fatal(err)
	}
	goFiles, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}
	for _, m := range goFiles {
		if strings.Contains(m, "_test.go") {
			continue
		}
		log.Printf("copying %s", m)
		if err := copyFile(filepath.Join(tempdir, m), m); err != nil {
			t.Fatal(err)
		}
	}

	diskImage := filepath.Join(tempdir, "gokrazy.img")
	// diskImage := "/tmp/gokrazy.img" // for debugging
	packer := exec.Command("gokr-packer",
		"-overwrite="+diskImage,
		"-target_storage_bytes="+strconv.Itoa(2*1024*1024*1024),
		"-serial_console=ttyS0,115200",
		"-hostname=qemu",
		"-gokrazy_pkgs=",
		"-kernel_package=github.com/rtr7/kernel",
		"-firmware_package=github.com/rtr7/kernel",
		"-eeprom_package=",
		"github.com/gokrazy/uefiboot",
	)
	packer.Env = append(os.Environ(), "GOARCH=amd64")
	packer.Dir = tempdir
	packer.Stdout = os.Stdout
	packer.Stderr = os.Stderr
	log.Printf("%s", packer.Args)
	if err := packer.Run(); err != nil {
		t.Fatalf("%s: %v", packer.Args, err)
	}

	opts := vmtest.QemuOptions{
		Architecture:    vmtest.QEMU_X86_64,
		OperatingSystem: vmtest.OS_LINUX,
		Params: []string{
			//"-enable-kvm",
			//"-cpu", "host",
			"-nodefaults",
			"-m", "4G",
			"-smp", "8", // required! system gets stuck without -smp
			"-bios", findOVMF(),
			"-net", "none", // to skip PXE boot
			// Use -drive instead of vmtest.QemuOptions.Disks because the latter
			// results in wiring up the devices using SCSI in a way that the
			// router7 kernel config does not support.
			// TODO: update kernel config and switch to Disks:
			"-drive", "file=" + diskImage + ",format=raw",
		},
		// Disks: []vmtest.QemuDisk{
		// 	{
		// 		Path:   diskImage,
		// 		Format: "raw",
		// 	},
		// },
		Verbose: testing.Verbose(),
		Timeout: 20 * time.Second,
	}
	qemu, err := vmtest.NewQemu(&opts)
	if err != nil {
		t.Fatal(err)
	}
	defer qemu.Kill()

	if err := qemu.ConsoleExpect("SUCCESS"); err != nil {
		t.Fatal(err)
	}
}
