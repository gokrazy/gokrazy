---
title: "Connecting to WiFi networks"
menuTitle: "Connecting to WiFi"
weight: 40
aliases:
  - /userguide/unencrypted-wifi/
---

Since March 2022, gokrazy supports both encrypted and unencrypted WiFi networks!
🎉

## Step 1. Install the wifi package

To make gokrazy connect to a WiFi network, first add the
`github.com/gokrazy/wifi` package to your gokrazy instance:

```bash
gok add github.com/gokrazy/wifi
```

## Step 2. Configure the wifi package

Open your gokrazy instance’s `config.json` in your editor:

```bash
gok edit
```

Then, configure the `wifi` program by creating the file `wifi.json` as [extra
file](/userguide/package-config/#extrafiles).

{{< highlight json "hl_lines=11-19" >}}
{
    "Hostname": "wifi",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/gokrazy/wifi"
    ],
    "PackageConfig": {
        "github.com/gokrazy/wifi": {
            "ExtraFilePaths": {
                "/etc/wifi.json": "wifi.json"
            }
        }
    }
}
{{< /highlight >}}

In the same directory, create `wifi.json` like so for an encrypted WiFi network:

```json
{
    "ssid": "Secure WiFi",
    "psk": "secret"
}
```

If you need to connect to an *unencrypted* WiFi network, specify no psk, and [use
TLS](/userguide/tls-for-untrusted-networks/):

```json
{
    "ssid": "My unencrypted WiFi"
}
```

Alternatively, you can also create the `wifi.json` manually on the permanent
data partition with path `/perm/wifi.json`.

After starting gokrazy, the `wifi` program will connect to the configured WiFi network:

<a href="/img/2020-05-27-gokrazy-wifi-unencrypted.jpg"><img src="/img/2020-05-27-gokrazy-wifi-unencrypted.thumb.jpg" srcset="/img/2020-05-27-gokrazy-wifi-unencrypted.thumb.2x.jpg 2x,/img/2020-05-27-gokrazy-wifi-unencrypted.thumb.3x.jpg 3x" width="700" style="border: 1px solid grey; margin-bottom: 2em; margin-top: 1em"></a>

## For debugging: known-working WiFi router setup

In case you have trouble getting your Raspberry Pi to connect to your network,
this is how I set up my [TP-LINK
TL-WDR4300](https://openwrt.org/toh/tp-link/tl-wdr4300) with [OpenWrt
19.07](https://openwrt.org/):

<a href="/img/iotee.jpg"><img src="/img/iotee.thumb.jpg" srcset="/img/iotee.thumb.2x.jpg 2x,/img/iotee.thumb.3x.jpg 3x" width="700" style="border: 1px solid grey; margin-bottom: 2em; margin-top: 1em"></a>

The MAC address filter isn’t a security measure, but prevents others from
accidentally joining this open network.
