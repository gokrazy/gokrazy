+++
categories = ['howto']
description = 'Options for specific deployment needs'
title = 'Deployment Scenarios'
weight = 5
+++

## Offline Usage

The theme is usable offline. No internet connection is required to load your page. This is achieved by storing all dependencies within the theme.

No calls to 3rd party servers, no calling home, no tracking. Privacy friendly.

## Server Deployment

If your server deployment has no special requirements, you can skip this section and use the [standard Hugo options](https://gohugo.io/content-management/urls/).

For special requirements, the theme is capable of different scenarios, requiring the following mandatory settings in your `hugo.toml`. All settings not mentioned in the examples below can be set to your liking.

### Public Web Server from Root

{{< multiconfig file=hugo >}}
baseURL = 'https://example.com/'
{{< /multiconfig >}}

### Public Web Server from Subdirectory

{{< multiconfig file=hugo >}}
baseURL = 'https://example.com/mysite/'
relativeURLs = false
{{< /multiconfig >}}

If you are still using Hugo's `relref` shortcode (which you shouldn't), you will need [further configuration](configuration/content/linking#patching-the-relref-shortcode).

> [!WARNING]
> Don't use a `baseURL` with a subdirectory and `relativeURLs=true` together. [Hugo doesn't apply the `baseURL` correctly](https://github.com/gohugoio/hugo/issues/12130) in this case. If you need both, generate your site twice with different settings into separate directories.

### Private Web Server (LAN)

The same settings as with any of the public web server scenarios or

{{< multiconfig file=hugo >}}
baseURL = '/'
relativeURLs = true
{{< /multiconfig >}}

### File System

Your generated site can be used headless without a HTTP server.

This can be achieved by using the `file://` protocol in your browser's address bar or by double click on a generated `*.html` file in your file navigation tool.

Use the following settings

{{< multiconfig file=hugo >}}
baseURL = '/'
relativeURLs = true
{{< /multiconfig >}}

> [!note]
> Pages like `sitemap.xml` and `rss.xml`, and social media links will always use absolute URLs. They won't work with `relativeURLs=true`.
