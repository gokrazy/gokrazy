---
title: "Tailscale VPN"
weight: 17
aliases: 
  - /userguide/tailscale/
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

## Step 1. set command-line flags

We need to specify the following flags for the `tailscaled` daemon (see [Package
config: flags and environment variables](/userguide/package-config) if you’re
unfamiliar with this mechanism):

```shell
mkdir -p flags/tailscale.com/cmd/tailscaled
echo '--statedir=/perm/tailscaled/' > flags/tailscale.com/cmd/tailscaled/flags.txt
echo '--tun=userspace-networking' >> flags/tailscale.com/cmd/tailscaled/flags.txt
```

`tailscaled` requires the `--statedir` flag, so we need to set it
explicitly. `/perm/tailscaled` is the working directory of the `tailscaled`
process and will contain the `tailscaled.sock` socket, so it makes sense to
place the state file into the same directory.

The `--tun=userspace-networking` flag selects the [Userspace
networking](https://tailscale.com/kb/1112/userspace-networking/) mode.

It would be nice to use the `tun`-based networking eventually, but currently
Tailscale requires components that gokrazy does not provide for `tun` mode. For
accessing the services on your gokrazy installation, the Userspace networking
mode works fine, though :)

## Step 2. include the tailscale packages

In your `gokr-packer` invocation (see [Quickstart](/quickstart/) if you don’t
have one yet), include the Tailscale daemon and CLI Go packages:

```shell
gokr-packer \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  tailscale.com/cmd/tailscaled \
  tailscale.com/cmd/tailscale
```

## Step 3. authenticate

Log in to your gokrazy device interactively using
[breakglass](https://github.com/gokrazy/breakglass), change to the
`/perm/tailscaled` directory and run `tailscale up` to print the authentication
link:

```text
% breakglass gokrazy
breakglass# cd /perm/tailscaled
breakglass# /user/tailscale up
```

## Optional: tailscale network for other programs

(If you only want to connect to services on your gokrazy device, you don’t need
this step.)

To make the `github.com/stapelberg/dr` package able to connect to addresses on
the tailscale network, we need to first enable [`tailscaled`’s HTTP
proxy](https://tailscale.com/kb/1112/userspace-networking/#step-2-configure-your-application-to-use-socks5-or-http):

```shell
echo '--outbound-http-proxy-listen=localhost:9080' > flags/tailscale.com/cmd/tailscaled/flags.txt
```

And then set the proxy environment variables:

```shell
mkdir -p env/github.com/stapelberg/dr
echo 'HTTPS_PROXY=localhost:9080' > env/github.com/stapelberg/dr/env.txt
echo 'HTTP_PROXY=localhost:9080' >> env/github.com/stapelberg/dr/env.txt
```

## Optional: tailscale Go listener

{{% notice note %}}
You need to use tailscale at [commit
b3abdc3](https://github.com/tailscale/tailscale/commit/b3abdc381d99bd9a7bdc8c084aaa174d7b45e881)
or later for this to work!
{{% /notice %}}

If you want to make a program listen on tailscale without listening on any other
network interface, you can use the `tsnet` package (find this program at
[github.com/gokrazy/tsnetdemo](https://github.com/gokrazy/tsnetdemo)):

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
