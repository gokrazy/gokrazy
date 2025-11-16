+++
categories = ['explanation']
description = 'How to link to pages and resources'
title = 'Pages & Resources'
weight = 1
+++

## Standard Links

The usual way to link to a page or a resource is to use a Markdown link in the form of `[some page](a-page)` or `![some image](an-image)`.

Images are searched in the resources of the current page and your global `assets` directory.

## Links to Other Page Translations

By giving the query parameter `lang`, containing the language code, you can link to pages of other translations of your site, e.g. `[some translated page](my-page?lang=pir)`.

## Links to Other Page Output Formats

You can link to different output formats of a page by adding the query parameter `format`. For example to link to the print format of a page, write `[a printable page](my-page?format=print)`.
