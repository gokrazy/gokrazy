---
title: "Caddy HTTP server"
weight: 31
aliases: 
  - /userguide/caddy-http-server/
  - /userguide/install/caddy-http-server/
---

[Caddy](https://caddyserver.com/) is a powerful, enterprise-ready, open source
web server with automatic HTTPS written in Go.

To install caddy, first add the `caddy` program to your gokrazy instance:

```bash
gok add github.com/caddyserver/caddy/v2/cmd/caddy
```

Then, open your instance’s `config.json` in your editor:

```bash
gok edit
```

And make the following changes:

1. Change the HTTP port from 80 (default) to 1080 (for example) to move
   gokrazy’s web interface listening port out of the way and let caddy serve on
   TCP port 80. If you want to run caddy on a different port, you can skip this
   step.
2. Configure [Package config: Command-line
   flags](/userguide/package-config/#flags) and [Package config: Extra
   files](/userguide/package-config/#extrafiles) to make caddy run its webserver
   on startup (`run`) and to make caddy locate its config file (`--config`).

{{< highlight json "hl_lines=3-5 13-24" >}}
{
    "Hostname": "webserver",
    "Update": {
        "HTTPPort": "1080"
    },
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/caddyserver/caddy/v2/cmd/caddy"
    ],
    "PackageConfig": {
        "github.com/caddyserver/caddy/v2/cmd/caddy": {
            "CommandLineFlags": [
                "run",
                "--config",
                "/etc/caddy/Caddyfile"
            ],
            "ExtraFilePaths": {
                "/etc/caddy/Caddyfile": "Caddyfile"
            }
        }
    }
}
{{< /highlight >}}

Then, create the referenced `Caddyfile` extra file and modify it to your
liking. In this example, we explicitly configure an HTTP listener to disable
Caddy’s automatic HTTPS setup, so that your server will work without a
publically reachable address.

```bash
cat > ~/gokrazy/webserver/Caddyfile <<'EOT'
http://:80 {
	root * /tmp
	file_server browse 
}
EOT
```

Then, deploy as usual:

```bash
gok update
```

<!-- TODO: remove the tip below once breakglass respects instance-centric configuration -->

**Tip:** When using `breakglass`, use the `-gokrazy_url=:1080` flag to overwrite
the port.
