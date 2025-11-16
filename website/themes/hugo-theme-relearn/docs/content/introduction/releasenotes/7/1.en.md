+++
title = 'Version 7.1'
type = 'releasenotes'
weight = -1

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.126.0'
+++

## 7.1.0 (2024-10-25) {#7-1-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The sidebar menus are now [completely configurable](configuration/sidebar/menus).

  This is provided by the new parameter `sidebarmenus`. With the new system, you can

  - show arbitrary amounts of menus
  - set headings for each menu
  - base it on your page structure or use Hugo's menu feature
  - configure a starting page if a menu is based on page structure
  - display unlimited nesting for both menu types
  - reconfigure the menus in a page's front matter
  - apply the usual parameter `alwaysopen`, `collapsibleMenu`, etc. for all menu types

  You don't need to change anything in your existing installation as the old configuration is used as a default.

- {{% badge style="change" %}}Change{{% /badge %}} The [`children` shortcode](shortcodes/children) was changed to output a page's _LinkTitle_ instead of previously using the _Title_.

  As the shortcode always outputs subpages in context of the parent page, it functions similar to the sidebar menu. The sidebar menu itself uses the _LinkTitle_ for naming the menu entries and so should the shortcode do.

  The parameter value `sort=linktitle` was deprecated for the easier `sort=title`. You can still use the old value but both behave the same way in sorting by _LinkTitle_.

### New

- {{% badge style="new" %}}New{{% /badge %}} Menus created by your page structure are now able to [contain arbitrary links](configuration/sidebar/menus#displaying-arbitrary-links-in-a-page-menu) inserted into the structure using the `menuUrl` or `menuPageRef` front matter.
