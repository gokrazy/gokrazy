+++
title = 'Version 3.3'
type = 'releasenotes'
weight = -3

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.93.0'
+++

## 3.3.0 (2022-03-28) {#3-3-0}

### New

- {{% badge style="new" %}}New{{% /badge %}} Introduction of new CSS variables to set the font. The theme distinguishes between `--MAIN-font` for all content text and `--CODE-font` for inline or block code. There are additional overrides for all headings. See the [theme variant generator](configuration/branding/generator) of the docs for all available variables.

- {{% badge style="new" %}}New{{% /badge %}} The new shortcode `swagger` is available to include a UI for REST OpenAPI specifications. See the [documentation](shortcodes/openapi) for available features. This feature will not work with Internet Explorer 11.
