---
title: "Using Tailscale with gokrazy"
weight: 16
---

# Using Tailscale with gokrazy

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

We need to specify the following flags for the `tailscaled` daemon (see
[“Per-package configuration”](/userguide/package-config) if you’re unfamiliar
with this mechanism):

```shell
mkdir -p flags/tailscale.com/cmd/tailscaled
echo '--state=/perm/tailscaled/state' > flags/tailscale.com/cmd/tailscaled/flags.txt
echo '--tun=userspace-networking' >> flags/tailscale.com/cmd/tailscaled/flags.txt
```

`tailscaled` requires the `--state` flag, so we need to set it
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

```shell
% breakglass gokrazy
breakglass# cd /perm/tailscaled
breakglass# /user/tailscale up
```
