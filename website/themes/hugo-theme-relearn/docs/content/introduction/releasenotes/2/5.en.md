+++
title = 'Version 2.5'
type = 'releasenotes'
weight = -5

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.81.0'
+++

## 2.5.0 (2021-10-08) {#2-5-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} New colors `--CODE-BLOCK-color` and `--CODE-BLOCK-BG-color` were added to provide a fallback for Hugo's syntax highlighting in case no language was given or the language is unsupported. Ideally the colors are set to the same values as the ones from your chosen chroma style.
