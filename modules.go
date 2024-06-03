package gokrazy

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/sys/unix"
)

func getRelease() string {
	var uts unix.Utsname
	if err := unix.Uname(&uts); err != nil {
		fmt.Fprintf(os.Stderr, "minitrd: %v\n", err)
		return ""
	}
	return string(uts.Release[:bytes.IndexByte(uts.Release[:], 0)])
}

func loadModule(release, mod string) error {
	f, err := os.Open(filepath.Join("/lib/modules", release, mod))
	if err != nil {
		return err
	}
	defer f.Close()
	if err := unix.FinitModule(int(f.Fd()), "", 0); err != nil {
		if err != unix.EEXIST &&
			err != unix.EBUSY &&
			err != unix.ENODEV &&
			err != unix.ENOENT {
			return fmt.Errorf("FinitModule(%v): %v", mod, err)
		}
	}
	return nil
}

// loadModules currently contains a hard-coded list of modules but can be
// extended to read a configuration file.
func loadModules() error {
	// The Raspberry Pi 5 needs the pwm-fan module to be loaded for fan control
	// to work. We do not build it into the kernel so that users can unload the
	// module if they want to use their own custom fan control.
	return loadModule(getRelease(), "kernel/drivers/hwmon/pwm-fan.ko")
}
