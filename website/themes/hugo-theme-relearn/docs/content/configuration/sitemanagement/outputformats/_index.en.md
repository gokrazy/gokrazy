+++
categories = ['howto']
description = 'What formats can a page be displayed in'
outputs = ['html', 'rss', 'print', 'markdown', 'source']
title = 'Available Output Formats'
weight = 7
+++

The Relearn theme by default comes with templates for HTML and RSS for each page.

In addition you can configure the below formats.

If this is not enough, learn how to [create your own output formats](configuration/customization/outputformats).

## Print Support

Enable print support to print entire chapters or the whole site. Add the `print` output format to your home, section, and page in `hugo.toml`:

{{< multiconfig file=hugo >}}
[outputs]
  home = ['html', 'rss', 'print']
  section = ['html', 'rss', 'print']
  page = ['html', 'print']
{{< /multiconfig >}}

By default this adds a printer icon in the topbar but [can be deactived](authoring/frontmatter/topbar/#print-button). Clicking it switches to print preview, showing the page and its [visible subpages](configuration/content/hidden) in a printer-friendly format. Use your browser's print function to print or save as PDF.

The URL won't be [configured ugly](https://gohugo.io/configuration/output-formats/) for [Hugo's URL handling](https://gohugo.io/content-management/urls/#ugly-urls), even with `uglyURLs=true` in `hugo.toml`. This is because each mime type can only have one suffix.

If you don't like the URLs, you can reconfigure `outputFormats.print` in your `hugo.toml` to something other than the default of:

{{< multiconfig file=hugo >}}
[outputFormats]
  [outputFormats.print]
    name= 'print'
    baseName = 'index.print'
    isHTML = true
    mediaType = 'text/html'
    permalinkable = false
    noUgly = true
{{< /multiconfig >}}

## Markdown Support

Enable support to show the Markdown source of a page. Add the `markdown` output format to your home, section, and page in `hugo.toml`:

{{< multiconfig file=hugo >}}
[outputs]
  home = ['html', 'rss', 'markdown']
  section = ['html', 'rss', 'markdown']
  page = ['html', 'markdown']
{{< /multiconfig >}}

By default this adds a Markdown icon in the topbar but [can be deactived](authoring/frontmatter/topbar/#markdown-button). Clicking it switches to the Markdown source including the title of the page.

The `markdown` output format configuration is [provided by Hugo](https://gohugo.io/configuration/output-formats/).

## Source Support

Enable support to show the source code of a page if it was generated from a file. Add the `source` output format to your home, section, and page in `hugo.toml`:

{{< multiconfig file=hugo >}}
[outputs]
  home = ['html', 'rss', 'source']
  section = ['html', 'rss', 'source']
  page = ['html', 'source']
{{< /multiconfig >}}

By default this adds a Source icon in the topbar but [can be deactived](authoring/frontmatter/topbar/#source-button). Clicking it switches to the source code of the page.

The Source output format differs from the Markdown format, as it prints the source code _as is_ including the front matter.

The URL won't be [configured ugly](https://gohugo.io/configuration/output-formats/) for [Hugo's URL handling](https://gohugo.io/content-management/urls/#ugly-urls), even with `uglyURLs=true` in `hugo.toml`. This is because each mime type can only have one suffix.

If you don't like the URLs, you can reconfigure `outputFormats.source` in your `hugo.toml` to something other than the default of:

{{< multiconfig file=hugo >}}
[outputFormats]
  [outputFormats.source]
    name= 'source'
    baseName = 'index.source'
    isHTML = false
    mediaType = 'text/markdown'
    permalinkable = false
    noUgly = true
{{< /multiconfig >}}
