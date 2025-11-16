+++
title = 'Version 5.14'
type = 'releasenotes'
weight = -14

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.14.0 (2023-05-20) {#5-14-0}

### New

- {{% badge style="new" %}}New{{% /badge %}} The taxonomy pages received some love in this release, making them better leverage available screen space and adding translation support for the taxonomy names.

  Hugo's default taxonmies `tags` and `categories` are already contained in the theme's i18n files. If you have self-defined taxonomies, you can add translations by adding them to your own i18n files. If you don't provide translations, the singualar and plural forms are taken as configured in your `hugo.toml`.

- {{% badge style="new" %}}New{{% /badge %}} To give you more flexibility in customizing your article layout a new partial `content-header.html` is introduced.

  This came out of the requirement to customize the position of article tags, which by default are displayed above the title. A second requirement was to also show additional [taxonomies](https://gohugo.io/content-management/taxonomies/) not supported by the theme natively. While Hugo supports tags and categories by default, the theme only displays tags.

  So how to adjust the position of tags starting from the theme's default where tags are only shown above the title?

  1. Hide tags above title: Overwrite `content-header.html` with an empty file.
  2. Show tags between title and content: Overwrite `heading-post.html` and add `{{ partial "tags.html" . }}` to it.
  3. Show tags below content: Overwrite `content-footer.html` and add `{{ partial "tags.html" . }}` to it.

- {{% badge style="new" %}}New{{% /badge %}} The new parameter `breadcrumbSeparator` is now available in your `hugo.toml` to change the - well - separator of the breadcrumb items. An appropriate default is in place if you do not configure anything.
