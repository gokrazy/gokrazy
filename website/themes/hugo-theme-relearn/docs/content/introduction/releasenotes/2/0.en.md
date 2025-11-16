+++
title = 'Version 2.0'
type = 'releasenotes'
weight = 0

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.65.0'
+++

## 2.0.0 (2021-08-28) {#2-0-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} Syntax highlighting was switched to the [built in Hugo mechanism](https://gohugo.io/content-management/syntax-highlighting/). You may need to configure a new stylesheet or decide to roll you own as described on in the Hugo documentation

- {{% badge style="change" %}}Change{{% /badge %}} In the predefined stylesheets there was a typo and `--MENU-HOME-LINK-HOVERED-color` must be changed to `--MENU-HOME-LINK-HOVER-color`. You don't need to change anything in your custom color stylesheet as the old name will be used as a fallback.

- {{% badge style="change" %}}Change{{% /badge %}} `--MENU-HOME-LINK-color` and `--MENU-HOME-LINK-HOVER-color` were missing in the documentation. You should add them to your custom stylesheets if you want to override the defaults.

- {{% badge style="change" %}}Change{{% /badge %}} Arrow navigation and `children` shortcode were ignoring setting for `ordersectionsby`. This is now changed and may result in different sorting order of your sub pages.

- {{% badge style="change" %}}Change{{% /badge %}} If hidden pages are accessed directly by typing their URL, they will be exposed in the menu.

- {{% badge style="change" %}}Change{{% /badge %}} A page without a `title` will be treated as `hidden=true`.

### New

- {{% badge style="new" %}}New{{% /badge %}} You can define the expansion state of your menus in the front matter. Please see further [documentation](configuration/sidebar/menus#expand-state-of-submenus) for possible values and default behavior.

- {{% badge style="new" %}}New{{% /badge %}} New partials for defining pre/post content for menu items and the content. See [documentation](configuration/customization/partials) for further reading.

- {{% badge style="new" %}}New{{% /badge %}} Shortcode [`children`](shortcodes/children) with new parameter `containerstyle`.

- {{% badge style="new" %}}New{{% /badge %}} New shortcode [`include`](shortcodes/include) to include arbitrary file content into a page.
