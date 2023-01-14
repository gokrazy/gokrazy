---
title: "Using Bluetooth"
menuTitle: "Using Bluetooth"
weight: 60
aliases:
  - /userguide/bluetooth/
---

gokrazy has limited support for Bluetooth. The usual Bluetooth utilities (bluez)
have a lot of dependencies that are not available on gokrazy and those are out
of scope here. But the basic Bluetooth hardware are supported on low level. This
is useful in particular for applications using Bluetooth LE natively in Go.

To enable Bluetooth in gokrazy, first add the
`github.com/gokrazy/bluetooth` package to your gokrazy instance:

```bash
gok add github.com/gokrazy/bluetooth
```

The `github.com/gokrazy/bluetooth` package loads the appropriate kernel modules
and firmware required.

## Example program

As demo we're using the [bluewalker] Bluetooth LE scanner utility to show that
Bluetooth is working:

```bash
gok add gitlab.com/jtaimisto/bluewalker
```

[bluewalker]: https://gitlab.com/jtaimisto/bluewalker

Then, open your instance’s `config.json` in your editor:

```bash
gok edit
```

And configure [Package config: Command-line flags](/userguide/package-config/#flags):

{{< highlight json "hl_lines=11-15" >}}
{
    "Hostname": "blue",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "gitlab.com/jtaimisto/bluewalker"
    ],
    "PackageConfig": {
        "gitlab.com/jtaimisto/bluewalker": {
            "CommandLineFlags": [
                "-device=hci0"
            ]
        }
    }
}
{{< /highlight >}}

Then, deploy as usual:

```bash
gok update
```

Once deployed, you can see Bluetooth events being received in the bluewalker
output.

![Bluewalker output in gokrazy web interface](/img/2022-03-09-bluetooth-bluewalker.png)
