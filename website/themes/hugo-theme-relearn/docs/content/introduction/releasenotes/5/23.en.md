+++
title = 'Version 5.23'
type = 'releasenotes'
weight = -23

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.23.0 (2023-11-03) {#5-23-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} With {{% badge style="hugo" %}}0.120.0{{% /badge %}} the author settings move into the `[params]` array in your `hugo.toml`. Because this collides with the previous way, the theme expected author information, it now adheres to Hugo standards and prints out a warning during built if something is wrong.

  Change your previous setting from

	{{< multiconfig file=hugo section=params >}}
	author = 'Hugo'
	{{< /multiconfig >}}

  to

	{{< multiconfig file=hugo section=params >}}
	author.name = 'Hugo'
	{{< /multiconfig >}}

- {{% badge style="change" %}}Change{{% /badge %}} Taxonomy [term pages](https://gohugo.io/content-management/taxonomies#add-custom-metadata-to-a-taxonomy-or-term) now add the breadcrumb for each listed page. If this gets too crowded for you, you can turn the breadcrumbs off in your `hugo.toml` by adding `disableTermBreadcrumbs=true`.

### New

- {{% badge style="new" %}}New{{% /badge %}} Taxonomy and term pages are now allowed to contain content. This is added inbetween the title and the page list.

- {{% badge style="new" %}}New{{% /badge %}} It is now possible to print custom taxonomies anywhere in your page. [See the docs](configuration/customization/taxonomy#setting-up-custom-taxonomies).

- {{% badge style="new" %}}New{{% /badge %}} It is now possible to adjust the menu width for your whole site. [See the docs](configuration/sidebar/width).

- {{% badge style="new" %}}New{{% /badge %}} This release adds social media meta tags for the Open Graph protocol and Twitter Cards to your site. [See the docs](authoring/meta).

- {{% badge style="new" %}}New{{% /badge %}} This release comes with additional sort options for the menu and the [`children` shortcode](shortcodes/children). Both will now accept the following values: `weight`, `title`, `linktitle`, `modifieddate`, `expirydate`, `publishdate`, `date`, `length` or `default` (adhering to Hugo's default sort order).

- {{% badge style="new" %}}New{{% /badge %}} The theme now provides a mechanism to load further JavaScript dependencies defined by you only if it is needed. This comes in handy if you want to add own shortcodes that depend on additional JavaScript code to be loaded. [See the docs](configuration/customization/extending).

- {{% badge style="new" %}}New{{% /badge %}} The theme has updated its Mermaid dependency to 10.6.0. This adds support for the [xychart type](shortcodes/mermaid#xychart).

- {{% badge style="new" %}}New{{% /badge %}} This release adds portable Markdown links.

  Previously it was not possible to use pure Markdown links in a configuration independent way to link to pages inside of your project. It always required you to know how your `uglyURLs` setting is, wheather you link to a page or page bundle and in case of relative links if your current page is a page or page bundle. (eg. `[generator](generator/index.html)` vs. `[generator](generator.html)`). This is a hassle as you have to change these links manually once you change your `uglyURLs` setting or change the type of a page.

  You could work around this by using the `relref` shortcode (eg `[generator]({{%/* relref "../generator" */%}})`) which works but results in non-portable Markdown.

  Now it's possible to use the same path of a call to `relref` in a plain Markdown link (eg `[generator](../generator)`). This is independent of any configuration settings or the page types involved in linking. Note, that this requires your links to be given without any extension, so `[generator](generator/index.html)` will work as before.

  The following types of linking are supported:

  | link                               | description                                 |
  | ---------------------------------- | ------------------------------------------- |
  | `[generator](en/configuration/branding/generator)` | absolute from your project root (multilang) |
  | `[generator](/en/configuration/branding/generator)`| absolute from your project root (multilang) |
  | `[generator](configuration/branding/generator)`    | absolute from your current language root    |
  | `[generator](/configuration/branding/generator)`   | absolute from your current language root    |
  | `[generator](./../generator)`      | relative from the current page              |
  | `[generator](../generator)`        | relative from the current page              |
