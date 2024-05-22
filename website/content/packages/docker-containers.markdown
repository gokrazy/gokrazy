---
title: "Docker containers"
weight: 60
---

gokrazy’s goal is to make it easy to build Go appliances. In an ideal world, all
building blocks you need would be available in Go. In reality, that is not
entirely the case. Perhaps you need to run a C program next to your Go
programs. Docker containers make incremental (or partial) adoption of gokrazy
easy.

We’re going to use podman, a drop-in replacement for Docker, because there is a
statically compiled version for amd64 and arm64 available that we could easily
re-package into https://github.com/gokrazy/podman.

## Step 1: Install podman to your gokrazy device

Include the following packages in your gokrazy installation:

```bash
gok add github.com/gokrazy/iptables
gok add github.com/gokrazy/nsenter
gok add github.com/gokrazy/podman
gok add github.com/greenpau/cni-plugins/cmd/cni-nftables-portmap
gok add github.com/greenpau/cni-plugins/cmd/cni-nftables-firewall
```

Then, deploy as usual:

```bash
gok update
```

## Step 2: Verify podman works

Use [breakglass](https://github.com/gokrazy/breakglass) to login to your gokrazy
instance and run a container manually:

```shell
/tmp/breakglass187145741 $ mount -t tmpfs tmpfs /var
/tmp/breakglass187145741 $ podman run --rm -ti docker.io/library/debian:sid
root@gokrazy:/# cat /etc/debian_version
12.0
```

## Step 3: Use podman programmatically

Now that you have the required tools, there are a couple of decisions you have
to make depending on what you want to run in your container(s):

1. Should container data be stored ephemerally in `tmpfs` (lost with the next
   reboot), on the permanent partition of your SD card, or somewhere else
   entirely (e.g. network storage)?
1. Do you want to pull new container versions automatically before each run, or
   manually on demand only?
1. Should your container be started as a one-off job only ([→ detached
   mode](https://docs.docker.com/engine/reference/run/#detached--d)), or
   supervised continuously (restarted when it exits)?
1. Should your container use a deterministic name (so that you can `exec`
   commands in it easily), or use a fresh name for each run (so that there never
   are conflicts)?

Aside from these broad questions, you very likely need to set a bunch of detail
options for your container, such as additional environment variables, volume
mounts, networking flags, or command line arguments.

The following program is an example for how this could look like. I use this
program to run [irssi](https://irssi.org/).

```go
package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/gokrazy/gokrazy"
)

func podman(args ...string) error {
	podman := exec.Command("/usr/local/bin/podman", args...)
	podman.Env = expandPath(os.Environ())
	podman.Env = append(podman.Env, "TMPDIR=/tmp")
	podman.Stdin = os.Stdin
	podman.Stdout = os.Stdout
	podman.Stderr = os.Stderr
	if err := podman.Run(); err != nil {
		return fmt.Errorf("%v: %v", podman.Args, err)
	}
	return nil
}

func irssi() error {
	// Ensure we have an up-to-date clock, which in turn also means that
	// networking is up. This is relevant because podman takes what’s in
	// /etc/resolv.conf (nothing at boot) and holds on to it, meaning your
	// container will never have working networking if it starts too early.
	gokrazy.WaitForClock()

	if err := podman("kill", "irssi"); err != nil {
		log.Print(err)
	}

	if err := podman("rm", "irssi"); err != nil {
		log.Print(err)
	}

	// You could podman pull here.

	if err := podman("run",
		"-td",
		"-v", "/perm/irssi:/home/michael/.irssi",
		"-v", "/perm/irclogs:/home/michael/irclogs",
		"-e", "TERM=rxvt-unicode",
		"-e", "LANG=C.UTF-8",
		"--network", "host",
		"--name", "irssi",
		"docker.io/stapelberg/irssi:latest",
		"screen", "-S", "irssi", "irssi"); err != nil {
		return err
	}

	return nil
}

func main() {
	if err := irssi(); err != nil {
		log.Fatal(err)
	}
}

// expandPath returns env, but with PATH= modified or added
// such that both /user and /usr/local/bin are included, which podman needs.
func expandPath(env []string) []string {
	extra := "/user:/usr/local/bin"
	found := false
	for idx, val := range env {
		parts := strings.Split(val, "=")
		if len(parts) < 2 {
			continue // malformed entry
		}
		key := parts[0]
		if key != "PATH" {
			continue
		}
		val := strings.Join(parts[1:], "=")
		env[idx] = fmt.Sprintf("%s=%s:%s", key, extra, val)
		found = true
	}
	if !found {
		const busyboxDefaultPATH = "/usr/local/sbin:/sbin:/usr/sbin:/usr/local/bin:/bin:/usr/bin"
		env = append(env, fmt.Sprintf("PATH=%s:%s", extra, busyboxDefaultPATH))
	}
	return env
}
```
