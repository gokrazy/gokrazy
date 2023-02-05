package gokrazy

import (
	"os"
	"strings"
)

// MachineID returns the machine id (see
// https://manpages.debian.org/machine-id.5) of the running gokrazy instance.
//
// `gok new` creates a random machine id, but on older gokrazy installations,
// the hostname is used as a fallback.
func MachineID() string {
	for _, fn := range []string{
		"/perm/machine-id",
		"/etc/machine-id",
		"/etc/hostname",
	} {
		b, err := os.ReadFile(fn)
		if err != nil {
			continue
		}
		return strings.TrimSpace(string(b))
	}
	return "machine-id-BUG"
}
