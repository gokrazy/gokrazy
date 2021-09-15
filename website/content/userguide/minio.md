---
title: "setting up MinIO on gokrazy"
weight: 50
---

# Setting up MinIO on gokrazy

[MinIO](https://min.io/) is high-performance object storage that is API
compatible to Amazons [Simple Storage Service (S3)](https://aws.amazon.com/de/s3/),
but is open source and written in Go. It can be used as a building block for
applications involving file storage and file transmission and while its native
to the cloud, it turns out one can also use it on gokrazy. :)

Since MinIO is a storage solution, you need to enable permanent storage on your
gokrazy installation by running the `mkfs` command that `gokr-packer` prints. For
more details, see [Quickstart](/quickstart/).

This article also assumes that you have an instance directory (with a `go.mod`)
set up.

## Step 1: Configuring the environment variables and command-line flags

You can find a detailed description on how to set the flags and environment vars
in the article [per-package configuration](/userguide/package-config/).

`${INSTANCE?}/env/github.com/minio/minio/env.txt`
```env
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio-on-gokrazy
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

* There are nice practical examples on the different options once you execute
  `minio server --help` if you have it installed locally or more advanced use
  cases in the official
  [MinIO docs](https://docs.min.io/minio/baremetal/reference/minio-server/minio-server.html).

* The ports for the storage server and console do not have to be explicitly set,
  but for me the default port collided with another service (Port 9000). If no
  port is set the console just chooses an arbitrary free one.

* For some reason the `HOME` variable has to be set to the storage folder.
  See [Issue #12641](https://github.com/minio/minio/issues/12641) on why that
  is the case. As default gokrazy sets `HOME` to `HOME=/perm/<cmd>`, so if you
  want to change your storage location to something different modify the
  `env.txt` accordingly.

## Step 2: Install MinIO to your gokrazy device

In your `gokr-packer` invocation (see [Quickstart](/quickstart/) if you don’t
have one yet), include the MinIO package:

```shell
gokr-packer \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  github.com/minio/minio
```

## Step 3: Test whether the setup was successful

If you have the [`mc`](https://github.com/minio/mc) command installed you can
check out whether your installation of MinIO really works:

```shell
$ mc alias set gokrazy http://gokrazy:3001 minio minio-on-gokrazy
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
