---
title: "Tailscale VPN"
weight: 17
aliases:
  - /userguide/tailscale/
  - /userguide/install/tailscale/
---

[Tailscale](https://tailscale.com/)’s website reads:

> A secure network that just works
>
> Zero config VPN. Installs on any device in minutes, manages firewall rules for you, and works from anywhere.

gokrazy-based devices are no exception! This guide shows you how to use
Tailscale with gokrazy.

Tailscale’s networking will come in handy when accessing your gokrazy server
remotely (no static DHCP leases, port-forwarding and DynDNS required!), or even
to secure your communication when gokrazy is [connected to an unencrypted WiFi
network](/userguide/unencrypted-wifi/).

{{% notice note %}}
Tailscale currently uses [Userspace networking] mode on gokrazy, because
for `tun` mode, Tailscale currently requires components that gokrazy does not
provide. For accessing the services on your gokrazy installation, the Userspace
networking mode works fine, though 🥳 .

[Userspace networking]: https://tailscale.com/kb/1112/userspace-networking/ "Userspace networking mode (for containers)"
{{% /notice %}}

## Requirements

 * Package `tailscale.com` v1.22.1 or later (latest version used automatically unless you have the package already in go.mod)
 * Volume `/perm/` needs to be initialized (instructions use `github.com/gokrazy/mkfs` to initialize)
to persist authentication over reboots.

## Step 1. include the tailscale packages

Add the Tailscale daemon `tailscaled` and CLI `tailscale` Go packages to your
gokrazy instance:

```bash
gok add tailscale.com/cmd/tailscaled
gok add tailscale.com/cmd/tailscale
# Automatically initialize a file system on the /perm partition on first boot:
gok add github.com/gokrazy/mkfs
```

## Step 2. set command-line flags

Then, open your instance’s `config.json` in your editor:

```bash
gok edit
```

And configure [Package config: Command-line
flags](/userguide/package-config/#flags) for Option A or Option B:

**Option A: interactive authentication**

{{< highlight json "hl_lines=12-18" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale",
        "github.com/gokrazy/mkfs"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up"
            ]
        }
    }
}
{{< /highlight >}}

**Option B: unattended authentication with auth key**

Alternatively,
navigate to [Tailscale console] and open Settings / Keys. Generate auth key.

Include the key to tailscale flags:

[Tailscale console]: https://login.tailscale.com/ "Tailscale management console login.tailscale.com"

{{< highlight json "hl_lines=12-18" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale",
        "github.com/gokrazy/mkfs"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up",
                "--auth-key=tskey-AAAAAAAAAAAA-AAAAAAAAAAAAAAAAAAAAAA"
            ]
        }
    }
}
{{< /highlight >}}

Then, deploy as usual:

```bash
gok update
```

## Step 3. authenticate (interactive only)

Skip this step if you are using option B with auth key.

1. Navigate to your gokrazy web interface with browser using the URL displayed
by the `gok` CLI.
1. Open the service `/user/tailscale` and find the login URL.
1. Open the link with browser and log in to Tailscale and authorize the client.

## Step 4. disable key expiry (optional)

You are now connected to Tailscale and you can access your gokrazy instance
over Tailscale.

{{% notice note %}}
Tailscale requires re-authentication periodically.
You can disable key expiry from [Tailscale console] for the gokrazy
instance to not require login every 3 months.

[Tailscale console]: https://login.tailscale.com/ "Tailscale management console login.tailscale.com"
{{% /notice %}}

## Optional: tailscale network for other programs

(If you only want to connect to services on your gokrazy device, you don’t need
this step.)

To make the `github.com/stapelberg/dr` package able to connect to addresses on
the tailscale network, we need to enable [`tailscaled`’s HTTP
proxy](https://tailscale.com/kb/1112/userspace-networking/#step-2-configure-your-application-to-use-socks5-or-http)
and set the proxy environment variables:

{{< highlight json "hl_lines=16 21 24-29" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale",
        "github.com/gokrazy/mkfs",
        "github.com/stapelberg/dr"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up"
            ]
        },
        "tailscale.com/cmd/tailscaled": {
            "CommandLineFlags": [
                "--outbound-http-proxy-listen=localhost:9080"
            ]
        },
        "github.com/stapelberg/dr": {
            "Environment": [
                "HTTPS_PROXY=localhost:9080",
                "HTTP_PROXY=localhost:9080"
            ]
        }
    }
}
{{< /highlight >}}

## Optional: Tailscale Go listener {#optional-tailscale-go-listener}

If you want to make a program listen on tailscale without listening on any other
network interface, you can use the [tsnet Tailscale as a library] package
in your application.

When using `tailscale.com/tsnet`, you don't need to run `tailscale up` and
it's enough to only include `tailscale.com/cmd/tailscaled` and your appplication
with tsnet.

There is an example program at
[github.com/gokrazy/tsnetdemo](https://github.com/gokrazy/tsnetdemo):

[tsnet Tailscale as a library]: https://pkg.go.dev/tailscale.com/tsnet "Package tsnet provides Tailscale as a library. It is an experimental work in progress."


```go
package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"tailscale.com/client/tailscale"
	"tailscale.com/tsnet"
)

func main() {
	os.Setenv("TAILSCALE_USE_WIP_CODE", "true")
	// TODO: comment out this line to avoid having to re-login each time you start this program
	os.Setenv("TS_LOGIN", "1")
	os.Setenv("HOME", "/perm/tsnetdemo")
	hostname := flag.String("hostname", "tsnetdemo", "tailscale hostname")
	allowedUser := flag.String("allowed_user", "", "the name of a tailscale user to allow")
	flag.Parse()
	s := &tsnet.Server{
		Hostname: *hostname,
	}
	log.Printf("starting tailscale listener on hostname %s", *hostname)
	ln, err := s.Listen("tcp", ":443")
	if err != nil {
		log.Fatal(err)
	}
	ln = tls.NewListener(ln, &tls.Config{
		GetCertificate: tailscale.GetCertificate,
	})
	httpsrv := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			who, err := tailscale.WhoIs(r.Context(), r.RemoteAddr)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			if who.UserProfile.LoginName != *allowedUser || *allowedUser == "" {
				err := fmt.Sprintf("you are logged in as %q, but -allowed_user flag does not match!", who.UserProfile.LoginName)
				log.Printf("forbidden: %v", err)
				http.Error(w, err, http.StatusForbidden)
				return
			}
			fmt.Fprintf(w, "hey there, %q! this message is served via the tsnet package from gokrazy!", who.UserProfile.LoginName)
		}),
	}
	log.Fatal(httpsrv.Serve(ln))
}
```

1. Deploy this program to your gokrazy device
1. Open the authentication URL from the log output
1. Open the tsnetdemo host name in your tailscale in your Tailnet domain alias, e.g. https://tsnetdemo.monkey-turtle.ts.net
1. Specify the `--allowed_user` flag to verify that tailscale authentication works as expected

You can also use `TS_AUTHKEY` instead of `TS_LOGIN=1` for non-interactive
auth. See [Environment variables] in Userguide to avoid setting secrets in
your application source code.

[Environment variables]: {{<relref "userguide/package-config.md">}}#env
