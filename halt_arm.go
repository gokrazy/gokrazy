package gokrazy

// LINUX_REBOOT_CMD_HALT is a uint32 constant that cannot be passed in as an int param on 32-bit systems.
// This is a workaround to allow the code to compile on 32-bit systems and function nearly the same.
func halt() {
	poweroff()
}
