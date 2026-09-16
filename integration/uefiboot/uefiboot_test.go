package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gokrazy/gokrazy/integration/integrationtest"
)

// qemuFirmwareDirs returns the directories in which QEMU looks for firmware
// blobs, as printed by `qemu-system-x86_64 -L help`.
func qemuFirmwareDirs() []string {
	out, err := exec.Command("qemu-system-x86_64", "-L", "help").Output()
	if err != nil {
		return nil
	}
	var dirs []string
	for _, line := range strings.Split(string(out), "\n") {
		if d := strings.TrimSpace(line); d != "" {
			dirs = append(dirs, d)
		}
	}
	return dirs
}

// findOVMF locates a UEFI firmware image (split into a read-only code part and
// a variable store template). It prefers the edk2 firmware that ships with
// QEMU itself — discovered via `qemu-system-x86_64 -L help` — and falls back to
// well-known distribution paths. Both return values are empty when no firmware
// is found, in which case the test is skipped.
func findOVMF() (code, varsTemplate string) {
	// QEMU bundles edk2 firmware in its data directories (NixOS, Arch,
	// Fedora, …).
	for _, dir := range qemuFirmwareDirs() {
		c := filepath.Join(dir, "edk2-x86_64-code.fd")
		v := filepath.Join(dir, "edk2-i386-vars.fd")
		if fileExists(c) && fileExists(v) {
			return c, v
		}
	}
	// Fall back to distribution packages that ship OVMF separately from QEMU
	// (e.g. Debian/Ubuntu's ovmf package).
	for _, pair := range [][2]string{
		{"/usr/share/edk2-ovmf/x64/OVMF_CODE.4m.fd", "/usr/share/edk2-ovmf/x64/OVMF_VARS.4m.fd"}, // Arch
		{"/usr/share/edk2-ovmf/x64/OVMF_CODE.fd", "/usr/share/edk2-ovmf/x64/OVMF_VARS.fd"},       // Arch
		{"/usr/share/OVMF/OVMF_CODE_4M.fd", "/usr/share/OVMF/OVMF_VARS_4M.fd"},                   // Ubuntu 22+
		{"/usr/share/OVMF/OVMF_CODE.fd", "/usr/share/OVMF/OVMF_VARS.fd"},                         // Ubuntu <22
	} {
		if fileExists(pair[0]) && fileExists(pair[1]) {
			return pair[0], pair[1]
		}
	}
	return "", ""
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func TestUEFIBoot(t *testing.T) {
	code, varsTemplate := findOVMF()
	if code == "" {
		t.Skip("no OVMF/edk2 UEFI firmware found next to QEMU or in the usual distribution paths")
	}

	// The variable store must be writable, so copy the template into the test's
	// temporary directory.
	varsData, err := os.ReadFile(varsTemplate)
	if err != nil {
		t.Fatal(err)
	}
	vars := filepath.Join(t.TempDir(), "OVMF_VARS.fd")
	if err := os.WriteFile(vars, varsData, 0644); err != nil {
		t.Fatal(err)
	}

	// From https://wiki.debian.org/SecureBoot/VirtualMachine
	qemuArgs := []string{
		// Read-only pflash drive containing the firmware code.
		`-drive`, `if=pflash,format=raw,unit=0,file=` + code + `,readonly=on`,
		// Writable pflash drive for the firmware variables.
		`-drive`, `if=pflash,format=raw,unit=1,file=` + vars,
	}

	integrationtest.Run(t, "github.com/gokrazy/uefiboot", "", qemuArgs)
}
