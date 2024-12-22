package main

import (
	"os"
	"strings"
	"testing"

	"github.com/gokrazy/gokrazy/integration/integrationtest"
)

func findOVMF() string {
	locations := []string{
		"/usr/share/edk2-ovmf/x64/OVMF_CODE.4m.fd", // Arch
		"/usr/share/edk2-ovmf/x64/OVMF_CODE.fd",    // Arch
		"/usr/share/OVMF/OVMF_CODE_4M.fd",          // Ubuntu 22+
		"/usr/share/OVMF/OVMF_CODE.fd",             // Ubuntu <22
	}
	for _, loc := range locations {
		if _, err := os.Stat(loc); err == nil {
			return loc
		}
	}
	return locations[len(locations)-1] // will fail
}

func TestUEFIBoot(t *testing.T) {
	ovmf := findOVMF()
	qemuArgs := []string{"-bios", ovmf}
	if strings.Contains(strings.ToLower(ovmf), "4m") {
		ovmfVars := strings.ReplaceAll(ovmf, "CODE", "VARS")
		// From https://wiki.debian.org/SecureBoot/VirtualMachine
		qemuArgs = []string{
			// Add a driver for virtual pflash drives containing the firmware
			`-global`, `driver=cfi.pflash01,property=secure,value=on`,
			// Create a readonly pflash drive containing the firmware
			`-drive`, `if=pflash,format=raw,unit=0,file=` + ovmf + `,readonly=on`,
			// TODO: Create a writeable pflash drive for storage of firmware variables
			`-drive`, `if=pflash,format=raw,unit=1,file=` + ovmfVars + `,readonly=on`,
		}
	}

	integrationtest.Run(t, "github.com/gokrazy/uefiboot", "", qemuArgs)
}
