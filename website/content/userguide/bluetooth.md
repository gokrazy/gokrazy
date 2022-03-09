---
title: "Using Bluetooth"
menuTitle: "Using Bluetooth"
weight: 40
aliases:
  - /userguide/bluetooth/
---

gokrazy has limited support for Bluetooth. The usual Bluetooth utilities (bluez)
have a lot of dependencies that are not available on gokrazy and those are out
of scope here. But the basic Bluetooth hardware are supported on low level. This
is useful in particular for applications using Bluetooth LE natively in Go.

To enable Bluetooth in gokrazy, first include the
`github.com/gokrazy/bluetooth` package in your `gokr-packer` command line, e.g.:

```shell
gokr-packer \
  -tls=self-signed \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/bluetooth
```

The `github.com/gokrazy/bluetooth` package loads the appropriate kernel modules
and firmware required.

## Example program

As demo we're using [bluewalker] Bluetooth LE scanner utility just to show
that Bluetooth is working.

[bluewalker]: https://gitlab.com/jtaimisto/bluewalker

First, prepare command line flags.

```shell
mkdir -p flags/gitlab.com/jtaimisto/bluewalker
echo '-device=hci0' > flags/gitlab.com/jtaimisto/bluewalker/flags.txt
```

Then, deploy as usual.

```shell
gokr-packer \
  -tls=self-signed \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/bluetooth \
  gitlab.com/jtaimisto/bluewalker
```

Once deployed with gokr-packer, you can see Bluetooth events being received
in the bluewalker output.

![Bluewalker output in gokrazy web interface](/img/2022-03-09-bluetooth-bluewalker.png)