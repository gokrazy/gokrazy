+++
title = 'Version 5.17'
type = 'releasenotes'
weight = -17

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.17.0 (2023-06-22) {#5-17-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The default behavior for the copy-to-clipboard feature for code blocks has changed.

  The copy-to-clipboard button for code blocks will now only be displayed if the reader hovers the code block.

  If you dislike this new behavior you can turn it off and revert to the old behavior by adding `[params] disableHoverBlockCopyToClipBoard=true` to your `hugo.toml`.

### New

- {{% badge style="new" %}}New{{% /badge %}} Restored compatibility with Hugo {{% badge style="hugo" %}}0.114.0{{% /badge %}} or higher. This does not change the minimum required Hugo version.

- {{% badge style="new" %}}New{{% /badge %}} The new [`highlight` shortcode](shortcodes/highlight) replaces Hugo's default implementation and is fully compatible. So you don't need to change anything.

  In addition it offers some extensions. Currently only the `wrap` extension option is provided to control whether a code block should be wrapped or scrolled if to long to fit.
