+++
title = 'Version 2.4'
type = 'releasenotes'
weight = -4

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.81.0'
+++

## 2.4.0 (2021-10-07) {#2-4-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} Creation of customized stylesheets was simplified down to only contain the CSS variables. Everything else can and should be deleted from your custom stylesheet to assure everything works fine. For the predefined stylesheet variants, this change is already included.

### New

- {{% badge style="new" %}}New{{% /badge %}} Hidden pages are displayed by default in their according tags page. You can now turn off this behavior by setting `disableTagHiddenPages=true` in your `hugo.toml`.

- {{% badge style="new" %}}New{{% /badge %}} You can define the expansion state of your menus for the whole site by setting the `alwaysopen` option in your `hugo.toml`. Please see further [documentation](configuration/sidebar/menus#expand-state-of-submenus) for possible values and default behavior.

- {{% badge style="new" %}}New{{% /badge %}} New front matter `ordersectionsby` option to change immediate children sorting in menu and `children` shortcode. Possible values are `title` or `weight`.

- {{% badge style="new" %}}New{{% /badge %}} Alternate content of a page is now advertised in the HTML meta tags. See [Hugo documentation](https://gohugo.io/templates/rss/#reference-your-rss-feed-in-head).
