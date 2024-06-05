---
layout: default
title: Supported platforms
pre: "<b>2. </b>"
weight: 2
aliases:
  - /platforms.html
---

## Recommended: Raspberry Pi 4 B

gokrazy development happens primarily on the Raspberry Pi 4 B.

{{< figure src="/img/pi4b.jpg" width="200" height="200" align="right" >}}

<!--<img src="/img/pi4b.jpg" width="200" align="right">-->

## All currently supported platforms

### Raspberry Pi 4 B

{{< figure src="/img/pi4b.jpg" width="150" >}}

### PC Engines APU

{{< figure src="/img/apu2c4.jpg" width="150" >}}

### Raspberry Pi Zero 2 W

{{< figure src="/img/pizero2w.jpg" width="150" >}}

### Raspberry Pi 3 B and 3 B+

{{< figure src="/img/pi3b.jpg" width="150" >}}

## Continuous Integration (CI)

Appliances which are marked in <strong>bold</strong> are tested in the CI
setup on real hardware and gate new kernel and firmware versions, and hence
can be considered supported.

Non-bold appliances are supported in a best-effort way, meaning they might be
temporarily broken at HEAD.

The leading <code>github.com</code> in front of package import paths has been omitted for space reasons.

| Target    | Hardware    | GOARCH | Kernel package   | Firmware package   | Appliances                                                                    |
| --------- | ----------- | ------ | ---------------- | ------------------ | ----------------------------------------------------------------------------- |
| apu2c4    | apu2c4      | amd64  | [rtr7/kernel]    | [rtr7/kernel]      | **[gokrazy/bakery/cmd/bake]**                                                 |
|           |             |        |                  |                    | [rtr7/router7]                                                                |
| x86-64    | qemu        | amd64  | [rtr7/kernel]    | [rtr7/kernel]      | **[gokrazy/bakery/cmd/bake]**                                                 |
| rpi4b     | raspi4b     | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**<br>[stapelberg/hmgo]<br>[stapelberg/scan2drive] |
| rpi3b     | raspi3b     | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**                                                 |
| rpi3b+    | raspi3b+    | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**                                                 |
| rpizero2w | raspizero2w | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**                                                 |

[rtr7/kernel]: https://github.com/rtr7/kernel
[gokrazy/bakery/cmd/bake]: https://github.com/gokrazy/bakery
[rtr7/router7]: https://github.com/rtr7/router7
[gokrazy/kernel]: https://github.com/gokrazy/kernel
[gokrazy/firmware]: https://github.com/gokrazy/firmware
[stapelberg/hmgo]: https://github.com/stapelberg/hmgo
[stapelberg/scan2drive]: https://github.com/stapelberg/scan2drive

## Performance

