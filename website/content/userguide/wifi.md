---
title: "Connecting to WiFi networks"
menuTitle: "Connecting to WiFi"
weight: 40
aliases:
  - /userguide/unencrypted-wifi/
---

Since March 2022, gokrazy supports both encrypted and unencrypted WiFi networks!
🎉

{{% notice warning %}}
Remember that using an **unencrypted WiFi** network means anyone in range can read
your communication. Hence, we strongly recommend [using TLS for accessing the
gokrazy web interface and doing
updates](/userguide/tls-for-untrusted-networks/).
{{% /notice %}}

To make gokrazy connect to a WiFi network, first include the
`github.com/gokrazy/wifi` package in your `gokr-packer` command line, e.g.:

```shell
gokr-packer \
  -tls=self-signed \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  github.com/gokrazy/wifi
```

Then, configure the `wifi` program by creating the file `wifi.json` as [extra
file](/userguide/package-config/#extrafiles):

```shell
mkdir -p extrafiles/github.com/gokrazy/wifi/etc/

# To connect to an unencrypted WiFi network, specify no psk:
echo '{"ssid": "My unencrypted WiFi"}' \
  > extrafiles/github.com/gokrazy/wifi/etc/wifi.json

# OR, to connect to an encrypted WiFi network, specify the psk:
echo '{"ssid": "Secure WiFi", "psk": "secret"}' \
  > extrafiles/github.com/gokrazy/wifi/etc/wifi.json
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
