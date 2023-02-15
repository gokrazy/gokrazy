---
layout: default
title: The gokrazy Go build tag
weight: 40
---

If you want to add code to your project that is specific to gokrazy, you can
conditionally compile it using the `gokrazy` [Go build
tag](https://golang.org/pkg/go/build/#hdr-Build_Constraints). Place this line at
the top of your file, followed by a blank line:

```go
//go:build gokrazy

// Program qrbill-api serves QR codes for the Swiss QR-bill standard via HTTP.
package main
```

By convention, the file name for such code should end in `_gokrazy.go`, similar
to how the go tool picks up on `GOOS` and `GOARCH` from, for example,
`source_windows_amd64.go`.

## Example: qrbill

As an example, take a look at the qrbill programm, which [changes its default
listen
address](https://github.com/stapelberg/qrbill/blob/fa239518026fe26a0559f2bb2c7dd50cce89c3ad/cmd/qrbill-api/api_gokrazy.go)
(in `api_gokrazy.go`) depending on where it runs.

For development, it listens on `localhost:9933`, but on gokrazy, it listens on
`:9933` (all IP addresses).


