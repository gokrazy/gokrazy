---
title: "Instance Config Migration Guide"
menuTitle: "Instance Config Migration Guide"
weight: 11
---

Before 2023, the concept of gokrazy instance configuration was only a
convention. Each gokrazy build was created using the `gokr-packer` CLI tool, and
configured by the packer’s command-line flags, parameters, config files in
`~/.config` and per-package config files in the current directory
(e.g. `flags/github.com/gokrazy/breakglass/flags.txt`).

In 2023, the concept of gokrazy instance configuration was introduced (see
[issue #147](https://github.com/gokrazy/gokrazy/issues/147)).

Now, each gokrazy instance, which typically corresponds to one Raspberry Pi or
other machine, has its own directory within the gokrazy parent directory
(`~/gokrazy` by default), e.g. `~/gokrazy/scanner`.

The new `gok` CLI tool works in the instance directory
(e.g. `~/gokrazy/scanner`) and reads the single `config.json` file, which
contains all settings.

## Migration

If you’re using the old mechanism (`gokr-packer` commands), here is how to
migrate to the new `gok` CLI. Assuming you use a command like the following:

```shell
gokr-packer \
  -hostname=scanner \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  github.com/stapelberg/scan2drive/cmd/scan2drive
```

Run your `gokr-packer` command manually once, but add the
`-write_instance_config` flag:

{{< highlight shell "hl_lines=2" >}}
gokr-packer \
  -write_instance_config=scanner \
  -hostname=scanner \
  -update=yes \
  github.com/gokrazy/hello \
  github.com/gokrazy/breakglass \
  github.com/gokrazy/serial-busybox \
  github.com/stapelberg/scan2drive/cmd/scan2drive
{{< /highlight >}}

This will make `gokr-packer` create `~/gokrazy/scanner`.

From now on, switch to using the `gok` CLI for updating your instance:

```bash
gok -i scanner update
```

To open your instance’s configuration in your editor, use `gok -i scanner edit`.
