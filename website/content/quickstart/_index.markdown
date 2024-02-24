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

If you don’t already have Go installed, <a href="https://golang.org/dl/">install the latest Go version</a>.

## Prep: Install the gok CLI

Now that you have a working Go installation, install the <code>gok</code> command line tool (CLI):

```bash
go install github.com/gokrazy/tools/cmd/gok@main
```

## Step 1: Insert an SD card

Run `watch -d1 ls -l '/dev/disk/by-id/*'` (see the [permanent data section](https://gokrazy.org/userguide/permanent-data/section) for macOS instructions)
and insert an SD card. Copy the highlighted device name:

<script id="asciicast-G0PosAYGvUSnB3htMpLIz0p68" src="https://asciinema.org/a/G0PosAYGvUSnB3htMpLIz0p68.js" async></script>

In this example, we’ll assume the SD card is accessible as <code>/dev/sdx</code>.

## Step 2: Create a gokrazy instance and overwrite an SD card with gokrazy

Create a directory for this gokrazy instance:

```bash
gok new
# creates an instance named “hello” in --parent_dir default directory ~/gokrazy
# alternatively, to use a different instance name: gok -i myname new
```

If you’re curious, you can run `gok edit` to open the generated `config.json` in
your editor.

To overwrite the entire SD card <code>/dev/sdx</code> with a build of this
gokrazy installation, use:

```bash
gok overwrite --full /dev/sdx
```

The following packages are included in newly created instances by default:

* github.com/gokrazy/fbstatus
* github.com/gokrazy/hello
* github.com/gokrazy/serial-busybox

The gokrazy packer builds each specified Go program
(e.g. `github.com/gokrazy/hello`) in a separate build directory, each with its
own `go.mod` file. See [Working with Go modules](/development/modules/) for more
details.

This is what the above `gok` commands look like in action:

<script id="asciicast-Va7hPXCP1BKCt4DX0wRup52Bl" src="https://asciinema.org/a/Va7hPXCP1BKCt4DX0wRup52Bl.js" async></script>

<details>

<summary style="display: list-item">
Click here to show the <code>gok</code> log output
</summary>

```text
gokrazy gok ga84f00+ on GOARCH=amd64 GOOS=linux

Build target: CGO_ENABLED=0 GOARCH=arm64 GOOS=linux
Build timestamp: 2023-01-12T23:36:34+01:00
Loading system CA certificates from /etc/ssl/certs/ca-certificates.crt
Building 4 Go packages:

  github.com/gokrazy/fbstatus

  github.com/gokrazy/hello

  github.com/gokrazy/serial-busybox

  github.com/gokrazy/breakglass
    will be started with command-line flags
      from /home/michael/gokrazy/hello/config.json
      last modified: 2023-01-12T23:36:23+01:00 (10s ago)

[done] in 1.40s

Including extra files for Go packages:

  github.com/gokrazy/breakglass
    will include extra files in the root file system
      from /home/michael/gokrazy/hello/breakglass.authorized_keys
      last modified: 2023-01-12T23:36:23+01:00 (12s ago)

Including loadable kernel modules from:
/home/michael/go/pkg/mod/github.com/gokrazy/kernel@v0.0.0-20230111172439-0cd82b0bec82/lib/modules

Feature summary:
  use GPT: true
  use PARTUUID: true
  use GPT PARTUUID: true
2023/01/12 23:36:36 partitioning /dev/disk/by-id/usb-TS-RDF5_SD_Transcend_000000000037-0:0 (GPT + Hybrid MBR)
2023/01/12 23:36:36 device holds 15931539456 bytes
2023/01/12 23:36:36 Re-reading partition table failed: permission denied. Remember to unplug and re-plug the SD card before creating a file system for persistent data, if desired.

Creating boot file system
[creating boot file system]
Kernel directory: /home/michael/go/pkg/mod/github.com/gokrazy/kernel@v0.0.0-20230111172439-0cd82b0bec82
EEPROM update summary:
  pieeprom.upd (sig d1e44edf33)
  recovery.bin
  vl805.bin (sig 6246230ecd)
[done] in 0.18s, 71 MiB
MBR summary:
  LBAs: vmlinuz=51795 cmdline.txt=144875
  PARTUUID: 4f9f2cab

Creating root file system
[done] in 0.33s
If your applications need to store persistent data, unplug and re-plug the SD card, then create a file system using e.g.:

	mkfs.ext4 /dev/disk/by-partuuid/60c24cc1-f3f9-427a-8199-4f9f2cab0004

To boot gokrazy, plug the SD card into a supported device (see https://gokrazy.org/platforms/)


Build complete!

To interact with the device, gokrazy provides a web interface reachable at:

	http://gokrazy:<automatically-generated-random-password>@hello/

In addition, the following Linux consoles are set up:

	1. foreground Linux framebuffer console on HDMI

```

</details>

It is safe to unplug your SD card once <code>gok</code> returns.

## Step 3: Boot gokrazy

After booting from this SD card, your device will:

- display system status on the monitor connected via HDMI, if any
- obtain an IP address for hostname “gokrazy” via DHCP (IPv4) and SLAAC (IPv6)
- synchronize the clock using NTP
- expose a password-authenticated web interface on private IP addresses<br>
  (each instance gets its own password in the `Update` → `HTTPPassword` key of its `config.json`, see `gok edit`)
- supervise all installed programs (only the hello world program in this example)

To interact with your device, you can:

1. Open the gokrazy web interface in your browser (easiest option)
1. Attach a serial console (see below)
1. Use the [breakglass](https://github.com/gokrazy/breakglass) package to start an interactive SSH session. `gok new` sets it up by default.

Congratulations! 🎉 You now have a working gokrazy installation!

Next, see the [Configuration guide](/userguide/) for details on how to use other
programs.

## Optional: Using the serial console

See also: [Configuration → Instance Config Reference →
SerialConsole](/userguide/instance-config/#serialconsole)

If you prefer the serial console, you can optionally connect a serial adapter to
the Raspberry Pi and remove the `"SerialConsole": "disabled"` line from your gokrazy
instance’s `config.json` to make the primary Linux console end up on the serial
console.

When pressing <code>Enter</code> on the serial console, gokrazy will
interactively start either:

1. `/tmp/serial-busybox/ash` (provided by the [serial-busybox](https://github.com/gokrazy/serial-busybox) package)
1. `/perm/sh`, if present (supplied by you, the user)
