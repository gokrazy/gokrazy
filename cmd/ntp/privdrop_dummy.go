// +build !go1.9

package main

import "os"

// mustDropPrivileges (on Go < 1.9) does nothing, as the AmbientCaps field in
// syscall.SysProcAttr was only introduced in Go 1.9.
func mustDropPrivileges(*os.File) {
}
