---
layout: default
title: Package development
pre: "<b>5. </b>"
weight: 5
chapter: true
---

A gokrazy package corresponds to a Go package (which in turn is part of a Go module). The `gokr-packer` program is a wrapper around `go install`.

To use the local version of a repository, use the [replace directive](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive) of `go.mod`.

## Development guides

{{% children %}}
