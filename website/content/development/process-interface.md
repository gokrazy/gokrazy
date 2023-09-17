---
title: "Process interface / requirements"
weight: 10
aliases:
  - /userguide/process-interface/
---

## Process supervision

{{% notice tip %}}
You can find the corresponding code in
[func gokrazy.supervise](https://sourcegraph.com/search?q=context:global+repo:%5Egithub%5C.com/gokrazy/gokrazy%24+type:symbol+%5Esupervise%24&patternType=regexp&case=yes).
{{% /notice %}}

gokrazy’s init process (pid 1) supervises all the binaries the user specified via `gokr-packer` flags.

More specifically, gokrazy:

1. Starts your binary using Go’s `os/exec.Command` API.
   - The `stdout` and `stderr` file descriptors are hooked up to a ring buffer and can be viewed via gokrazy’s web interface.
   - Extra command-line flags or environment variables can be specified using
     [per-package configuration](/userguide/package-config/).
1. When your binary’s process exits, gokrazy restarts it!
   - If the process exits with status code `0` (or `125`), gokrazy will stop
     supervision. Exiting immediately with status code `0` when the
     `GOKRAZY_FIRST_START=1` environment variable is set means “don’t start the
     program on boot”

## Environment variables

gokrazy sets the `HOME` environment variable to `HOME=/perm/<cmd>`, where
`<cmd>` is the name of your binary. For example, `tailscale.com/cmd/tailscaled`
is started with `HOME=/perm/tailscaled`.

When your binary is first started, gokrazy sets the `GOKRAZY_FIRST_START=1`
environment variable.

## Privilege dropping / security

An easy way to implement privilege dropping in Go is to re-execute the process
with [syscall.SysProcAttr](https://pkg.go.dev/syscall#SysProcAttr) fields
set. For example, this is how you would drop privileges to user `nobody`
(uid/gid 65534):

```go
// mustDropPrivileges re-executes the program in a child process,
// dropping root privileges to user nobody.
func mustDropPrivileges() {
	if os.Getenv("NTP_PRIVILEGES_DROPPED") == "1" {
		return
	}

	cmd := exec.Command(os.Args[0])
	cmd.Env = append(os.Environ(), "NTP_PRIVILEGES_DROPPED=1")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Credential: &syscall.Credential{
			Uid: 65534,
			Gid: 65534,
		},
	}
	log.Fatal(cmd.Run())
}
```

Examples:

- [`github.com/gokrazy/gokrazy/cmd/ntp`](https://sourcegraph.com/github.com/gokrazy/gokrazy/-/blob/cmd/ntp/privdrop.go)
  is a rather involved example which retains the CAP_SYS_TIME capability in the
  child process
- [`github.com/gokrazy/rsync`](https://sourcegraph.com/github.com/gokrazy/rsync/-/blob/internal/maincmd/namespacing_linux.go) uses Linux
  mount namespaces and constructs a file system with read-only bind mounts of
  the configured rsync modules
