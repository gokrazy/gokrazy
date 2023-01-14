---
title: "Available packages"
pre: "<b>4. </b>"
chapter: true
weight: 4
aliases:
  - /userguide/install/
---

# Available packages

The guides in this chapter show how to set up popular third-party software.

If you feel a common program should be included here but isn’t, please [file an
issue on GitHub](https://github.com/gokrazy/gokrazy/issues).

## Installing existing Go software

To add existing Go software to your gokrazy instance, run `gok add` with the
import path of the program you want to add (the import path must refer to a
`package main` in Go terminology).

For instance, to install `github.com/stapelberg/scan2drive/cmd/scan2drive`, use:

```shell
gok add github.com/stapelberg/scan2drive/cmd/scan2drive
```

## Packages guides

{{% children %}}
