[![Build Status](https://travis-ci.org/gokrazy/gokrazy.svg?branch=master)](https://travis-ci.org/gokrazy/gokrazy)

# Overview

gokrazy packs your Go application(s) into an SD card image for the
Raspberry Pi 3 which — aside from the Linux kernel and proprietary
Raspberry Pi bootloader — only contains Go software.

The motivation is that [@stapelberg](https://github.com/stapelberg)
spends way more time on C software and their various issues than he
would like. Hence, he is going Go-only where feasible.

# Usage

## Installation

[Install Go 1.8](https://golang.org/dl/) if you haven’t already.

Then, use the `go` tool to download and install `gokr-packer`:
```
go get -u github.com/gokrazy/tools/cmd/gokr-packer
```

## Overwriting an SD card for the Raspberry Pi 3

To re-partition and overwrite the SD card `/dev/sdb`, use:

```
sudo setcap CAP_SYS_ADMIN,CAP_DAC_OVERRIDE=ep ~/go/bin/gokr-packer
gokr-packer -overwrite=/dev/sdb github.com/gokrazy/hello
```

Then, put the SD card into your Raspberry Pi 3 and power it up! Once
the Raspberry Pi 3 has booted (takes about 10 seconds), you should be
able to reach the gokrazy web interface at the URL which `gokr-packer`
printed.

Under the hood, `gokr-packer`…

1. …packed the latest [firmware](https://github.com/gokrazy/firmware)
   and [kernel](https://github.com/gokrazy/kernel) binaries into the
   boot file system.

2. …built the specified Go packages using `go install` and packed all
   their binaries into the `/user` directory of the root file system.

3. …created a minimal gokrazy init program which supervises all
   binaries (i.e. restarts them when they exit).

## Updating your installation

To update gokrazy, including the firmware and kernel binaries, use:
```
go get -u github.com/gokrazy/tools/cmd/gokr-packer
```

To update your gokrazy installation (running on a Raspberry Pi 3),
use:
```
gokr-packer -update=http://gokrazy:mysecretpassword@gokrazy/ github.com/gokrazy/hello
```

# SD card contents

gokrazy uses the following partition table:

num | size   | purpose                | file system
----|--------|------------------------|---------------
1   | 100 MB | boot (kernel+firmware) | FAT16B
2   | 500 MB | root2 (gokrazy+apps)   | FAT16B (but see [issue #10](https://github.com/gokrazy/gokrazy/issues/10))
3   | 500 MB | root3 (gokrazy+apps)   | FAT16B (but see [issue #10](https://github.com/gokrazy/gokrazy/issues/10))
4   | rest   | permanent data         | ext4

The two root partitions are used alternatingly (to avoid modifying the
currently active file system) when updating.

If you’d like to store permanent data (i.e. data which will not be
overwritten on the next update), you’ll need to create an ext4 file
system on the last partition. If your SD card is `/dev/sdb`, use
`mkfs.ext4 /dev/sdb4`.

# Customization

## Changing program behavior for gokrazy

`gokr-packer` sets the “gokrazy” [build
tag](https://golang.org/pkg/go/build/#hdr-Build_Constraints) for
conditional compilation.

You can find an example commit which implements a gokrazy-specific
controller that triggers the main program logic every weekday at 10:00
at https://github.com/stapelberg/zkj-nas-tools/commit/6f90ace35981f78dcd66d611269f17f37ce4b4ef

## Changing init behavior

```
gokr-packer \
  -overwrite_init=$(go env GOPATH)/src/github.com/stapelberg/mediaserver/cmd/init/init.go \
  github.com/gokrazy/hello
```

(Note that the package must result in a binary called “init”.)

Then, edit the `github.com/stapelberg/mediaserver` package to your
liking. When done, pack an image with your own init package:
```
gokr-packer \
  -init_pkg=github.com/stapelberg/mediaserver \
  -overwrite=/dev/sdb \
  github.com/gokrazy/hello
```

# Repository structure

* [github.com/gokrazy/gokrazy](https://github.com/gokrazy/gokrazy): system code, main issue tracker, documentation
* [github.com/gokrazy/tools](https://github.com/gokrazy/tools): SD card image creation code, pulling in:
    * [github.com/gokrazy/firmware](https://github.com/gokrazy/firmware): Raspberry Pi 3 firmware files
    * [github.com/gokrazy/kernel](https://github.com/gokrazy/kernel): pre-built kernel image and bootloader config
