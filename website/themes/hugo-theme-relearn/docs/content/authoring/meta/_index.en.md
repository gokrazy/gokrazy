+++
categories = ['howto']
description = 'What page meta information are available'
frontmatter = ['headingPost', 'headingPre', 'hidden', 'LastModifierDisplayName', 'LastModifierEmail']
title = 'Meta Information'
weight = 3
+++

## Page Title

The `title` will be used in the heading and meta information of your HTML.

A page without a title is [treated as if `hidden=true`](#hidden) has been set.

{{< multiconfig fm=true >}}
title = 'Example Title'
{{< /multiconfig >}}

## Page Description

The `description` is used for generating HTML meta information, in the [children](shortcodes/children) shortcode and in social media meta information.

If not set, the set value of your site's hugo.toml is used for the HTML meta information and social media meta information. It appears empty for the [children](shortcodes/children) shortcode.

{{< multiconfig fm=true >}}
description = 'Some lenghty example description'
{{< /multiconfig >}}

## Social Media Images

The theme adds social media meta tags including feature images for the [Open Graph](https://gohugo.io/templates/embedded/#open-graph) protocol and [Twitter Cards](https://gohugo.io/templates/embedded/#x-twitter-cards) to your site. These are configured as mentioned in the linked Hugo docs.

{{< multiconfig fm=true >}}
images = [ 'images/hero.png' ]
{{< /multiconfig >}}

## Hidden

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can hide your pages from the menu by setting `hidden=true`.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} For [Hugo menus](https://gohugo.io/content-management/menus/), you have to set `params.hidden=true` instead.

[See how you can further configure visibility](configuration/content/hidden) throughout your site.

{{< multiconfig fm=true section=params >}}
hidden = true
{{< /multiconfig >}}

## Add Icon to the Title Heading

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} In the page front matter, add a `headingPre` to insert any HTML code before the title heading. You can also set `headingPost` to insert HTML code after the title heading.

You also may want to [apply further CSS](configuration/customization/extending#adding-javascript-or-stylesheets-to-all-pages) in this case.

{{< multiconfig fm=true section=params >}}
headingPre = '<i class="fab fa-github"></i> '
{{< /multiconfig >}}

## Footer Information

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} If you use the default `layouts/partials/content-footer.html` is not overridden by you, it will display authoring information, namely

- `AuthorName` if [GitInfo](https://gohugo.io/methods/page/gitinfo/) is active, otherwise `LastModifierDisplayName` front matter
- `AuthorEmail` if [GitInfo](https://gohugo.io/methods/page/gitinfo/) is active, otherwise `LastModifierEmail` front matter
- `AuthorDate` if [GitInfo](https://gohugo.io/methods/page/gitinfo/) is active, otherwise [Hugo's `date` front matter](https://gohugo.io/methods/page/date/)

See how to further [configure this information](configuration/content/meta) on a site-wide basis.

{{< multiconfig fm=true section=params >}}
LastModifierDisplayName = 'Santa Claus'
LastModifierEmail = 'santa@example.com'
date = 2000-12-24T00:00:00-12:00
{{< /multiconfig >}}
