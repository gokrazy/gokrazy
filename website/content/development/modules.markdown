---
layout: default
title: Working with Go modules
weight: 30
aliases:
  - /userguide/modules/
---

If you are not yet familiar with Go modules in general (outside of gokrazy),
please [read the Go wiki page on
Modules](https://github.com/golang/go/wiki/Modules) first.

[Since September
2022](https://github.com/gokrazy/tools/commit/c3979e1ceb3ea4fe02b78b2c1493c8128a5dc3f9),
the gokrazy packer builds each package in its own build directory, with its own
`go.mod` and `go.sum` files. This is done for isolation: if you update one
program, that will not have any effect on the other programs you include in your
gokrazy instance.

## Example setup

Throughout this page, let’s assume your gokrazy instance directory is
`~/gokrazy/scan2drive`, and that’s where you run the following `gokr-packer`
command:

```shell
gokr-packer \
  -update=yes \
  -serial_console=disabled \
  github.com/gokrazy/fbstatus \
  github.com/gokrazy/hello \
  github.com/gokrazy/serial-busybox \
  github.com/stapelberg/scan2drive/cmd/scan2drive

```

The packer will create the following build directory structure:

```text
% find . -name go.mod
./builddir/init/go.mod
./builddir/github.com/stapelberg/scan2drive/cmd/scan2drive/go.mod
./builddir/github.com/gokrazy/serial-busybox/go.mod
./builddir/github.com/gokrazy/hello/go.mod
./builddir/github.com/gokrazy/fbstatus/go.mod
./builddir/github.com/gokrazy/gokrazy/go.mod
./builddir/github.com/gokrazy/gokrazy/cmd/randomd/go.mod
./builddir/github.com/gokrazy/gokrazy/cmd/ntp/go.mod
./builddir/github.com/gokrazy/gokrazy/cmd/dhcp/go.mod
./builddir/github.com/gokrazy/rpi-eeprom/go.mod
./builddir/github.com/gokrazy/firmware/go.mod
./builddir/github.com/gokrazy/kernel/go.mod
```

You can see that there is one subdirectory for each package explicitly specified
on the command line, plus a couple extra ones that gokrazy always installs,
e.g. `github.com/gokrazy/gokrazy/cmd/dhcp`.

## Top-level go.mod template

If you want to influence the content of any *newly created* `go.mod` (no effect
on existing `go.mod` files), you can create a `go.mod` template in your instance
directory: `~/gokrazy/scan2drive/go.mod`.

## Building local code: the replace directive

Go modules are loaded from the internet by default and are stored read-only on
disk.

If you want to make the gokrazy packer pick up a local working copy with your
own changes instead, use the replace directive:

```text
# Create a local working copy in whichever directory you like.
% cd ~/projects
% git clone https://github.com/stapelberg/scan2drive
% cd scan2drive
# make some changes

# Switch to your gokrazy instance directory,
# …and specifically to the scan2drive build directory,
# to add a replace directive to go.mod:
% cd ~/gokrazy/scan2drive
% cd builddir/github.com/stapelberg/scan2drive/cmd/scan2drive
% go mod edit -replace \
  github.com/stapelberg/scan2drive=/home/michael/projects/scan2drive
```

For more details on the `replace` directive, see [the Go
wiki](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive).

## Influencing the granularity

Often, one Go *package* will be the only package you use from a certain Go
*module*. But this isn’t always the case: for example, the system packages
`github.com/gokrazy/gokrazy/cmd/dhcp` and `github.com/gokrazy/gokrazy/cmd/ntp`
both come from the `github.com/gokrazy/gokrazy` module.

The packer will by default create a separate builddir, including a separate
`go.mod` and `go.sum`, for each package, even when they come from the same
module.

If you want to add module-wide replace directives to your `go.mod` file, you can
influence the granularity at which gokr-packer works as follows.

Move the `go.mod`/`go.sum` files to the directory level within the `builddir/`
hierarchy at which you would like to work. gokr-packer will look for
`go.mod`/`go.sum` files at the package level, going one level up until it finds
the files.

Hence, you can use the following locations, ordered from finest to coarsest
granularity:

1. per-package builddir (default), e.g.:
   `builddir/github.com/gokrazy/gokrazy/cmd/dhcp/go.mod`

2. per-module builddir (convenient when working with replace directives), e.g.:
   `builddir/github.com/gokrazy/gokrazy/go.mod`

3. per-org builddir (convenient for wide-reaching replace directives), e.g.:
   `builddir/github.com/gokrazy/go.mod`

4. single builddir, preserving the previous behavior, e.g.:
   `builddir/go.mod`
