+++
title = 'Version 4.2'
type = 'releasenotes'
weight = -2

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.93.0'
+++

## 4.2.0 (2022-06-23) {#4-2-0}

### Breaking

- {{% badge style="breaking" %}}Breaking{{% /badge %}} The second parameter for the [`include` shortcode](shortcodes/include) was switched in meaning and was renamed from `showfirstheading` to `hidefirstheading`. If you haven't used this parameter in your shortcode, the default behavior hasn't changed and you don't need to change anything.

  If you've used the second boolean parameter, you have to rename it and invert its value to achieve the same behavior.

### Change

- {{% badge style="change" %}}Change{{% /badge %}} Previously, if the [`tabs` shortcode](shortcodes/tabs) could not find a tab item because, the tabs ended up empty. Now the first tab is selected instead.

- {{% badge style="change" %}}Change{{% /badge %}} The `landingPageURL` was removed from `hugo.toml`. You can safely remove this as well from your configuration as it is not used anymore. The theme will detect the landing page URL automatically and will point to the project's home page. If you want to support a different link, overwrite the `logo.html` partial.

### New

- {{% badge style="new" %}}New{{% /badge %}} All shortcodes can now be also called from your partials. Examples for this are added to the documentation of each shortcode.
