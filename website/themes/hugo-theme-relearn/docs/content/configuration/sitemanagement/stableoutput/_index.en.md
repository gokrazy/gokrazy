+++
categories = ['howto']
description = 'How to make your generated HTML output stable'
options = ['disableAssetsBusting', 'disableGeneratorVersion', 'disableRandomIds', 'minify']
title = 'Stable Output'
weight = 8
+++

## Disabling the Generator Meta

{{% badge style="option" %}}Option{{% /badge %}} The theme adds a meta tag with its version number to each page.

This isn't a security risk and helps us support you better.

To turn this off, set `disableGeneratorVersion=true`.

{{< multiconfig file=hugo section=params >}}
disableGeneratorVersion = true
{{< /multiconfig >}}

If you also want to turn off [Hugo's version meta tag](https://gohugo.io/getting-started/configuration/#disablehugogeneratorinject), use `disableHugoGeneratorInject=true`.

## Disabling IDs for Referenced Assets

{{% badge style="option" %}}Option{{% /badge %}} The theme creates a unique ID for each build and adds it to each referenced asset's URL to make browsers not keep outdated cached assets.

This is good for production sites but can be problematic during development. It makes comparing outputs difficult as each build has new IDs.

To disable this, set `disableAssetsBusting=true`.

{{< multiconfig file=hugo section=params >}}
disableAssetsBusting = true
{{< /multiconfig >}}

## Disabling IDs for Interactive HTML Elements

{{% badge style="option" %}}Option{{% /badge %}} Features like expanders, notices, and tabs use unique IDs to work. These IDs change with each build.

This is necessary for the theme to work properly, but it can make comparing outputs between builds difficult.

To turn this off, set `disableRandomIds=true`. Note, that this will result in a non-functional site!.

{{< multiconfig file=hugo section=params >}}
disableRandomIds = true
{{< /multiconfig >}}

## Disabling Assets Minification

{{% badge style="option" %}}Option{{% /badge %}} If `minify=true`, further theme assets will be minified during build. If no value is set, the theme will avoid minification if you have started with `hugo server` and otherwise will minify.

{{< multiconfig file=hugo section=params >}}
minify = false
{{< /multiconfig >}}
