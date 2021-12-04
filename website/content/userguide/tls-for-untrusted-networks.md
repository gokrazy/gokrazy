---
title: "Using TLS in untrusted networks"
weight: 30
---

Let’s assume that you have [installed gokrazy on a Raspberry Pi](/quickstart/)
and are currently successfully updating it over the network like so:

```shell
gokr-packer \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox
```

## Enabling TLS

To start using TLS, specify the `-tls=self-signed` flag, and set `-insecure` for
the first update:

```shell
gokr-packer \
  -tls=self-signed \
  -insecure \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox
```

The gokrazy packer will:
* generate a self-signed certificate
* include the certificate in the gokrazy installation
* verify the certificate fingerprint in future updates

The gokrazy installation will start listening on TCP port 443 for HTTPS
connections and redirect any HTTP traffic to HTTPS. When opening the gokrazy web
interface in your browser, you will need to explicitly permit communication due
to the self-signed certificate.

For all future updates, remove the `-insecure` flag and keep the `-tls=self-signed` flag:

```shell
gokr-packer \
  -tls=self-signed \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox
```

You can now safely update your gokrazy installation over untrusted networks,
such as [unencrypted WiFi networks](/userguide/unencrypted-wifi/).

## Disabling TLS

Just remove the `-tls` flag from your `gokr-packer` command line. After the next
update, gokrazy will no longer contain the certificates and will serve
unencrypted HTTP again.
