[![GitHub Actions CI](https://github.com/gokrazy/gokrazy/actions/workflows/main.yml/badge.svg)](https://github.com/gokrazy/gokrazy/actions/workflows/main.yml)
[![Go Report Card](https://goreportcard.com/badge/github.com/gokrazy/gokrazy)](https://goreportcard.com/report/github.com/gokrazy/gokrazy)

# Overview

With gokrazy, you can deploy your Go programs as appliances to a Raspberry Pi or
PC ([→ supported platforms](https://gokrazy.org/platforms/)).

For a long time, we were unhappy with having to care about security issues and
Linux distribution maintenance on our various Raspberry Pis.

Then, we had a crazy idea: what if we got rid of memory-unsafe languages and all
software we don’t strictly need?

Turns out this is feasible. gokrazy is the result.

[→ Learn more at gokrazy.org](https://gokrazy.org/)

# GitHub Repository structure

* [github.com/gokrazy/gokrazy](https://github.com/gokrazy/gokrazy): system code, main issue tracker, documentation
* [github.com/gokrazy/tools](https://github.com/gokrazy/tools): SD card image creation code, pulling in:
    * [github.com/gokrazy/firmware](https://github.com/gokrazy/firmware): Raspberry Pi 3 or 4 firmware files
    * [github.com/gokrazy/rpi-eeprom](https://github.com/gokrazy/rpi-eeprom): Raspberry Pi 4 EEPROM files
    * [github.com/gokrazy/rpi5-eeprom](https://github.com/gokrazy/rpi5-eeprom): Raspberry Pi 5 EEPROM files
    * [github.com/gokrazy/kernel](https://github.com/gokrazy/kernel): pre-built kernel image and bootloader config

# Documentation

[gokrazy.org](https://gokrazy.org) uses [hugo](https://gohugo.io/) for creating and generating the website.
You can find the hugo install instructions here: [Install Hugo](https://gohugo.io/getting-started/installing/).
With hugo you can write documentation in Markdown and generate a static website from it.

The `website` subdirectory is hugo’s root directory. In order to preview the
documentation or to re-generate the website, switch the directory to `website`.

To preview the website, run the hugo webserver:

```bash
hugo serve
```

Generate the website:

```bash
hugo
```

The updated website content will be stored in the `./docs` directory.
Do not update anything here manually.

