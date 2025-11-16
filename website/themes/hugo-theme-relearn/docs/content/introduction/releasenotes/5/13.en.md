+++
title = 'Version 5.13'
type = 'releasenotes'
weight = -13

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.13.0 (2023-05-17) {#5-13-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The `swagger` shortcode was deprecated in favor for the  [`openapi` shortcode](shortcodes/openapi). You don't need to change anything yet as the old name will be used as a fallback. It is planned to remove the `swagger` shortcode in the next major release.

  Additionally, the implemantion of this shortcode was switched from RapiDoc to [SwaggerUI](https://github.com/swagger-api/swagger-ui).
