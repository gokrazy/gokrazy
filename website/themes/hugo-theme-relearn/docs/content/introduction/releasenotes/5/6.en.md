+++
title = 'Version 5.6'
type = 'releasenotes'
weight = -6

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.6.0 (2022-11-18) {#5-6-0}

### New

- {{% badge style="new" %}}New{{% /badge %}} This release introduces an additional dedicated search page. On this page, displayed search results have more space making it easier scanning through large number of results.

  To activate this feature, you need to [configure it](configuration/sidebar/search) in your `hugo.toml` as a new outputformat `searchpage` for the home page. If you don't configure it, no dedicated search page will be accessible and the theme works as before.

  You can access the search page by either clicking on the magnifier glass or pressing enter inside of the search box.

- {{% badge style="new" %}}New{{% /badge %}} Keyboard handling for the TOC and search was improved.

  Pressing `CTRL+ALT+t` now will not only toggle the TOC overlay but also places the focus to the first heading on opening. Subsequently this makes it possible to easily select headings by using the `TAB` key.

  The search received its own brand new keyboard shortcut `CTRL+ALT+f`. This will focus the cursor inside of the search box so you can immediately start your search by typing.

- {{% badge style="new" %}}New{{% /badge %}} You are now able to turn off the generation of generator meta tags in your HTML head to hide the used versions of Hugo and this theme.

  To [configure this](configuration/reference) in your `hugo.toml` make sure to set Hugo's `disableHugoGeneratorInject=true` **and** also `[params] disableGeneratorVersion=true`, otherwise Hugo will generate a meta tag into your home page automagically.

- {{% badge style="new" %}}New{{% /badge %}} Creation of your project gets a little bit faster with this release.

  This addresses increased build time with the version 5 releases. The theme now heavily caches partial results leading to improved performance. To further increase performance, unnecessary parts of the page are now skipped for creation of the print output (eg. menus, navigation bar, etc.).
