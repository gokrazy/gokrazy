+++
title = 'Version 6.2'
type = 'releasenotes'
weight = -2

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.121.0'
+++

## 6.2.0 (2024-08-26) {#6-2-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The heading anchor links are extended in functionality.

  If you now click on it, not only is the link copied to the clipboard (previous behavior) but also the heading scrolls to the top of the page.

  If you dislike the new behavior, you can deactivate it by setting `disableAnchorScrolling=true` in your `hugo.toml`. See the [docs for further options](configuration/content/headings).

### New

- {{% badge style="new" %}}New{{% /badge %}} If you are running Hugo {{% badge style="hugo" %}}0.132.0{{% /badge %}} or later, the theme is now capable to print [GitHub alerts](authoring/markdown#github-alerts).

- {{% badge style="new" %}}New{{% /badge %}} To support new severity levels for GitHub alerts, all shortcodes that support severity levels with their `style` parameter were expanded with the new severities `caution` and `important` and the `color` parameter was expanded with `cyan` and `magenta`. Please note, that coloring and icons of severities may defer from the [display you see on GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts).

- {{% badge style="new" %}}New{{% /badge %}} To support new severity levels for GitHub alerts, the new severities and their according colors are also available as CSS variables `BOX-MAGENTA-color`, `BOX-MAGENTA-TEXT-color`, `BOX-CAUTION-color`, `BOX-CAUTION-TEXT-color`, `BOX-CYAN-color`, `BOX-CYAN-TEXT-color`, `BOX-IMPORTANT-color`, `BOX-IMPORTANT-TEXT-color`. You don't need to change anything in your custom color stylesheet as appropriate default colors will be used.
