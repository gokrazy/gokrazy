+++
title = 'Version 5.27'
type = 'releasenotes'
weight = -27

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.121.0'
+++

## 5.27.0 (2024-04-07) {#5-27-0}

### Hugo 0.121.0

- {{% badge style="hugo" %}}0.121.0{{% /badge %}} This release requires a newer Hugo version.

### Change

- {{% badge style="change" %}}Change{{% /badge %}} If the theme is configured to generate warnings or errors during build by setting `image.errorlevel` to either `warning` or `error` in your `hugo.toml`, it will now also generate output if a link fragment is not found in the target page.

- {{% badge style="change" %}}Change{{% /badge %}} The [dependency loader](configuration/customization/extending) was made more versatile.

  The configuration in your `hugo.toml` does not require the `location` parameter anymore. If you still use it, the theme will work as before but will generate a warning. So you don't need to change anything, yet.

  With the new mechanism, your dependency loader now receives an additional `location` parameter instead that you can query to inject your dependencies in the desired location.

  By that you can now call the dependency mechanism in your own overriden partials by giving it a distinct `location` parameter. In addition your injected files can now be spread to multiple locations which wasn't previously possible.

### New

- {{% badge style="new" %}}New{{% /badge %}} Additional styling was added for the native HTML elements `<mark>` and `<kbd>`. To use them you must allow the [usage of HTML](https://gohugo.io/getting-started/configuration-markup/#rendererunsafe) in your `hugo.toml`. The [Markdown documentation](authoring/markdown#standard-and-extensions) was enhanced for this.

- {{% badge style="new" %}}New{{% /badge %}} You now can scroll forward and backward through all headings of a page by using <kbd>ALT</kbd> <kbd>🡑</kbd> and <kbd>ALT</kbd> <kbd>🡓</kbd>. This also works for the `PRINT` output format.

- {{% badge style="new" %}}New{{% /badge %}} The breadcrumbs used in the topbar, search results and the taxonomy term lists are now using the pages front matter `linktitle` instead of `title` if set.
