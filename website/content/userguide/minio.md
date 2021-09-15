---
title: "setting up MinIO on gokrazy"
weight: 50
---

# Setting up MinIO on gokrazy

Since MinIO is a storage solution, one needs to have the permanent storage with
a filesystem that the linux kernel understands configured. Further instructions
on how to do this can be found in the [Quickstart](/quickstart/) article or the
`gokr-packer` output.

This article also assumes that you have an instance directory set up.
(also see [Quickstart](/quickstart/))

## Configuring the ENV Vars and flags

You can find a detailed description on how to set the flags and environment vars
in the article [per-package configuration](/userguide/package-config/).

`${INSTANCE?}/env/github.com/minio/minio/env.txt`
```env
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio-on-gokrazy
HOME=/perm/minio
```

`${INSTANCE?}/flags/github.com/minio/minio/flags.txt`
```
server
--address
:3001
--console-address
:3002
/perm/minio/
```

A few things can be noted here:

* There are nice examples on the different (advanced) options in the minio docs
  or once you execute `minio server --help` if you have it installed locally

* The ports for the storage server and console do not have to be explicitly set,
  but for me the default port collided with another service (Port 9000). If no
  port is set the console just chooses an arbitrary free one.

* For some reason the `HOME` variable has to be set to the storage folder.
  See [Issue #12641](https://github.cgs.me/minio/minio/issues/12641) on why that
  is the case.

## Install MinIO to your gokrazy device

Via web ...
```shell
GOKRAZY_UPDATE=http://gokrazy:<your-password-goes-here>@gokrazy/ gokr-packer . \
    github.com/gokrazy/breakglass \
    github.com/gokrazy/serial-busybox \
    github.com/minio/minio
```

... or directly to the SDCard
```shell
gokr-packer -overwrite=/dev/sdX . \
    github.com/gokrazy/breakglass \
    github.com/gokrazy/serial-busybox \
    github.com/minio/minio
```

## Test whether the setup was successful

If you have the [`mc`](https://github.com/minio/mc) command installed you can
check out whether your installation of MinIO really works:

```shell
$ mc alias set gokrazy http://gokrazy:3001 minio miniostorage
Added `gokrazy` successfully.
$ mc ls gokrazy
$ mc mb gokrazy/testbucket
Bucket created successfully `gokrazy/testbucket`.
$ mc ls gokrazy
[2021-09-15 16:40:16 CEST]     0B testbucket/
```

Also check out the output in the logs on the gokrazy webinterface and login into
the MinIO management console ([http://gokrazy:3002](http://gokrazy:3002) in this
guide) to create service accounts view logs, bucket contents and more.
