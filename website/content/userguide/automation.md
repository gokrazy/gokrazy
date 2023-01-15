---
title: "Automation"
menuTitle: "Automation"
weight: 12
---

This page demonstrates different ways of creating automation around gokrazy, in
two different scenarios:

1. As a user of gokrazy, who wants to [automate common workflows](#makefile) of
   one or more gokrazy instances.

1. As a provider of a package that can be used with gokrazy, who wants to ensure
   the program(s) can be built into a gokrazy instance in a continuous
   integration service [like GitHub Actions](#githubactions).

## Automating common workflows with a `Makefile` {#makefile}

The `make` tool can be used to document and centralize common workflows.

For example, I use the following Makefile. I run `make get && make update` from
[cron](https://en.wikipedia.org/wiki/Cron) every day. I sometimes manually run
`make overwrite` with `/dev/sdx` being my USB SD card reader. And for debugging,
`make root` produces a [SquashFS](https://en.wikipedia.org/wiki/SquashFS) image
I can inspect with `unsquashfs -ll`.

```make
GOK := gok -i dr

all:

.PHONY: get update overwrite root

get:
	${GOK} get --update_all

update:
	${GOK} update

overwrite:
	${GOK} overwrite --full /dev/sdx

root:
	${GOK} overwrite --root /tmp/root.squashfs
```

The first line is the so-called “gokline”. In this line, you can centrally put
all the command-line flags, environment variables or config templating hooks.

For example, in [router7](https://router7.org/), I set the `GOARCH=amd64`
environment variable to make Go compile for x86-64 (PC) instead of ARM (Raspberry
Pi):

```make
GOK := GOARCH=amd64 gok -i router7
```

### make: config templating

You can start templating hooks, simple or complicated, by adding them into your
gokline:

```make
GOK := sed 's,"Hostname": "","Hostname": "$(GOKRAZY_HOSTNAME)",g' config.tmpl.json > config.json && gok -i bakery
```

I then run the following command from
[cron](https://en.wikipedia.org/wiki/Cron):

```bash
make update GOKRAZY_HOSTNAME=bakery
```

## Continuous Integration: GitHub Actions {#githubactions}

You can place the following `gokrazy.yml` into your `.github/workflows`
directory to verify that your program builds as a gokrazy appliance:

```yaml
name: gokrazy appliance build

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - uses: actions/setup-go@v2
      with:
        # Latest minor release of Go 1.19:
        go-version: ^1.19

    - name: install gok CLI
      run: |
        go install github.com/gokrazy/tools/cmd/gok@main
        echo "PATH=$PATH:$(go env GOPATH)/bin" >> $GITHUB_ENV

    - name: create new gokrazy instance
      run: gok new

    - name: add this program to the gokrazy instance
      run: gok add .

    - name: generate gokrazy disk image
      run: gok overwrite --root root.squashfs
```
