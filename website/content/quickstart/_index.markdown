+++
title = "Quickstart"
chapter = false
pre = "<b>1. </b>"
weight = 1
#aliases:
#  - /quickstart.html
+++

## Prep: pick a supported device

Currently, the Raspberry Pi 4 B is the recommended platform for
using gokrazy, but you can find
other <a href="/platforms/">supported and upcoming platforms</a>.

## Prep: Install Go

If you don’t already have Go installed, install the latest <a href="https://golang.org/dl/">Go</a> version.

## Prep: Install the gokrazy packer

Now that you have a working Go installation, install the gokrazy packer (<code>gokr-packer</code>):

```shell
go install github.com/gokrazy/tools/cmd/gokr-packer@latest
```

## Step 1: Insert an SD card

Run `watch -d1 ls -l '/dev/disk/by-id/*'` and insert an SD card. Copy the
highlighted device name:

<script id="asciicast-G0PosAYGvUSnB3htMpLIz0p68" src="https://asciinema.org/a/G0PosAYGvUSnB3htMpLIz0p68.js" async></script>

In this example, we’ll assume the SD card is accessible as <code>/dev/sdx</code>.

## Step 2: Create a gokrazy instance and overwrite an SD card with gokrazy

Create a directory for this gokrazy instance and initialize a Go module:

```shell
INSTANCE=gokrazy/hello
mkdir -p ~/${INSTANCE?}
cd ~/${INSTANCE?}
go mod init hello
```

To overwrite the entire SD card <code>/dev/sdx</code> with a gokrazy installation running a hello world program, use:

```shell
gokr-packer \
  -overwrite=/dev/sdx \
  -serial_console=disabled \
  github.com/gokrazy/fbstatus \
  github.com/gokrazy/hello \
  github.com/gokrazy/serial-busybox
```

<script id="asciicast-3DFZZaNvXuhHrSjnHRywT8KyO" src="https://asciinema.org/a/3DFZZaNvXuhHrSjnHRywT8KyO.js" async></script>

<details>

<summary style="display: list-item">
Click here to show the <code>gokr-packer</code> log output
</summary>

```text
gokrazy packer v0.0.0-20211121205320-688793dda2da on GOARCH=amd64 GOOS=linux

Build target: CGO_ENABLED=0 GOARCH=arm64 GOOS=linux
Build timestamp: 2021-11-25T09:28:41+01:00
Loading system CA certificates from /etc/ssl/certs/ca-certificates.crt
Building 3 Go packages:

  github.com/gokrazy/fbstatus

  github.com/gokrazy/hello

  github.com/gokrazy/serial-busybox

[done] in 0.48s

Feature summary:
  use PARTUUID: true
  use GPT PARTUUID: true
2021/11/25 09:28:42 partitioning /dev/sdx (GPT + Hybrid MBR)
2021/11/25 09:28:42 Using sudo to gain permission to format /dev/sdx
2021/11/25 09:28:42 If you prefer, cancel and use: sudo setfacl -m u:${USER}:rw /dev/sdx
2021/11/25 09:28:42 device holds 15931539456 bytes

Creating boot file system
Kernel directory: /home/michael/go/src/github.com/gokrazy/kernel
EEPROM update summary:
  pieeprom.upd (sig 5a07872332)
  recovery.bin
  vl805.bin (sig 3a46dda0da)
[done: creating boot file system] in 0.11s, 66 MiB
MBR summary:
  LBAs: vmlinuz=52150 cmdline.txt=135442
  PARTUUID: 2e18c40c

Creating root file system
[done: creating root file system] in 0.26s

If your applications need to store persistent data, unplug and re-plug the SD card, then create a file system using e.g.:

	mkfs.ext4 /dev/disk/by-partuuid/60c24cc1-f3f9-427a-8199-2e18c40c0004

To boot gokrazy, plug the SD card into a Raspberry Pi 3 or 4 (no other models supported)

Build complete!

To interact with the device, gokrazy provides a web interface reachable at:

	http://gokrazy:<i>&lt;automatically-generated-random-password&gt;</i>@gokrazy/

In addition, the following Linux consoles are set up:

	1. foreground Linux framebuffer console on HDMI
```

</details>

It is safe to unplug your SD card once <code>gokr-packer</code> returns.

## Step 3: Boot gokrazy

After booting from this SD card, your device will:

- display system status on the monitor connected via HDMI, if any
- obtain an IP address for hostname “gokrazy” via DHCP (IPv4) and SLAAC (IPv6)
- synchronize the clock using NTP
- expose a password-authenticated web interface on private IP addresses<br>
  (the default password can be recovered from <code>~/.config/gokrazy/http-password.txt</code>)
- supervise all installed programs (only the hello world program in this example)

To interact with your device, you can:

1. Open the gokrazy web interface in your browser (easiest option)
1. Attach a serial console (see below)
1. Install [breakglass](https://github.com/gokrazy/breakglass) via the gokrazy packer, which allows you to start an interactive SSH session.

Congratulations! 🎉 You now have a working gokrazy installation!

Next, see the [Configuration guide](/userguide/) for details on how to user other
programs.

## Optional: Using the serial console

If you prefer the serial console, you can optionally connect a serial adapter to
the Raspberry Pi and remove the <code>-serial_console=disabled</code> flag to
make the primary Linux console end up on the serial console.

When pressing <code>Enter</code> on the serial console, gokrazy will
interactively start either:

1. `/tmp/serial-busybox/ash` (provided by the [serial-busybox](https://github.com/gokrazy/serial-busybox) package)
1. `/perm/sh`, if present (supplied by you, the user)
