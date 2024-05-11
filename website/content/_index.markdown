---
layout: default
title: gokrazy Go appliances
---

# gokrazy Go appliances

With gokrazy, you can deploy one or more Go programs as
[appliances](https://en.wikipedia.org/wiki/Computer_appliance) to a Raspberry
Pi, Virtual Machine, embedded or normal PC (see [supported
platforms](/platforms/)).

gokrazy uses its own minimal Go userland instead of a traditional Linux
distribution base.

This minimalist approach offers several advantages in terms of security,
maintainability and reliability:

* The surface area for security vulnerabilities is drastically reduced.
* The root filesystem is entirely read-only (making persistent malware
  installation hard) and new versions of the system are installed by overwriting
  the root file system with the new version.
* No default shell access: There is neither xz nor OpenSSH on a gokrazy
  system. Interactive access for debugging is possible, but needs to be
  explicitly started.

## Backstory

For a long time, we were unhappy about having to spend so much time on each of
our various Raspberry Pis, taking care of security updates and other general
Linux distribution maintenance.

Then, we had a crazy idea: what if we massively reduced the overall system
complexity by getting rid of all software we don’t strictly need, and instead
built up a minimal system from scratch entirely in Go, a memory safe programming
language?

Turns out this is feasible. gokrazy is the result. See it in action in [this
first installation demo
video](https://www.youtube.com/watch?v=6FBGjdT8ZW4&list=PLxMVx8p-A48A6H-EWqzN-HStDH1dOW5PU):

{{< youtube id="6FBGjdT8ZW4" title="gokrazy demo: first installation and adding programs" >}}

<!--<img src="logo.svg" width="50" height="50" alt="gokrazy logo" title="gokrazy logo">-->

## Your app(s) + only 4 moving parts

1. the [Linux kernel](https://github.com/gokrazy/kernel)
   * new versions are typically available < 24h after upstream release!
1. the [Raspberry Pi firmware files](https://github.com/gokrazy/firmware)
1. the [Go](https://go.dev/) compiler and standard library
1. the gokrazy system (minimal init system, updater, DHCP, NTP, …)

## Uniformity

What’s appealing about building an appliance entirely in Go? You get the same
advantages you get when building Go software elsewhere:

* All components mentioned above (except for the Go compiler) are managed as Go
  modules, using the same tooling you’re already familiar with.
* Go has very quick compilation times; the `gok run` command allows for a fast
  edit-run loop.
* Go’s
  [tracing](https://about.sourcegraph.com/blog/go/an-introduction-to-go-tool-trace-rhys-hiltner)
  and [profiling](https://go.dev/blog/pprof) support can be used on the entire
  system
* With Go’s [replace
  directive](https://go.dev/wiki/Modules#when-should-i-use-the-replace-directive),
  you can quickly modify any part of the system with the same workflow.

## Web status interface

On a regular Linux distribution, we’d largely use systemctl’s start,
stop, restart and status verbs to manage our applications. gokrazy
comes with a <a href="overview.png">convenient web interface</a> for
seeing process status and stopping/restarting processes.

## Debugging

Sometimes, an interactive <code>busybox</code> session or a quick
<code>tcpdump</code> run are invaluable. <a
href="https://github.com/gokrazy/breakglass">breakglass</a> allows
you to temporarily enable SSH/SCP-based authenticated remote code
execution: scp your statically compiled binary, then run it
interactively via ssh.

Due to no C runtime environment being present, your code must compile
with the environment variable <code>CGO_ENABLED=0</code>. To
cross-compile for the Raspberry Pi 3 or 4,
use <code>GOARCH=arm64</code>. If your program still builds, you’re
good to go!

## Network updates

After building a new gokrazy image on your computer, you can easily
update an existing gokrazy installation in-place thanks to the A/B
partitioning scheme we use. Just use the <code>gok update</code>
command.

## Minimal state and configuration

A tiny amount of configuration is built into the images (e.g.
hostname, password, serial console behavior). In general, we prefer
auto-configuration (e.g. DHCP) over config files. If you need more
configurability, you may need to replace some of our programs.
