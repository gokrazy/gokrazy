package integrationtest

import (
	"bytes"
	"embed"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"github.com/anatol/vmtest"
)

//go:embed boot.go
var mainFiles embed.FS

func copyFile(dest string, src fs.DirEntry) error {
	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	in, err := mainFiles.ReadFile(src.Name())
	if err != nil {
		return err
	}

	if _, err := io.Copy(out, bytes.NewReader(in)); err != nil {
		return err
	}

	st, err := src.Info()
	if err != nil {
		return err
	}
	if err := out.Chmod(st.Mode()); err != nil {
		return err
	}
	return out.Close()
}

func Run(t *testing.T, pkgName string, deviceType string, qemuArgs []string) {
	tempdir := t.TempDir()
	err := os.WriteFile(
		filepath.Join(tempdir, "config.json"),
		[]byte(fmt.Sprintf(`
{
    "Hostname": "qemu",
    "DeviceType": "%s",
    "Update": {
        "HTTPPassword": "foobar"
    },
    "Packages": [
        "%s"
    ],
    "SerialConsole": "ttyS0,115200",
    "KernelPackage": "github.com/gokrazy/kernel.amd64",
    "FirmwarePackage": "github.com/gokrazy/kernel.amd64",
    "EEPROMPackage": "",
    "InternalCompatibilityFlags": {}
}
`, deviceType, pkgName)), 0644)
	if err != nil {
		t.Fatal(err)
	}
	err = os.WriteFile(
		filepath.Join(tempdir, "go.mod"),
		[]byte(fmt.Sprintf(`module %s

replace %s => %s
`, pkgName, pkgName, tempdir)), 0644)
	if err != nil {
		t.Fatal(err)
	}

	dirEntries, err := mainFiles.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, dirEntry := range dirEntries {
		m := dirEntry.Name()
		log.Printf("copying %s", m)
		if err := copyFile(filepath.Join(tempdir, m), dirEntry); err != nil {
			t.Fatal(err)
		}
	}

	diskImage := filepath.Join(tempdir, "gokrazy.img")
	// diskImage := "/tmp/gokrazy.img" // for debugging

	packer := exec.Command("gok",
		"overwrite",
		"--instance="+filepath.Base(tempdir),
		"--parent_dir="+filepath.Dir(tempdir),
		"--full="+diskImage,
		"--target_storage_bytes="+strconv.Itoa(2*1024*1024*1024))
	packer.Env = append(os.Environ(), "GOARCH=amd64")
	packer.Dir = tempdir
	packer.Stdout = os.Stdout
	packer.Stderr = os.Stderr
	log.Printf("%s", packer.Args)
	if err := packer.Run(); err != nil {
		t.Fatalf("%s: %v", packer.Args, err)
	}

	qemuArgs = append(qemuArgs,
		//"-enable-kvm",
		//"-cpu", "host",
		"-nodefaults",
		"-m", "4G",
		"-smp", "8", // required! system gets stuck without -smp
		"-net", "none", // to skip PXE boot
		// Use -drive instead of vmtest.QemuOptions.Disks because the latter
		// results in wiring up the devices using SCSI in a way that the
		// router7 kernel config does not support.
		// TODO: update kernel config and switch to Disks:
		"-drive", "file="+diskImage+",format=raw",
	)

	opts := vmtest.QemuOptions{
		Architecture:    vmtest.QEMU_X86_64,
		OperatingSystem: vmtest.OS_LINUX,
		Params:          qemuArgs,
		// Disks: []vmtest.QemuDisk{
		// 	{
		// 		Path:   diskImage,
		// 		Format: "raw",
		// 	},
		// },
		Verbose: testing.Verbose(),
		Timeout: 1 * time.Minute,
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
