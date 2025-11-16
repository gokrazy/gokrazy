+++
categories = ['explanation']
description = 'Modifying partials to your needs'
title = 'Partials'
weight = 1
+++

## Usable Partials

You can call other partials from `themes/hugo-relearn-themes/` besides those in `themes/hugo-relearn-themes/layouts/partials/_relearn`. However, using partials not mentioned as customizable below might make future updates more challenging.

## Customizable Partials

The Relearn theme allows you to customize various parts of the theme by overriding partials. This makes the theme highly configurable.

A good rule to follow: The less code a partial contains, the easier it will be to update the theme in the future.

Here's a list of partials you can safely override:

- `layouts/partials/content.html`: The main content of a page. Override this to display additonal page metadata.

- `layouts/partials/content-header.html`: The header above the title. By default, it shows tags, but you can change this.

- `layouts/partials/content-footer.html`: The footer below the content. By default, it shows author info, modification dates, and categories. You can customize this.

- `layouts/partials/custom-header.html`: For adding custom CSS. Remember to include the `style` HTML tag.

- `layouts/partials/custom-footer.html`: For adding custom JavaScript. Remember to include the `script` HTML tag.

- `layouts/partials/favicon.html`: The favicon. You should definitely customize this.

- `layouts/partials/heading.html`: the page's title headings

- `layouts/partials/heading-pre.html`: Add content before the page's title headings. Remember to consider the `headingPre` front matter.

- `layouts/partials/heading-post.html`: Add content after the page's title headings. Remember to consider the `headingPost` front matter.

- `layouts/partials/logo.html`: The logo in the top left corner. You should customize this.

- `layouts/partials/menu-pre.html`: Add content before menu items. Remember to consider the `menuPre` front matter.

- `layouts/partials/menu-post.html`: Add content after menu items. Remember to consider the `menuPost` front matter.

- `layouts/partials/menu-footer.html`: The footer of the left menu.

You can override other partials from `themes/hugo-relearn-themes/`, but be careful as this might make future updates more difficult.
