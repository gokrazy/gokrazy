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

### Raspberry Pi Zero 2 W (Work In Progress)

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

| Target | Hardware | GOARCH | Kernel package   | Firmware package   | Appliances                                                                    |
|--------|----------|--------|------------------|--------------------|-------------------------------------------------------------------------------|
| apu2c4 | apu2c4   | amd64  | [rtr7/kernel]    | [rtr7/kernel]      | **[gokrazy/bakery/cmd/bake]**                                                 |
|        |          |        |                  |                    | [rtr7/router7]                                                                |
| x86-64 | qemu     | amd64  | [rtr7/kernel]    | [rtr7/kernel]      | **[gokrazy/bakery/cmd/bake]**                                                 |
| rpi4b  | raspi4b  | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**<br>[stapelberg/hmgo]<br>[stapelberg/scan2drive] |
| rpi3b  | raspi3b  | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**                                                 |
| rpi3b+ | raspi3b+ | arm64  | [gokrazy/kernel] | [gokrazy/firmware] | **[gokrazy/bakery/cmd/bake]**                                                 |


[rtr7/kernel]: https://github.com/rtr7/kernel
[gokrazy/bakery/cmd/bake]: https://github.com/gokrazy/bakery
[rtr7/router7]: https://github.com/rtr7/router7
[gokrazy/kernel]: https://github.com/gokrazy/kernel
[gokrazy/firmware]: https://github.com/gokrazy/firmware
[stapelberg/hmgo]: https://github.com/stapelberg/hmgo
[stapelberg/scan2drive]: https://github.com/stapelberg/scan2drive
