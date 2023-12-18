---
title: "Instance Config Reference"
menuTitle: "Instance Config Reference"
weight: 10
---

Each gokrazy instance has a `config.json` file that contains the instance
configuration.

You can open the instance config in your editor by running `gok edit`:

* `gok edit` will open the config of the default instance, which is named “hello”.
* `gok -i scanner edit` will open the config of instance “scanner”.

If you prefer, you can also locate and edit the file directly on disk:
`~/gokrazy/hello/config.json`

This document is a reference, explaining all configuration fields. You don’t
need to read through it all before you first start using gokrazy — follow the
other configuration guides in this section instead. In case anything should be
unclear, you can look at [the `config.go` source
code](https://github.com/gokrazy/internal/blob/main/config/config.go) (and send
feedback, please!).

Older versions of gokrazy only used command-line flags and plain-text config
files instead of a central instance configuration. See the design document
[gokrazy “instance-centric” config
re-design](https://docs.google.com/document/d/1AUDmc8lygLR59O29Oc4ckv-Buk2R9zrvPDO9JbPOts8/edit?usp=sharing)
for details on why the change was made, how old setups are kept working and how
they can be migrated.

Here is a minimal instance configuration example:

```json
{
    "Hostname": "hello",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
```

Most instance configuration files will be more complicated, for example:

```json
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale",
        "github.com/gokrazy/mkfs",
        "github.com/stapelberg/dr"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up"
            ]
        },
        "tailscale.com/cmd/tailscaled": {
            "CommandLineFlags": [
                "--outbound-http-proxy-listen=localhost:9080"
            ]
        },
        "github.com/stapelberg/dr": {
            "Environment": [
                "HTTPS_PROXY=localhost:9080",
                "HTTP_PROXY=localhost:9080"
            ]
        }
    }
}
```

## Hostname {#hostname}

(Corresponds to the former `-hostname` gokr-packer flag.)

The `Hostname` field sets the [hostname](https://en.wikipedia.org/wiki/Hostname)
of your gokrazy instance.

The gokrazy
[DHCP](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol) client
sends this hostname when acquiring a lease, so if hostname resolution is working
in your local network, you will be able to access the device in your browser by
entering the hostname, e.g. `http://hello/` (username `gokrazy`, password as
configured in [`HTTPPassword`](#updatehttppassword) or
`~/.config/gokrazy/http-password.txt`).

**Example:**

{{< highlight json "hl_lines=2" >}}
{
    "Hostname": "example",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

## DeviceType {#devicetype}

(Corresponds to the former `-device_type` gokr-packer flag.)

The `DeviceType` field specifies which kind of target device this gokrazy
instance should be built for.

* empty (""): target the Raspberry Pi (default) or UEFI/BIOS PCs ([router7
  kernel](https://github.com/rtr7/kernel)), depending on the
  [`KernelPackage`](#kernelpackage) and [`FirmwarePackage`](#firmwarepackage)
  you specify.

* `odroidhc1`: target the Odroid XU4/HC1/HC2 devices. This results in an MBR
  without a GPT (as the Odroid devices do not support GPT), and in extra
  bootloader files in the root partition.

The possible values are defined in
[`github.com/gokrazy/internal/deviceconfig` (→ config.go)](https://github.com/gokrazy/internal/blob/main/deviceconfig/config.go)

**Example:**

{{< highlight json "hl_lines=3" >}}
{
    "Hostname": "alternative",
    "DeviceType": "odroidhc1",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

## Packages {#packages}

(Corresponds to the former gokr-packer command line arguments.)

The `Packages` field lists the Go packages that should be built and included in
your gokrazy instance.

Each listed package is a [Go import path](https://go.dev/doc/code#Organization)
referencing an executable Go program (`package main`).

To add a package to a gokrazy instance, use the `gok add` command, which also
works for packages that have not yet been published and are stored on your local
disk.

**Example:**

{{< highlight json "hl_lines=3-9" >}}
{
    "Hostname": "hello",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/stapelberg/scan2drive/cmd/scan2drive"
    ]
}
{{< /highlight >}}


## PackageConfig {#packageconfig}

The `PackageConfig` field specifies how each package listed in `Packages` will
be built into your instance, and how it will be started at runtime.

`PackageConfig` is a map that is keyed by the package Go import path.

See also the [Package Config](/userguide/package-config/) page.

### PackageConfig → GoBuildFlags {#packagegobuildflags}

(Corresponds to the former `buildflags` per-package directory text files.)

The `GoBuildFlags` field configures extra arguments that the `gok` CLI passes to
`go build` when building your [`Packages`](#packages). See [the `cmd/go`
documentation](https://pkg.go.dev/cmd/go#hdr-Compile_packages_and_dependencies)
for available flags.

To pass build tags, do not use `-tags=mycustomtag`, as that will overwrite
gokrazy’s own build tags. Instead, set the [`GoBuildTags`](#packagegobuildtags)
field.

Note that no shell escaping or quoting (with single or double quotes) is
required. The build flags are passed when calling `go build` via [the `exec`
system call](https://en.wikipedia.org/wiki/Exec_(system_call)).

**Example:**

{{< highlight json "hl_lines=10-16" >}}
{
    "Hostname": "scanner",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/stapelberg/scan2drive/cmd/scan2drive"
    ],
    "PackageConfig": {
        "github.com/stapelberg/scan2drive/cmd/scan2drive": {
            "GoBuildFlags": [
                "-ldflags=-linkmode external -extldflags -static"
            ]
        }
    }
}
{{< /highlight >}}

### PackageConfig → GoBuildTags {#packagegobuildtags}

(Corresponds to the former `buildtags` per-package directory text files.)

The `GoBuildTags` field configures additional [Go build
tags](https://pkg.go.dev/cmd/go#hdr-Build_constraints) (also known as build
constraints) to use when building your program.

Note: Some Go packages use build tags to optionally build code which uses
[cgo](https://go.dev/blog/cgo). Because gokrazy intentionally does not include a
C runtime environment, configuring such build tags results either in compilation
failures, or in programs that compile but won’t start. But, for certain specific
use-cases (`scan2drive`’s turbojpeg support, for example), you can enable just
enough cgo to end up with a fully statically linked program, which does work on
gokrazy.

**Example:**

{{< highlight json "hl_lines=10-16" >}}
{
    "Hostname": "scanner",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/stapelberg/scan2drive/cmd/scan2drive"
    ],
    "PackageConfig": {
        "github.com/stapelberg/scan2drive/cmd/scan2drive": {
            "GoBuildTags": [
                "turbojpeg"
            ]
        }
    }
}
{{< /highlight >}}


### PackageConfig → Environment {#packageenvironment}

(Corresponds to the former `env` per-package directory text files.)

The `Environment` field configures [environment
variables](https://en.wikipedia.org/wiki/Environment_variable) that will be set
when starting your program.

Each entry is a `key=value` pair, like in Go’s
[`os.Environ()`](https://pkg.go.dev/os#Environ).

**Example:**

{{< highlight json "hl_lines=10-17" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/stapelberg/dr"
    ],
    "PackageConfig": {
        "github.com/stapelberg/dr": {
            "Environment": [
                "HTTPS_PROXY=localhost:9080",
                "HTTP_PROXY=localhost:9080"
            ]
        }
    }
}
{{< /highlight >}}


### PackageConfig → CommandLineFlags {#packagecommandlineflags}

(Corresponds to the former `flags` per-package directory text files.)

The `CommandLineFlags` field configures [command line
flags](https://en.wikipedia.org/wiki/Command-line_interface#Arguments) that will
be set when starting your program.

Note that no shell escaping or quoting (with single or double quotes) is
required. The command line flags are passed when starting your program via [the
`exec` system call](https://en.wikipedia.org/wiki/Exec_(system_call)).

**Example:**

{{< highlight json "hl_lines=10-17" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscaled": {
            "CommandLineFlags": [
                "--port=41641",
                "--outbound-http-proxy-listen=localhost:9080"
            ]
        }
    }
}
{{< /highlight >}}

### PackageConfig → DontStart {#packagedontstart}

(Corresponds to the former `dontstart` per-package directory text files.)

Enabling the `DontStart` field makes the gokrazy init system not start your
program automatically.

You can still start the program manually via the web interface, or interactively
via `breakglass`.

This is useful for programs that are interactive command line tools, instead of
permanently running services.

**Example:**

{{< highlight json "hl_lines=11-15" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "DontStart": true
        }
    }
}
{{< /highlight >}}

### PackageConfig → WaitForClock {#packagewaitforclock}

(Corresponds to the former `waitforclock` per-package directory text files.)

The `WaitForClock` field makes the gokrazy init system wait for clock
synchronization before starting the program. This is useful when modifying the
program source to call
[`gokrazy.WaitForClock()`](https://pkg.go.dev/github.com/gokrazy/gokrazy#WaitForClock)
is inconvenient.

**Example:**

{{< highlight json "hl_lines=10-14" >}}
{
    "Hostname": "scanner",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/stapelberg/scan2drive/cmd/scan2drive"
    ],
    "PackageConfig": {
        "github.com/stapelberg/scan2drive/cmd/scan2drive": {
            "WaitForClock": true
        }
    }
}
{{< /highlight >}}

### PackageConfig → ExtraFileContents {#packageextrafilecontents}

(Corresponds to the former `extrafiles` per-package directory text files.)

The `ExtraFileContents` field allows adding extra files into the root file
system of your gokrazy instance. Any file aside from the built Go program
(e.g. `scan2drive`) is considered extra.

`ExtraFileContents` is a map from root file system destination path
(e.g. `/etc/caddy/Caddyfile`) to the plain text contents of the extra file.

The extra file will be created as a regular file (not executable) with default
permissions (UNIX mode `644`, or `-rw-r--r--`). Note that gokrazy’s root file
system is read-only.

It can be more convenient to manage extra files as standalone, separate files
(not as part of `config.json`), which the
[`ExtraFilePaths`](#packageextrafilepaths) field allows you to do.

**Example:**

{{< highlight json "hl_lines=10-20" >}}
{
    "Hostname": "webserver",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/caddyserver/caddy/v2/cmd/caddy"
    ],
    "PackageConfig": {
        "github.com/caddyserver/caddy/v2/cmd/caddy": {
            "ExtraFileContents": {
                "/etc/caddy/Caddyfile": "http://:8080 {
	root * /tmp
	file_server browse
}
"
            }
        }
    }
}
{{< /highlight >}}

### PackageConfig → ExtraFilePaths {#packageextrafilepaths}

(Corresponds to the former `extrafiles` per-package directory text files.)

The `ExtraFilePaths` field allows adding extra files into the root file
system of your gokrazy instance. Any file aside from the built Go program
(e.g. `scan2drive`) is considered extra.

`ExtraFilePaths` is a map from root file system destination path
(e.g. `/etc/caddy/Caddyfile`) to a relative or absolute path of the extra files
to include. Relative paths are relative to the instance directory,
e.g. `~/gokrazy/hello` — the same directory in which `config.json` lives.

The extra file path can refer to one of:

- a regular file. File modes are retained, including the executable bit.
- a directory. All files and directories within the directory are recursively
  included.
- a [.tar archive](https://en.wikipedia.org/wiki/Tar_(computing)):
  `<path>.tar`. All files contained in the archive are included.
- an architecture-dependent .tar file: `<path>_<target_goarch>.tar`, for example
  `firmware_amd64.tar`

Go packages that target gokrazy can optionally include a `_gokrazy` directory,
in which gokrazy will look for extrafiles. Conceptually, the directory is
handled as if you had configured `ExtraFilePaths:
"/home/michael/go/src/github.com/gokrazy/wifi/_gokrazy/extrafiles"`.

**Example:**

{{< highlight json "hl_lines=10-16" >}}
{
    "Hostname": "webserver",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/caddyserver/caddy/v2/cmd/caddy"
    ],
    "PackageConfig": {
        "github.com/caddyserver/caddy/v2/cmd/caddy": {
            "ExtraFilePaths": {
                "/etc/caddy/Caddyfile": "Caddyfile"
            }
        }
    }
}
{{< /highlight >}}

```bash
cat > ~/gokrazy/webserver/Caddyfile <<'EOT'
http://:80 {
	root * /tmp
	file_server browse 
}
EOT
```

## SerialConsole {#serialconsole}

(Corresponds to the former `-serial_console` gokr-packer flag.)

The `SerialConsole` field controls whether the Linux kernel provides a serial
console on the Raspberry Pi’s UART0 RX/TX ports (see
[pinout.xyz](https://pinout.xyz)). To use this serial console, a popular option
is to connect a USB-to-serial adapter.

Linux supports multiple consoles, but only one can be the default
console. Kernel messages during boot will be printed to the default
console. When you turn off the serial console, the default console will be shown
on the HDMI output, and accept input from the USB keyboard.

The advantage of using a serial console is that you can easily save the entire
boot output to a file on a separate computer (whereas with an HDMI console, text
scrolls by very fast), and you can get debug output from the Raspberry Pi
bootloader as well for debugging.

* `serial0,115200` (default if unset) enables UART0 as a serial console with
  115200 baud. This value is used as `console=` Linux kernel parameter, so use
  values like `ttyS0,115200` if you want to use a different serial port for your
  console, e.g. when running gokrazy on a PC.
* `disabled` will disable the serial console (the default console will be HDMI),
  which frees up the serial port for usage by your applications.
* `off` sets `enable_uart=0` in `config.txt` for the Raspberry Pi firmware,
  which will save a little bit of power by running the Pi at lower clock speeds.

If you want to write an application that uses the serial port, open
`/dev/serial0`
([example](https://github.com/stapelberg/hmgo/blob/4c33c14a7c1e2e2baeccd53f281e440c4653d67b/ccu.go#L92)),
which is a symlink that points to the device handling the RX/TX pins (typically
`ttyAMA0` or `ttyS0`).

**Example:**

{{< highlight json "hl_lines=9" >}}
{
    "Hostname": "router7",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "SerialConsole": "ttyS0,115200"
}
{{< /highlight >}}

## GokrazyPackages {#gokrazypackages}

(Corresponds to the former `-gokrazy_pkgs` gokr-packer flag.)

Aside from the user-specified [`Packages`](#packages), a gokrazy instance also
includes a couple of packages that are considered part of the system, because
they are needed to boot the system into a useful state. These are placed in the
`/gokrazy` directory (other packages are placed in the `/user` directory).

If unset, the following packages will be included by default:
* `github.com/gokrazy/gokrazy/cmd/dhcp` sets the IP address after obtaining a
  [DHCPv4](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)
  lease.
* `github.com/gokrazy/gokrazy/cmd/ntp` synchronizes the hardware clock via
  [NTP](https://en.wikipedia.org/wiki/Network_Time_Protocol).
* `github.com/gokrazy/gokrazy/cmd/randomd` stores/loads a kernel [random
  seed](https://en.wikipedia.org/wiki/Random_seed) across boots.

Typically you don’t need to configure this field, but it can be useful to
overwrite the `GokrazyPackages` if some component clashes with how you want to
use your device. For example, for [router7](https://router7.org), I need to
remove the gokrazy `dhcp` package as router7 has its own DHCP client. Or, if you
were building a local NTP server, you might want to remove the gokrazy `ntp`
package.

**Example:**

{{< highlight json "hl_lines=9-12" >}}
{
    "Hostname": "router7",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "GokrazyPackages": [
        "github.com/gokrazy/gokrazy/cmd/ntp",
        "github.com/gokrazy/gokrazy/cmd/randomd"
    ]
}
{{< /highlight >}}


## KernelPackage {#kernelpackage}

(Corresponds to the former `-kernel_package` gokr-packer flag.)

The `KernelPackage` field specifies a Go import path that references a package
which does not contain any Go code, but instead contains a Linux kernel image
(`vmlinuz`).

The following files are taken from the kernel package directory and are included
in the boot file system of your gokrazy instance:

- `vmlinuz`, a compiled Linux kernel image
- `*.dtb`, [Linux device tree](https://en.wikipedia.org/wiki/Devicetree) files
- `boot.scr`, [U-Boot script](https://en.wikipedia.org/wiki/Das_U-Boot)

Additionally, the `lib/modules` subdirectory (containing loadable Linux kernel
modules) is included in the root file system. Note that these modules are only
included, but not automatically loaded (there is no `udev` or equivalent on
gokrazy). If you need to load modules for your hardware, see
[`bluetooth.go`](https://github.com/gokrazy/bluetooth/blob/main/bluetooth.go)
for an example program that loads kernel modules.

Default if unset: `github.com/gokrazy/kernel`

**Example:**

{{< highlight json "hl_lines=9" >}}
{
    "Hostname": "router7",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "KernelPackage": "github.com/rtr7/kernel"
}
{{< /highlight >}}

## FirmwarePackage {#firmwarepackage}

(Corresponds to the former `-firmware_package` gokr-packer flag.)

The `FirmwarePackage` field specifies a Go import path that references a package
which does not contain any Go code, but instead contains Raspberry Pi firmware
files.

The following files are taken from the firmware package directory and are
included in the boot file system of your gokrazy instance:

- `*.bin`, Raspberry Pi firmware files
- `*.dat`, Raspberry Pi firmware files
- `*.elf`, Raspberry Pi firmware files
- `*.upd`, Raspberry Pi EEPROM update files
- `*.sig`, Raspberry Pi EEPROM update signatures
- `overlays/*.dtbo`, Device Tree overlay files for the Raspberry Pi OS kernel

Default if unset: `github.com/gokrazy/firmware`

If empty, no files will be included.

**Example:**

{{< highlight json "hl_lines=9" >}}
{
    "Hostname": "router7",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "FirmwarePackage": ""
}
{{< /highlight >}}

## EEPROMPackage {#eeprompackage}

(Corresponds to the former `-eeprom_package` gokr-packer flag.)

The `EEPROMPackage` field specifies a Go import path that references a package
which does not contain any Go code, but instead contains Raspberry Pi EEPROM
update files.

The following files are taken from the firmware package directory and are
included in the boot file system of your gokrazy instance:

- `pieeprom-*.bin`, Raspberry Pi EEPROM update files
- `recovery.bin`, Raspberry Pi EEPROM update files
- `lv805-*.bin`, Raspberry Pi EEPROM update files

Default if unset: `github.com/gokrazy/rpi-eeprom`

If empty, no files will be included.

**Example:**

{{< highlight json "hl_lines=9" >}}
{
    "Hostname": "router7",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "EEPROMPackage": ""
}
{{< /highlight >}}

## Bootloader configuration {#bootloader}

The Raspberry Pi’s “system configuration parameters” (interpreted by the
bootloader, or “boot firmware”) can be configured via [the `config.txt`
file](https://www.raspberrypi.com/documentation/computers/config_txt.html) on
the boot file system.

The `BootloaderExtraLines` array contains one string per extra line that should
be added to `config.txt` when the gokrazy packer creates the boot file system.

This allows enabling the [Raspberry Pi-provided Device Tree
Overlays](https://www.raspberrypi.com/documentation/computers/configuration.html#part3.1)
— the example below enables [1-Wire](https://en.wikipedia.org/wiki/1-Wire)
support. Note that not all Device Tree Overlays are guaranteed to work;
compatibility depends on whether the upstream Linux driver matches the Raspberry
Pi OS Linux driver.

**Example:**

{{< highlight json "hl_lines=9-11" >}}
{
    "Hostname": "hello",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "BootloaderExtraLines": [
	    "dtoverlay=w1-gpio"
	]
}
{{< /highlight >}}

## Update {#update}

The `Update` field contains a struct that configures how gokrazy updates are done.

You typically don’t need to configure the `Update` field.

### Update → Hostname {#updatehostname}

Hostname (in UpdateStruct) overrides Struct.Hostname, but only for
deploying the update via HTTP, not in the generated image.

### Update → UseTLS {#updateusetls}

The `UseTLS` field accepts the following values:

- empty (""): use TLS if certificates already exist on disk
- `off`: disable TLS even if certificates exist
- `self-signed`: create (self-signed) TLS certificates if needed

See [Using TLS in untrusted networks](/userguide/tls-for-untrusted-networks/)
for more details.

**Example:**

{{< highlight json "hl_lines=5" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPassword": "secret",
        "UseTLS": "self-signed"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

### Update → HTTPPort {#updatehttpport}

(Corresponds to the former `-http_port` gokr-packer flag.)

The `HTTPPort` field sets the HTTP port (port 80 by default) on which the
gokrazy web interface will be available. This field controls both: which port
your gokrazy instance listens on (server), and which port the `gok` CLI will use
for updating your instance (client).

It can be useful to configure a different port if you want to [run a web server
on port 80](/packages/caddy-http-server/), for example.

If [`UseTLS`](#updateusetls) is enabled, this field is ignored and
[`HTTPSPort`](#updatehttpsport) is used instead.

**Example:**

{{< highlight json "hl_lines=5" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPassword": "secret",
        "HTTPPort": "1080"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

### Update → HTTPSPort {#updatehttpsport}

(Corresponds to the former `-https_port` gokr-packer flag.)

See [`HTTPPort`](#updatehttpport), but [when TLS is enabled](#updateusetls)
(default 443).

**Example:**

{{< highlight json "hl_lines=5-6" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPassword": "secret",
        "UseTLS": "self-signed",
        "HTTPSPort": "8443"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

### Update → HTTPPassword {#updatehttppassword}

(Corresponds to the former `http-password.txt` host-specific config file.)

The `HTTPPassword` field configures the secret password that allows accessing
and updating your gokrazy instance.

When creating a new gokrazy instance (`gok new`), the `gok` CLI will create a
random password.

**Example:**

{{< highlight json "hl_lines=4" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPassword": "secret"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

### Update → CertPEM {#updatecertpem}

(Corresponds to the former `cert.pem` host-specific config file.)

[When enabling TLS](#updateusetls), the `CertPEM` field allows you to use a
custom certificate file. This can be useful if you already have a certificate
setup for your environment (self-signed or otherwise).

**Example:**

{{< highlight json "hl_lines=5-6" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPassword": "secret",
        "CertPEM": "/home/michael/.ca/webservercert.pem",
        "KeyPEM": "/home/michael/.ca/webserverkey.pem"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}


### Update → KeyPEM {#updatekeypem}

(Corresponds to the former `key.pem` host-specific config file.)

Like [`CertPEM`](#updatecertpem), but for the private key instead of the
certificate.
