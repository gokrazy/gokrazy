---
title: "Remote Syslog: sending gokrazy logs over the network"
menuTitle: "Remote Syslog"
weight: 20
---

If you update your gokrazy installations daily, as we recommend you do, logs
will be cleared daily as a side effect of rebooting the device. You can use
[Remote Syslog](https://en.wikipedia.org/wiki/Syslog#Network_protocol) to
persist logs elsewhere for later analysis.

## Client side (gokrazy)

To enable remote syslog, you need to configure a target by creating the file
`remote_syslog/target` on the permanent data partition.

```shell
# The following assumes you already created a file system
# on the permanent data partition. Otherwise, please use:
# sudo mkfs.ext4 /dev/disk/by-partuuid/2e18c40c-04

sudo mount /dev/disk/by-partuuid/2e18c40c-04 /mnt
echo 10.0.0.76:514 | sudo tee /mnt/remote_syslog/target
sudo umount /mnt
```

I recommend using a (static) IP address for increased reliability, so that
remote syslog works even when DNS does not.

## Server side (syslog-ng)

This is how I instruct [syslog-ng](https://en.wikipedia.org/wiki/Syslog-ng) via
its `/etc/syslog-ng/syslog-ng.conf` to write syslog messages it received from
e.g. host `gokrazy` to `/var/log/remote/gokrazy-log`:

```
source net { network(ip(10.0.0.76) transport("udp")); };
destination remote { file("/var/log/remote/${FULLHOST}-log"); };
log { source(net); destination(remote); };
```
