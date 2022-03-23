---
layout: default
title: Hardware and CI
pre: "<b>4. </b>"
weight: 4
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
|-----------|-------------|--------|------------------|--------------------|-------------------------------------------------------------------------------|
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

The JPEG encoding column is the result of running scan2drive’s [`neonjpeg`
micro-benchmark](https://github.com/stapelberg/scan2drive/blob/1205954672323cf4f8a0619b57e3d107eba66af0/internal/neonjpeg/bench_test.go).

| Hardware    | JPEG encoding |
|-------------|---------------|
| raspi4b     | 0.69s         |
| raspi3b     | 1.22s         |
| raspizero2w | 1.47s         |

## Power Usage

These power measurements were done using a HomeMatic HM-ES-PMSw1-Pl power switch
with measurement feature. The Raspberry Pi 4 was using the original Raspberry Pi
power supply, the others were measured with a random USB power supply.

| Hardware    | Power Usage |
|-------------|-------------|
| apu2c4      | 4.0W        |
| raspi3b     | 1.5W        |
| raspi3b+    | 2.5W        |
| raspi4b     | 2.8W        |
| raspizero2w | 0.8W        |

## Hardware Support

| Hardware    | WiFi                 | Bluetooth              |
|-------------|----------------------|------------------------|
| apu2c4      | needs card, untested | needs dongle, untested |
| raspi3b     | [open or WPA-PSK]    | [limited]              |
| raspi3b+    | [open or WPA-PSK]    | [limited]              |
| raspi4b     | [open or WPA-PSK]    | [limited]              |
| raspizero2w | [open only!]         | [limited]              |

[open or WPA-PSK]: /userguide/wifi/
[open only!]: /userguide/wifi/
[limited]: /userguide/bluetooth/
