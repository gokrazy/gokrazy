+++
title = 'Version 5.3'
type = 'releasenotes'
weight = -3

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.3.0 (2022-10-07) {#5-3-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} In the effort to comply with WCAG standards, the implementation of the collapsible menu was changed. The functionality of the new implementation does not work with old browsers (Internet Explorer 11).

### New

- {{% badge style="new" %}}New{{% /badge %}} [Image formatting](authoring/markdown#css-classes) has two new classes to align images to the `left` or `right`. Additionally, the already existing `inline` option is now documented.

- {{% badge style="new" %}}New{{% /badge %}} Printing for the [`swagger` shortcode](shortcodes/openapi) was optimized to expand sections that are usually closed in interactive mode. This requires [print support](configuration/sitemanagement/outputformats#print-support) to be configured.
