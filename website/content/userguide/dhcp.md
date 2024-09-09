---
title: "DHCP Client"
menuTitle: "DHCP Client"
weight: 21
---

Each gokrazy instance comes with a built-in DHCP client (see [Instance Config →
GokrazyPackages](/userguide/instance-config/#gokrazypackages) for more details
on system packages) to set the IP address after obtaining a
[DHCPv4](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)
lease from the local network’s DHCP server.

## Network Interfaces

The gokrazy DHCP client by default runs for `eth0`. If you want to use a
different network interface, perhaps a USB ethernet adapter, you can set the
`-interface` [command-line flag](/userguide/package-config/):

{{< highlight json "hl_lines=10-14" >}}
{
    "Hostname": "dynamic",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
    ],
    "PackageConfig": {
        "github.com/gokrazy/gokrazy/cmd/dhcp": {
            "CommandLineFlags": [
                "-interface=enp0s58"
            ]
        }
    }
}
{{< /highlight >}}

If you configure gokrazy to [connect to a WiFi network](/userguide/wifi/), the
`gokrazy/wifi` package will [run another
instance](https://github.com/gokrazy/wifi/blob/320785ba3e91dac849e28d888c1cf6e6568320d0/wifi.go#L83)
of the gokrazy DHCP client with the `-interface=wlan0` flag set.

## Static Network Configuration

If you want the DHCP client to not actually fetch a lease, but apply a
statically supplied network configuration instead, you can set the
`-static_network_config` flag to the name of a file which contains a
JSON-encoded [DHCP lease in `rtr7/dhcp4.Lease`
format](https://github.com/rtr7/dhcp4/blob/18c84d089b4648dc5ea2ffe30efa65dfcb8a31ca/parseopts.go#L167), for example:

```json
{
  "IP":      "192.168.178.2",
  "Netmask": "",
  "Router":  "192.168.178.1",
  "DNS":     ["192.168.178.1", "8.8.8.8"]
}
```

Specifically, the following fields are currently respected:

* IP+Netmask
* Router
* DNS

You can configure the gokrazy DHCP client to pick up this configuration by
setting [Package config: Command-line flags](/userguide/package-config/#flags)
and [Package config: Extra files](/userguide/package-config/#extrafiles):

{{< highlight json "hl_lines=10-17" >}}
{
    "Hostname": "dynamic",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ],
    "PackageConfig": {
        "github.com/gokrazy/gokrazy/cmd/dhcp": {
            "CommandLineFlags": [
                "-static_network_config=/etc/gokrazy/static-dhcp-lease.json"
            ],
            "ExtraFilePaths": {
                "/etc/gokrazy/static-dhcp-lease.json": "static-dhcp-lease.json"
            }
        }
    }
}
{{< /highlight >}}


## Interface priority

The gokrazy DHCP client [automatically configures the route
priority](https://github.com/gokrazy/gokrazy/commit/4c375187675fd3c3f2fb1381be87b7d046dd1f42)
for default routes of ethernet interfaces (`eth*`) to 1, whereas on WiFi
interfaces (`wlan*`), the priority is 5 (Linux prefers lower priorities).

This means you can configure your gokrazy instance to work with both, WiFi and
wired network. Whenever a link is down, the gokrazy DHCP client changes its
priority to 1024, meaning outgoing traffic will quickly switch away when an
interface loses its link. In other words: When you un-plug the network cable,
the device still works via WiFi.

If you need to influence the interface’s route priority, you can use the
`-extra_route_priority` flag to add to the default priority. For example, to
prefer sending traffic out via the WiFi interface if both WiFi and ethernet are
connected, use:

{{< highlight json "hl_lines=10-14" >}}
{
    "Hostname": "dynamic",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
    ],
    "PackageConfig": {
        "github.com/gokrazy/gokrazy/cmd/dhcp": {
            "CommandLineFlags": [
                "-extra_route_priority=10"
            ]
        }
    }
}
{{< /highlight >}}
