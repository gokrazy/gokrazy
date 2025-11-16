+++
title = 'Version 3.2'
type = 'releasenotes'
weight = -2

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.93.0'
+++

## 3.2.0 (2022-03-19) {#3-2-0}

### Hugo 0.93.0

- {{% badge style="hugo" %}}0.93.0{{% /badge %}} This release requires a newer Hugo version.

### Change

- {{% badge style="change" %}}Change{{% /badge %}} In this release the Mermaid JavaScript library will only be loaded on demand if the page contains a Mermaid shortcode or is using Markdown codefences. This changes the behavior of `disableMermaid` config option as follows: If a Mermaid shortcode or Markdown codefence is found, the option will be ignored and Mermaid will be loaded regardlessly.

  The option is still useful in case you are using scripting to set up your graph. In this case no shortcode or Markdown codefence is involved and the library is not loaded by default. In this case you can set `disableMermaid=false` in your front matter to force the library to be loaded. See the [theme variant generator](configuration/branding/generator) of the docs for an example.

### New

- {{% badge style="new" %}}New{{% /badge %}} Additional color variant variable `--MERMAID-theme` to set the variant's Mermaid theme. This causes the Mermaid theme to switch with the color variant if it defers from the setting of the formerly selected color variant.
