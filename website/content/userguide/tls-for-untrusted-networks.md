---
title: "Using TLS in untrusted networks"
weight: 50
---

Let’s assume that you have [installed gokrazy on a Raspberry Pi](/quickstart/)
and are currently successfully updating it over the network like so:

```bash
gok update
```

## Enabling TLS

To start using TLS, edit your gokrazy instance’s `config.json`:

```bash
gok edit
```

In the `config.json`, in the `Update` field, add a `"UseTLS": "self-signed"`
line (don’t forget adding a comma to the previous line):

{{< highlight json "hl_lines=5" >}}
{
    "Hostname": "docs",
    "Update": {
        "HTTPPassword": "secret",
        "UseTLS": "self-signed"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
{{< /highlight >}}

Save your changes and close the file, then run a first update with the
`--insecure` flag:

```bash
gok update --insecure
```

The gok CLI will:
* generate a self-signed certificate
* include the certificate in the gokrazy installation
* verify the certificate fingerprint in future updates

The gokrazy installation will start listening on TCP port 443 for HTTPS
connections and redirect any HTTP traffic to HTTPS. When opening the gokrazy web
interface in your browser, you will need to explicitly permit communication due
to the self-signed certificate.

For all future updates, remove the `--insecure` flag:

```bash
gok update
```

You can now safely update your gokrazy installation over untrusted networks,
such as [unencrypted WiFi networks](/userguide/unencrypted-wifi/).

## Disabling TLS

Change the `UseTLS` line to `"UseTLS": "off"` in your instance’s `config.json`.

Run `gok update --insecure`, and afterwards gokrazy will no longer contain the
certificates and will serve unencrypted HTTP again.
