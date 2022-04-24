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

To add an existing Go software to you installation, you just need to indicate the
import path of the package to `gokr-packer`.

For instance to install `github.com/stapelberg/scan2drive/cmd/scan2drive`:

```shell
gokr-packer \
  -overwrite=/dev/sdx \
  github.com/stapelberg/scan2drive/cmd/scan2drive
```

## Packages guides

{{% children %}}
