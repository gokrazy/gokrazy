+++
title = 'Version 5.26'
type = 'releasenotes'
weight = -26

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.112.4'
+++

## 5.26.0 (2024-03-18) {#5-26-0}

### New

- {{% badge style="new" %}}New{{% /badge %}} The lazy loading of images is now configurable by using the new `lazy` [image effect](configuration/customization/imageeffects). The default value hasn't changed in comparison to older versions, you don't need to change anything.

- {{% badge style="new" %}}New{{% /badge %}} It is now possible to [adjust the max width of the main area](configuration/content/width), eg. in case you want to use the full page width for your content.

- {{% badge style="new" %}}New{{% /badge %}} Images and Markdown codefences are now respecting [Hugo's Markdown attributes](https://gohugo.io/content-management/markdown-attributes/).

- {{% badge style="new" %}}New{{% /badge %}} The theme has updated its Mermaid dependency to 10.6.0. This adds support for [block diagrams](shortcodes/mermaid#block-diagram).

- {{% badge style="new" %}}New{{% /badge %}} This release fixes a long-standing bug where the page wasn't repositioning correctly when going forward or backward in your browser history.
