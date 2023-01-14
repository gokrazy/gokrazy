---
title: "Permanent data backup with the gokrazy rsyncd"
menuTitle: "Data backup with rsync"
weight: 80
---

I like to periodically back up all scans from my [scan2drive
appliance](/packages/showcase/) to my PC. The PC is backed up as well, so that
automatically distributes my scans to multiple machines in case one of them
fails.

A convenient way to set up an efficient partial or full backup of a gokrazy
device’s permanent data partition is to use [the gokrazy rsync
daemon](https://github.com/gokrazy/rsync). This article walks you through how I
have set up my backup, but many variants are possible to cater to different
requirements.

(You don’t typically need backups of your gokrazy device’s root partition
because it can be built reproducibly any time using Go.)

## Step 1. Install the gokrazy rsync daemon {#install}

Add the gokrazy rsync daemon `gokr-rsyncd` to your gokrazy instance:

```bash
gok add github.com/gokrazy/rsync/cmd/gokr-rsyncd
```

## Step 2. Configure the gokrazy rsync daemon {#configure}

Open your gokrazy instance’s `config.json` in your editor:

```bash
gok edit
```

Configure [Package config: Command-line flags](/userguide/package-config/#flags) and [Package config: Extra files](/userguide/package-config/#extrafiles):

{{< highlight json "hl_lines=11-19" >}}
{
    "Hostname": "backedup",
    "Packages": [
        "github.com/gokrazy/fbstatus",
        "github.com/gokrazy/hello",
        "github.com/gokrazy/serial-busybox",
        "github.com/gokrazy/breakglass",
        "github.com/gokrazy/rsync/cmd/gokr-rsyncd"
    ],
    "PackageConfig": {
        "github.com/gokrazy/rsync/cmd/gokr-rsyncd": {
            "CommandLineFlags": [
                "--gokr.config=/etc/gokr-rsyncd.toml",
                "--daemon"
            ],
            "ExtraFilePaths": {
                "/etc/gokr-rsyncd.toml": "gokr-rsyncd.toml",
                "/etc/gokr-rsyncd.authorized_keys": "gokr-rsyncd.authorized_keys"
            }
        }
    }
}
{{< /highlight >}}

In the daemon config file, configure an authorized SSH listener and which
rsync modules to serve:

```bash
cat > ~/gokrazy/hello/gokr-rsyncd.toml <<'EOT'
dont_namespace = true 
[[listener]]
  [listener.authorized_ssh]
    address = "scan2drive.lan:22873"
    authorized_keys = "/etc/gokr-rsyncd.authorized_keys"
[[module]]
  name = "scans"
  path = "/perm/scans"
EOT
```

Finally, create the authorized keys file that determines who can access the rsync daemon:

```bash
cat > ~/gokrazy/hello/gokr-rsyncd.authorized_keys <<'EOT'
ssh-ed25519 […] michael@midna
EOT
```

Then, deploy as usual:

```bash
gok update
```

## Step 3. Configure SSH from the backup machine {#ssh}

On your PC (not the gokrazy instance), add an SSH configuration stanza to your
`~/.ssh/config` to configure the custom port (22873 for ssh+rsync) and which
passwordless identity file to use (for the [cron job in step 4](#cron)):

```text
Host scan2drive-backup
    Hostname scan2drive.lan
    Port 22873
    IdentityFile ~/.ssh/id_ed25519_scan2drivebackup
```

Now you should be able to run rsync via SSH as usual:

```bash
rsync -av -e ssh rsync://scan2drive-backup/scans/ ~/scan2drive-backup/
```

## Step 4. Configure a daily cron job {#cron}


First, install [the `rsync-prom` tool](https://github.com/stapelberg/rsyncprom)
to monitor your periodic transfer with [Prometheus](https://prometheus.io/):

```bash
go install github.com/stapelberg/rsyncprom/cmd/rsync-prom@latest
```

Then wrap the above rsync command in an rsync-prom invocation in a shell script called `scan2drive-backup-sync.sh`:

```bash
#!/bin/sh
SSH_AUTH_SOCK= ~/go/bin/rsync-prom --instance="scan2drive@midna" \
  rsync -av -e ssh rsync://scan2drive-backup/scans/ ~/scan2drive-backup/
```

Finally, run `crontab -e` and run the script at your convenience, like so:

```
30 07 * * * /home/michael/scan2drive-backup-sync.sh
```
