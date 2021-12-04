---
title: "Package config: flags and environment variables"
menuTitle: "Flags and environment variables"
weight: 15
---

gokrazy will arrange for each included package to be started at boot. For
example, given the following packer command:

```shell
gokr-packer \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox
```

…gokrazy will start the `hello`, `breakglass` and `serial-busybox` programs.

This article shows how you can configure different aspects of individual
packages.

Each bit of configuration lives in its own directory: `flags`, `env` or
`buildflags`.

Within these directories, create a directory named after the package import
path, then place your configuration in a text file: `flags.txt`, `env.txt` or
`buildflags.txt`.

## Command-line flags

The [breakglass](https://github.com/gokrazy/breakglass) package provides
emergency/debugging access to a gokrazy installation.

To enable SSH port forwardings to localhost, set the `-forward` flag to `loopback`:

```shell
mkdir -p flags/github.com/gokrazy/breakglass
echo '-forward=loopback' > flags/github.com/gokrazy/breakglass/flags.txt
```

## Environment variables

[Environment variables](https://en.wikipedia.org/wiki/Environment_variable) such
as the [Go runtime’s `GODEBUG`](https://golang.org/pkg/runtime/) variable can be
set as follows:

```shell
mkdir -p env/github.com/gokrazy/breakglass
echo 'GODEBUG=gctrace=1' > env/github.com/gokrazy/breakglass/env.txt
```

## Go build flags

If you want to influence the build of the package at image-creation time (as
opposed to runtime), you can specify flags to be passed to the Go build
invocation.

This example overwrites the value of the [`world`
variable](https://github.com/gokrazy/hello/blob/e33b5caa1a73b5e58e4d4f4b165d07e6ddf173a9/hello.go#L6)
using the [`-X` linker flag](https://golang.org/cmd/link/), which is a common
technique to embed version information:

```shell
mkdir -p buildflags/github.com/gokrazy/hello
echo '-ldflags=-X main.world=Welt' > buildflags/github.com/gokrazy/hello/buildflags.txt
```
