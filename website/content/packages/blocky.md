---
title: "Blocky DNS ad-blocker"
weight: 40
---

[Blocky](https://github.com/0xERR0R/blocky) is a DNS proxy and ad-blocker for
the local network, written in Go. It forwards the DNS queries to configurable
upstream resolvers, blocks queries for known advertising and tracking domains
and caches the answers. Because the device is always on, a gokrazy instance is
a good place for such a DNS server.

## Step 1: Install Blocky to your gokrazy device

Add the `blocky` program to your gokrazy instance:

```bash
gok add github.com/0xERR0R/blocky
```

## Step 2: Create the blocky configuration

Blocky needs a YAML configuration file, otherwise it will not start. Create a
`blocky.yaml` in your gokrazy instance directory, e.g.
`~/gokrazy/hello/blocky.yaml`, with a minimal configuration:

```yaml
upstreams:
  groups:
    default:
      - 1.1.1.1
      - https://dns.digitale-gesellschaft.ch/dns-query
blocking:
  denylists:
    ads:
      - https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt
      - https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts
  clientGroupsBlock:
    default:
      - ads
caching:
  minTime: 5m
```

With this configuration, all queries are send to two upstream resolvers (one
plain, one DNS-over-HTTPS), domains from two common ad/tracking denylists are
blocked, and the answers are cached for minimum 5 minutes.

Blocky has many more options (per-client blocking, allowlists, query log,
Prometheus metrics and so on), see the [example
configuration](https://github.com/0xERR0R/blocky/blob/main/docs/config.yml)
in the blocky repository.

## Step 3: Configure the gokrazy instance

Then, open your instance’s `config.json` in your editor.

To use the blocky config file, we need to do two things in the gokrazy
config:

1. Copy over the `blocky.yaml` with [Package config: Extra
   files](/userguide/package-config/#extrafiles)
2. Tell blocky where the config lies with [Package config: Command-line
   flags](/userguide/package-config/#flags)

Your config should look something like this:

{{< highlight json "hl_lines=11-18" >}}
{
    "Hostname": "hello",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/0xERR0R/blocky"
    ],
    "PackageConfig": {
        "github.com/0xERR0R/blocky": {
            "CommandLineFlags": [
                "--config",
                "/etc/blocky.yaml"
            ],
            "ExtraFilePaths": {
                "/etc/blocky.yaml": "blocky.yaml"
            }
        }
    }
}
{{< /highlight >}}

Then, deploy as usual:

```bash
gok update
```

## Step 4: Use Blocky as DNS server for your LAN

From any machine in your network, check with
[`dig`](https://linux.die.net/man/1/dig) if a blocked domain gives `0.0.0.0`
as answer (this is blockys default, `blockType: zeroIp`):

```shell
$ dig @hello doubleclick.net
…
doubleclick.net.        21600   IN      A       0.0.0.0
```

A domain which is not blocked should give the normal answer, for example:

```shell
$ dig @hello example.com
…
example.com.            300     IN      A       <real IP address>
```

So that all computers in the local network use Blocky, configure your router
or DHCP server to hand out the gokrazy device as DNS server. Because the
gokrazy device now provides an infrastructure service, maybe give it a static
IP address, see [DHCP](/userguide/dhcp/).

## Why no `WaitForClock`?

For many services it makes sense to set
[`WaitForClock`](/userguide/instance-config/#packagewaitforclock), but not
for a DNS server: the NTP servers which gokrazy uses per default
(`*.gokrazy.pool.ntp.org`) are hostnames and must be resolved over DNS first.
Without DNS, the NTP client just fails and the clock is never synchronized.
So if Blocky is the DNS resolver of the network and waits first for the
clock, the clock never gets set and Blocky never starts. Therefore leave
`WaitForClock` unset for Blocky. If you want clock synchronization before
Blocky starts anyway, you can configure the `github.com/gokrazy/gokrazy/cmd/ntp`
program with IP addresses instead of hostnames, then this problem does not
exist.
