+++
title = 'Version 5.9'
type = 'releasenotes'
weight = -9

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.9.0 (2022-12-23) {#5-9-0}

### Breaking

- {{% badge style="breaking" %}}Breaking{{% /badge %}} With this version it is now possible to not only have sections on the first menu level but also pages.

  It was later discovered, that this causes pages only meant to be displayed in the `More` section of the menu and stored directly inside your `content` directory to now show up in the menu as well.

  To [get rid](configuration/sidebar/menus#displaying-pages-exclusively-in-a-hugo-menu) of this undesired behavior you have two choices:

  1. Make the page file a [headless branch bundle](https://gohugo.io/content-management/page-bundles/#headless-bundle) (contained in its own subdirectory and called `_index.md`) and add the following front matter configuration to the file (see docs `content/showcase/_index.en.md`). This causes its content to **not** be ontained in the sitemap.

	  {{< multiconfig fm=true >}}
	  title = 'Showcase'
	  [build]
		render = 'always'
		list = 'never'
		publishResources = true
	  {{< /multiconfig >}}

  2. Store the page file for below a parent headless branch bundle and add the following front matter to he **parent** (see docs `content/more/_index.en.md`). **Don't give this page a `title`** as this will cause it to be shown in the breadcrumbs - a thing you most likely don't want.

	  {{< multiconfig fm=true >}}
	  [build]
		render = 'never'
		list = 'never'
		publishResources = false
	  {{< /multiconfig >}}

	  In this case, the file itself can be a branch bundle, leaf bundle or simple page (see docs `content/more/credits.en.md`). This causes its content to be contained in the sitemap.

	  {{< multiconfig fm=true >}}
	  title = 'Credits'
	  {{< /multiconfig >}}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The required directory name for the [`attachments` shortcode](shortcodes/attachments) was changed for leaf bundles.

  Previously, the attachments for leaf bundles in non-multilang setups were required to be in a `files` subdirectory. For page bundles and leaf bundles in multilang setups they were always required to be in a `_index.<LANGCODE>.files` or `index.<LANGCODE>.files` subdirectory accordingly.

  This added unnecessary complexity. So attachments for leaf bundles in non-multilang setups can now also reside in a `index.files` directory. Although the old `files` directory is now deprecated, if both directories are present, only the old `files` directory will be used for compatibility.

- {{% badge style="change" %}}Change{{% /badge %}} Absolute links prefixed with `http://` or `https://` are now opened in a separate browser tab.

  You can revert back to the old behavior by defining `externalLinkTarget="_self"` in the `params` section of your `hugo.toml`.

### New

- {{% badge style="new" %}}New{{% /badge %}} The theme now supports [Hugo's module system](https://gohugo.io/hugo-modules/).
