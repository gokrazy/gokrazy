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

## Requirements

 * Package `tailscale.com` v1.56.1 or later (latest version used automatically unless you have the package already in go.mod)
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

## Optional: Using gokrazy as a Tailscale subnet router

To allow hosts in your Tailnet to access devices in your network other
than your gokrazy appliance, you can set up Tailscale as a subnet router.

{{< highlight json "hl_lines=12" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/serial-busybox",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up",
                "--advertise-routes=192.168.0.0/24"
            ]
        }
    }
}
{{< /highlight >}}

Starting Tailscale version v1.63.x ([FIXME](https://github.com/tailscale/tailscale/issues/11405))
IP forwarding is automatically enabled on Gokrazy.

## Optional: Accessing gokrazy using Tailscale SSH

To access the gokrazy appliance using SSH authenticating using Tailscale,
you can enable Tailscale SSH.

{{< highlight json "hl_lines=12" >}}
{
    "Hostname": "ts",
    "Packages": [
        "github.com/gokrazy/serial-busybox",
        "tailscale.com/cmd/tailscaled",
        "tailscale.com/cmd/tailscale"
    ],
    "PackageConfig": {
        "tailscale.com/cmd/tailscale": {
            "CommandLineFlags": [
                "up",
                "--ssh=true"
            ]
        }
    }
}
{{< /highlight >}}

Note that Tailscale SSH needs to be allowed by your Tailnet ACL.
You can configure to allow, for example, each user to access their own
devices using Tailscale SSH, or define which hosts users can access.

## Optional: Tailscale network for other programs

Before Tailscale v1.56.1, Tailscale used [Userspace networking] mode on gokrazy,
meaning you needed to use Tailscale as an HTTP proxy to establish outgoing
connections into your tailnet.

[Userspace networking]: https://tailscale.com/kb/1112/userspace-networking/ "Userspace networking mode (for containers)"

With Tailscale v1.56.1 and newer, programs running on gokrazy can connect to
other devices in your tailnet without extra steps! 🎉 DNS resolution and TCP
connections work out of the box.

## Optional: Tailscale Go listener {#optional-tailscale-go-listener}

Before Tailscale v1.56.1, Tailscale used [Userspace networking] mode on gokrazy,
meaning you needed to use the tsnet package if you wanted to restrict a listener
to Tailscale.

With Tailscale v1.56.1 and newer, you can listen on Tailscale addresses and use
[LocalClient.WhoIs](https://pkg.go.dev/tailscale.com/client/tailscale#LocalClient.WhoIs)
to obtain the remote identity:

```go
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"tailscale.com/client/tailscale"
)

func main() {
	listen := flag.String("listen", "gokrazy.monkey-turtle.ts.net:8111", "[host]:port listen address")
	allowedUser := flag.String("allowed_user", "", "the name of a tailscale user to allow")
	flag.Parse()
	log.Printf("starting HTTP listener on %s", *listen)
	var ts tailscale.LocalClient
	httpsrv := &http.Server{
		Addr: *listen,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			who, err := ts.WhoIs(r.Context(), r.RemoteAddr)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			if who.UserProfile.LoginName != *allowedUser || *allowedUser == "" {
				err := fmt.Sprintf("you are logged in as %q (userprofile: %+v), but -allowed_user flag does not match!", who.UserProfile.LoginName, who.UserProfile)
				log.Printf("forbidden: %v", err)
				http.Error(w, err, http.StatusForbidden)
				return
			}
			fmt.Fprintf(w, "hey there, %q! this message is served via tailscale from gokrazy!", who.UserProfile.LoginName)
		}),
	}
	log.Fatal(httpsrv.ListenAndServe())
}
```

1. Deploy this program to your gokrazy device
1. Open the listening address in your browser, e.g. http://gokrazy.monkey-turtle.ts.net:8111
1. Specify the `--allowed_user` flag to verify that tailscale authentication works as expected
