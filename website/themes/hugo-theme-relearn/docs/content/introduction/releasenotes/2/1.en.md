+++
title = 'Version 2.1'
type = 'releasenotes'
weight = -1

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.69.0'
+++

## 2.1.0 (2021-09-07) {#2-1-0}

### Hugo 0.69.0

- {{% badge style="hugo" %}}0.69.0{{% /badge %}} This release requires a newer Hugo version.

### Change

- {{% badge style="change" %}}Change{{% /badge %}} In case the site's structure contains additional *.md files not part of the site (eg files that are meant to be included by site pages), they will now be ignored by the search.

### New

- {{% badge style="new" %}}New{{% /badge %}} Hidden pages are indexed for the site search by default. You can now turn off this behavior by setting `disableSearchHiddenPages=true` in your `hugo.toml`.

- {{% badge style="new" %}}New{{% /badge %}} If a search term is found in an `expand` shortcode, the expand will be opened.

- {{% badge style="new" %}}New{{% /badge %}} The menu will scroll the active item into view on load.
