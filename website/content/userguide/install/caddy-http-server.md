---
title: "Caddy HTTP server"
weight: 31
aliases: 
  - /userguide/caddy-http-server/
---

[Caddy](https://caddyserver.com/) is a powerful, enterprise-ready, open source
web server with automatic HTTPS written in Go.

## Step 1: Configuring the Caddyfile and flags

Tell `caddy` to **run** its HTTP server, and where to find [its
Caddyfile](https://caddyserver.com/docs/caddyfile):

```shell
mkdir -p flags/github.com/caddyserver/caddy/v2/cmd/caddy
cat > flags/github.com/caddyserver/caddy/v2/cmd/caddy/flags.txt <<'EOT'
run
--config
/etc/caddy/Caddyfile
EOT
```

Include the config file in the gokrazy image at `/etc/caddy/Caddyfile`:

```shell
mkdir -p extrafiles/github.com/caddyserver/caddy/v2/cmd/caddy/etc/caddy
cat > extrafiles/github.com/caddyserver/caddy/v2/cmd/caddy/etc/caddy/Caddyfile <<'EOT'
http://:80 {
	root * /tmp
	file_server browse 
}
EOT
```

**Note:** In the above `Caddyfile`, we have explicitly configured an HTTP
listener to disable Caddy’s automatic HTTPS setup, so that your server will work
without a publically reachable address.

## Step 2: Install Caddy to your gokrazy device

In your `gokr-packer` invocation (see [Quickstart](/quickstart/) if you don’t
have one yet):

1. include the caddy package
1. set the `-http_port` flag to move the gokrazy web interface listening port
   out of the way and let caddy serve on TCP port 80. The special `-update=:80`
   syntax is the same as `-update=yes`, but forcing this update to happen via
   port 80. In later `gokr-packer` runs, use `-update=yes` instead.

```shell
gokr-packer \
  -update=:80 \
  -http_port=1080 \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  github.com/caddyserver/caddy/v2/cmd/caddy
```

**Tip:** When using `breakglass`, use the `-gokrazy_url=:1080` flag to overwrite
the port.
