package main

import (
	"os"
	"testing"

	"github.com/gokrazy/gokrazy/integration/integrationtest"
)

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
	integrationtest.Run(t, "github.com/gokrazy/uefiboot", "", []string{"-bios", findOVMF()})
}
