---
title: "Package config: flags, environment variables, extra files"
menuTitle: "Flags, environment variables, …"
weight: 20
---

gokrazy will arrange for each included package to be started at boot. For
example, given the following instance `config.json` (open in your editor using
`gok edit`):

```json
{
    "Hostname": "docs",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass"
    ]
}
```

…gokrazy will start the `fbstatus`, `hello`, `serial-busybox` and `breakglass`
programs.

## Package config

This article shows how you can configure different aspects of individual
packages.

Each bit of configuration is nested under the `PackageConfig` map field in your
instance’s `config.json`, see [Instance Config Reference →
`PackageConfig`](/userguide/instance-config/#packageconfig). The map is keyed by
package name (from the `Packages` field), and each map entry can have the
following fields:

- `CommandLineFlags` for [Command-line flags](#flags)
- `Environment` for [Environment variables](#env)
- `GoBuildFlags` for [Go build flags](#buildflags)
- `ExtraFilePaths` or `ExtraFileContents` for [Extra files](#extrafiles)

## Command-line flags {#flags}

The [breakglass](https://github.com/gokrazy/breakglass) package provides
emergency/debugging access to a gokrazy installation.

To enable SSH port forwardings to localhost, set the `-forward` flag to `loopback`:

```json
{
    "PackageConfig": {
        "github.com/gokrazy/breakglass": {
            "CommandLineFlags": [
                "-forward=loopback"
            ]
        }
    },
    …
}
```

## Environment variables {#env}

[Environment variables](https://en.wikipedia.org/wiki/Environment_variable) such
as the [Go runtime’s `GODEBUG`](https://golang.org/pkg/runtime/) variable can be
set as follows:

```json
{
    "PackageConfig": {
        "github.com/gokrazy/breakglass": {
            "Environment": [
                "GODEBUG=gctrace=1"
            ]
        }
    },
    …
}
```

## Go build flags {#buildflags}

If you want to influence the build of the package at image-creation time (as
opposed to runtime), you can specify flags to be passed to the Go build
invocation.

This example overwrites the value of the [`world`
variable](https://github.com/gokrazy/hello/blob/e33b5caa1a73b5e58e4d4f4b165d07e6ddf173a9/hello.go#L6)
using the [`-X` linker flag](https://golang.org/cmd/link/), which is a common
technique to embed version information:

```json
{
    "PackageConfig": {
        "github.com/gokrazy/hello": {
            "GoBuildFlags": [
                "-ldflags=-X main.world=Welt"
            ]
        }
    },
    …
}
```

## Extra files {#extrafiles}

If your program needs extra files to be present in gokrazy’s root file system
image at a specific location, you can add them with the `extrafiles` mechanism:

```json
{
    "PackageConfig": {
        "github.com/caddyserver/caddy/v2/cmd/caddy": {
            "ExtraFileContents": {
                "/etc/caddy/Caddyfile": "http://:80 {
	root * /tmp
	file_server browse
}
"
            }
        }
    },
    …
}
```

Or, if managing the file contents within the `config.json` becomes unwieldy, you
can manage it in a separate file:

```bash
cat > ~/gokrazy/hello/Caddyfile <<'EOT'
http://:80 {
	root * /tmp
	file_server browse
}
EOT
```

```json
{
    "PackageConfig": {
        "github.com/caddyserver/caddy/v2/cmd/caddy": {
            "ExtraFilePaths": {
                "/etc/caddy/Caddyfile": "Caddyfile"
            }
        }
    },
    …
}
```
