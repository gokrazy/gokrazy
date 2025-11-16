+++
categories = ['explanation', 'howto']
description = 'Learn about the hidden pages feature'
options = ['disableSearchHiddenPages', 'disableSeoHiddenPages', 'disableTagHiddenPages']
title = 'Hidden Pages'
weight = 6
+++

This theme allows you to [create hidden pages](authoring/meta#hidden).

Hidden pages are created but not shown in the navigation. This is useful for pages you only want to access via a direct link.

When you visit a hidden page's URL, it will appear in the navigation menu.

Hidden pages can also have hidden subpages, creating multiple levels of hiding.

By default, hidden pages are only hidden from human visitors. Search engines can still find them by crawling your site and the pages are linked in your taxonomies and site search. You can prevent this with these options.

## Hide from Search

{{% badge style="option" %}}Option{{% /badge %}} To remove hidden pages from search results, use `disableSearchHiddenPages=true`.

{{< multiconfig file=hugo section=params >}}
disableSearchHiddenPages = true
{{< /multiconfig >}}

## Hide from Search Engines

{{% badge style="option" %}}Option{{% /badge %}} To hide pages from search engines by removing them from the sitemap, RSS feed and [make them `nofollow`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives), use `disableSeoHiddenPages=true`.

{{< multiconfig file=hugo section=params >}}
disableSeoHiddenPages = true
{{< /multiconfig >}}

## Hide from Taxonomies

{{% badge style="option" %}}Option{{% /badge %}} To prevent hidden pages from appearing on taxonomy and term pages, use `disableTagHiddenPages=true`. If this makes a term's count zero, an empty term page will still be created but not linked.

{{< multiconfig file=hugo section=params >}}
disableTagHiddenPages = true
{{< /multiconfig >}}
