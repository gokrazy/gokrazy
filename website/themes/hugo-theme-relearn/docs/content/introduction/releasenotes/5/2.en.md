+++
title = 'Version 5.2'
type = 'releasenotes'
weight = -2

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.2.0 (2022-08-03) {#5-2-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} If you've set `collapsibleMenu = true` in your `hugo.toml`, the menu will be expanded if a search term is found in a collapsed submenu. The menu will return to its initial collapse state once the search term does not match any submenus.
