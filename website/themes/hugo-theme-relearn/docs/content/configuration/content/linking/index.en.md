+++
categories = ['howto']
description = 'What options are available for links and images'
options = ['disableDefaultRelref', 'disableExplicitIndexURLs', 'enableLegacyLanguageLinks']
title = 'Linking'
weight = 5
+++

Further [settings are available](authoring/frontmatter/linking) to be used in your configuration or front matter.

## URL Management

{{% badge style="option" %}}Option{{% /badge %}} By default, the theme adds `index.html` to page links when `uglyURLs=false` (Hugo's default).

If you're only using a web server scenario and dislike this, you can reset to Hugo's default behavior by settings `disableExplicitIndexURLs=true`.

For the file system scenario, you are not allowed to change this value.

{{< multiconfig file=hugo section=params >}}
disableExplicitIndexURLs = true
{{< /multiconfig >}}

## Legacy Cross-Language Links

You can link to pages of different languages by appending the `lang` query parameter with the language code to the URL, e.g. `/my-page?lang=pir`.

In previous releases of the theme you had to prepend the language code to the URL, e.g. `/pir/my-page` to achieve this.

If you still need the old behavior, you can set `enableLegacyLanguageLinks=true` in your `hugo.toml`. Note that this legacy feature may be removed in the future.

## Patching the `relref` Shortcode

{{% badge style="option" %}}Option{{% /badge %}} While the usage of `relref` is obsolete and discouraged by Hugo for a while, existing installations may still use it.

In configurations using a **baseURL** with a **subdirectory** and having **relativeURLs=false** (the default), Hugo’s standard `relref` implementation is failing.

To work around this, you can activate a patched version of the shortcode by setting `disableDefaultRelref=true`.

{{< multiconfig file=hugo section=params >}}
disableDefaultRelref = true
{{< /multiconfig >}}
