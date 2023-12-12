---
title: "Prometheus"
weight: 70
---

[Prometheus](https://github.com/prometheus/prometheus) is monitoring system and
time series database.

**Note**: In the following we will assume that your instance is called `hello`
(default) as well as that the hostname is `hello` as well.

## Installing the Prometheus Node Exporter

If all you want to do is monitor your gokrazy installation, just add the
Prometheus [node exporter](https://github.com/prometheus/node_exporter):

```bash
gok add github.com/prometheus/node_exporter
```

## Installing the Prometheus Time Series Database

To install the prometheus monitoring system, add the `prometheus` program to
your gokrazy instance:

```bash
gok add github.com/prometheus/prometheus/cmd/prometheus
```

We need a valid prometheus config for prometheus to start successfully. Start
with the [default `prometheus.yml` from the prometheus
repository](https://github.com/prometheus/prometheus/blob/main/documentation/examples/prometheus.yml).
Save it to your gokrazy instance directory, e.g.
`~/gokrazy/hello/prometheus.yml`.

Open your instance’s config.json in your editor:

```bash
gok edit
```

To use the prometheus config file, we need to do two things in the gokrazy
config:
1. Copy over the `prometheus.yml` with [Package config: Extra
   files](/userguide/package-config/#extrafiles)
2. Add [Package config: Command-line flags](/userguide/package-config/#flags)
3. We also add `WaitForClock` to get accurate timestamps for our timeseries data

Your config should look something like this:

{{< highlight json "hl_lines=11-19" >}}
{
    "Hostname": "hello",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/prometheus/prometheus"
    ],
    "PackageConfig": {
        "github.com/prometheus/prometheus": {
            "CommandLineFlags": [
                "--config.file=/etc/prometheus/prometheus.yml"
            ],
            "WaitForClock": true,
            "ExtraFilePaths": {
                "/etc/prometheus/prometheus.yml": "prometheus.yml"
            }
        }
    }
}
{{< /highlight >}}

Then, deploy as usual:

```bash
gok update
```

In theory, this is enough to deploy prometheus, but unfortunately we are missing
the web assets for the web UI which are not included in our build of prometheus.

You can use prometheus as is, if you never want to go to the web UI on
`hello:9090`. If you visit the web UI anyway, you will get this (or a similar)
error:
```text
Error opening React index.html: open web/ui/static/react/index.html: no such file or directory
```

To get the web UI to work, we first need the missing files. They are released
with every prometheus release and you need to update them by hand with every new
version.

1. Go to https://github.com/prometheus/prometheus/releases
2. Expand the section "Assets" for the lastest release
3. Download `prometheus-web-ui-VERSION.tar.gz` with `VERSION` being something
   like `2.46.0`
   (example url for version 2.46.0:
   https://github.com/prometheus/prometheus/releases/download/v2.46.0/prometheus-web-ui-2.46.0.tar.gz)
4. Extract the archive file: `tar xf prometheus-web-ui-2.46.0.tar.gz`
5. Enable [breakglass](https://github.com/gokrazy/breakglass) via gokrazy web
6. Create the right folder on your device:
   `ssh hello mkdir -p /perm/home/prometheus/web/ui`
7. Copy over the `static/` directory you exctracted from the tar file:
   `scp -r static/ hello:/perm/home/prometheus/web/ui`
8. Go to `hello:9090` to check if the web UI is working
