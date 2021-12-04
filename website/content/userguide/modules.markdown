---
layout: default
title: Working with Go modules
weight: 41
---

## pull in repositories from your GOPATH

By default, Go modules will not look at <code>$GOPATH/src</code>,
i.e. all packages passed to gokr-packer will be downloaded. If you
had unpublished changes or packages in your <code>$GOPATH</code>,
you can use the following steps to declare a Go module and pull it
into the build:

```shell
IMPORTPATH=github.com/stapelberg/gibot-i3
(cd $(go env GOPATH)/src/${IMPORTPATH?} && GO111MODULE=on go mod init ${IMPORTPATH?})
go mod edit -require ${IMPORTPATH?}@v0.0.0
go mod edit -replace ${IMPORTPATH?}=$(go env GOPATH)/src/${IMPORTPATH?}
```

## pull in local repositories

Please see <a href="https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive">https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive</a>.
