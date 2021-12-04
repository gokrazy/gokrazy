---
layout: default
title: gokrazy
---

# gokrazy Go appliances

With gokrazy, you can deploy your Go programs as appliances to a Raspberry Pi or
PC ([→ supported platforms](/platforms/)).

For a long time, we were unhappy with having to care about security
issues and Linux distribution maintenance on our various Raspberry Pis.

Then, we had a crazy idea: what if we got rid of memory-unsafe
languages and all software we don’t strictly need?

Turns out this is feasible. gokrazy is the result.

<!--<img src="logo.svg" width="50" height="50" alt="gokrazy logo" title="gokrazy logo">-->

## Your app(s) + only 4 moving parts

1. the [Linux kernel](https://github.com/gokrazy/kernel)
1. the [Raspberry Pi firmware files](https://github.com/gokrazy/firmware)
1. the [Go](https://golang.org/) compiler and standard library
1. the gokrazy userland

All are updated using the same command.

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
partitioning scheme we use. Just specify the <code>-update</code>
flag when building your new image.

## Minimal state and configuration

A tiny amount of configuration is built into the images (e.g.
hostname, password, serial console behavior). In general, we prefer
auto-configuration (e.g. DHCP) over config files. If you need more
configurability, you may need to replace some of our programs.