The turbojpeg encoding column is the result of running scan2drive’s [`turbojpeg`
micro-benchmark](https://github.com/stapelberg/scan2drive/blob/9856bfff7118111062998dc5034b9f7e4709101b/internal/turbojpeg/bench_test.go)

The json column is the result of running the `json` benchmark from the
[x/benchmarks repo](https://pkg.go.dev/golang.org/x/benchmarks).

| Hardware    | turbojpeg encoding | json   |
| ----------- | ------------------ | ------ |
| raspi5b     | 0.32s              | 24ms   |
| raspi4b     | 1.00s              | 38ms   |
| raspi3b     | 1.05s              | 216ms  |
| raspizero2w | 1.04s              | 184ms  |

## Power Usage

These power measurements were done using a [myStrom WiFi
Switch](https://mystrom.ch/de/wifi-switch/) with measurement feature.

The Raspberry Pi 4 and Pi 5 were using their original Raspberry Pi power supply,
the others were measured with a random USB power supply.

An Ethernet cable was connected in all tests, WiFi was not enabled.

| Hardware    | Power Usage (with Ethernet) | Power Usage (with HDMI and WiFi) |
| ----------- | -----------                 | -----------------------          |
| apu2c4      | 4.0W                        | n/a                              |
| raspi5b     | 3.2W                        | 3.5W                             |
| raspi4b     | 2.8W                        | 3.3W                             |
| raspi3b+    | 2.5W                        | TODO                             |
| raspi3b     | 1.5W                        | TODO                             |
| raspizero2w | 0.8W                        | TODO                             |

## Hardware Support

| Hardware    | WiFi                 | Bluetooth              |
| ----------- | -------------------- | ---------------------- |
| apu2c4      | needs card, untested | needs dongle, untested |
| raspi3b     | [open or WPA-PSK]    | [limited]              |
| raspi3b+    | [open or WPA-PSK]    | [limited]              |
| raspi4b     | [open or WPA-PSK]    | [limited]              |
| raspi5b     | [open or WPA-PSK]    | [limited]              |
| raspizero2w | [open or WPA-PSK]    | [limited]              |

[open or WPA-PSK]: /userguide/wifi/
[open only!]: /userguide/wifi/
[limited]: /userguide/bluetooth/

## Community-supported platforms {#community}

Independently from the official gokrazy
[kernel](https://github.com/gokrazy/kernel) and
[firmware](https://github.com/gokrazy/firmware), people of our community provide
alternative kernels and firmwares, in order to run gokrazy on unsupported
platform or to provide new features. They may not be as thoroughly tested as the
official platforms. Please report any issue to their respective repostitory.

### Community-supported Raspberry Pi OS 32-bit kernel/firmware

gokrazy’s official kernel is an upstream Linux kernel (directly from kernel.org)
that supports ARMv8 64-bit machines, meaning the Raspberry Pi 3 and newer. The
primary reason for using the upstream kernel is so that security fixes can be
immediately pulled in without having to wait on third parties.

The community-supported [github.com/gokrazy-community/kernel-rpi-os-32] kernel
on the other hand is the Raspberry Pi OS kernel (provided by the Raspberry Pi
foundation) that supports ARMv6 32-bit machines, which includes all Raspberry
Pis. The corresponding firmware for this kernel is
[github.com/gokrazy-community/firmware-rpi].

This kernel might generally be useful if you want to use hardware peripherals
that are not yet supported in the upstream Linux kernel.

This kernel is the only choice for you if you have a Raspberry Pi that’s older
than the Raspberry Pi 3, but you still want to use gokrazy with it.

### Community-supported Odroid XU4/HC1/HC2

Odroid XU4/HC1/HC2 is based on a Samsung Exynos 5422 SOC (4 ARM Cortex-A15
cores and 4 ARM Cortex-A7 cores) and has been on the market since ~2016. HC1
and HC2 variants support installing a 2.5'/3.5' hard drive on board.

Kernel for these devices is available at [github.com/anupcshan/gokrazy-odroidxu4-kernel].
This package contains a recent kernel, U-boot and some binary blobs that are
required to initiate the boot process. It has been tested against Odroid HC2
hardware with gigabit networking, USB and HDD functional.

See [github.com/anupcshan/odroidbake] for an example on how to create a
new disk image.

{{< highlight json "hl_lines=3 10-13" >}}
{
    "Hostname": "odroid",
    "DeviceType": "odroidhc1",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "KernelPackage": "github.com/anupcshan/gokrazy-odroidxu4-kernel",
    "FirmwarePackage": "",
    "EEPROMPackage": ""
}
{{< /highlight >}}

[github.com/gokrazy-community/kernel-rpi-os-32]: https://github.com/gokrazy-community/kernel-rpi-os-32
[github.com/gokrazy-community/firmware-rpi]: https://github.com/gokrazy-community/firmware-rpi
[github.com/anupcshan/gokrazy-odroidxu4-kernel]: https://github.com/anupcshan/gokrazy-odroidxu4-kernel
[github.com/anupcshan/odroidbake]: https://github.com/anupcshan/odroidbake
