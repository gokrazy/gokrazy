+++
categories = ['howto']
description = 'What site-wide meta information can be set'
frontmatter = ['description']
options = ['author.email', 'author.name']
title = 'Meta Information'
weight = 4
+++

## Site Author Information

{{% badge style="option" %}}Option{{% /badge %}} The theme uses author details in various parts of your site, like RSS feeds and meta tags.

{{< multiconfig file=hugo section=params >}}
[author]
  name = 'Santa Claus'
  email = 'santa@example.com'
{{< /multiconfig >}}

## Site Title

The `title` will be used in meta information of your HTML.

{{< multiconfig file=hugo >}}
title = 'Hugo Relearn Theme'
{{< /multiconfig >}}

## Site Description

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The theme shows a site description in various places, such as RSS feeds and meta tags. For this, it uses the `description` field from your home page's front matter.

## Social Media Images

When your page is shared on social media, you can set a site-wide image to display with the link

{{< multiconfig file=hugo >}}
images = [ 'images/hero.png' ]
{{< /multiconfig >}}

## More Social Media Options

The theme adheres to Hugo's official documentation for [Open Graph](https://gohugo.io/templates/embedded/#configuration-open-graph) and [Twitter Cards](https://gohugo.io/templates/embedded/#configuration-x-cards) configuration.
