+++
title = 'Version 3.4'
type = 'releasenotes'
weight = -4

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.93.0'
+++

## 3.4.0 (2022-04-03) {#3-4-0}

### Breaking

- {{% badge style="breaking" %}}Breaking{{% /badge %}} If you had previously overwritten the `custom-footer.html` partial to add visual elements below the content of your page, you have to move this content to the new partial `content-footer.html`. `custom-footer.html` was never meant to contain HTML other than additional styles and JavaScript.

### New

- {{% badge style="new" %}}New{{% /badge %}} If you prefer expandable/collapsible menu items, you can now set `collapsibleMenu=true` in your `hugo.toml`. This will add arrows to all menu items that contain sub menus. The menu will expand/collapse without navigation if you click on an arrow.

- {{% badge style="new" %}}New{{% /badge %}} You can activate [print support](configuration/sitemanagement/outputformats#print-support) in your `hugo.toml` to add the capability to print whole chapters or even the complete site.

- {{% badge style="new" %}}New{{% /badge %}} Translation into Traditional Chinese.
