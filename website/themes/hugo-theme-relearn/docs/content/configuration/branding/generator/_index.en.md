+++
categories = ['tutorial']
description = 'An interactive tool to generate color variant stylesheets'
options = ['themeVariant']
title = 'Stylesheet Generator'
weight = 4
+++

This interactive tool may help you to generate your own color variant stylesheet.

{{% expand "Show usage instructions" %}}
To get started, first select a color variant from the variant selector in the lower left sidebar that fits you best as a starting point.

The graph is interactive and reflects the current colors. You can click on any of the colored boxes to adjust the respective color. The graph **and the page** will update accordingly.

The arrowed lines reflect how colors are inherited through different parts of the theme if the descendant isn't overwritten. If you want to delete a color and let it inherit from its parent, just delete the value from the input field.

To better understand this, select the `neon` variant and modify the different heading colors. There, colors for the headings `h2`, `h3` and `h4` are explicitly set. `h5` is not set and inherits its value from `h4`. `h6` is also not set and inherits its value from `h5`.

Once you've changed a color, the variant selector will show a "My custom variant" entry and your changes are stored in the browser. You can **browse to other pages** and even close the browser **without losing your changes**.

Once you are satisfied, you can download the new variants file and copy it into your site's `assets/css` directory.

{{% badge style="option" %}}Option{{% /badge %}} Afterwards, you have to adjust the `themeVariant` option in your `hugo.toml` to your chosen file name. For example, if your new variants file is named `theme-my-custom-variant.css`, you have to set `themeVariant='my-custom-variant'` to use it.

See the docs for [further configuration options](configuration/branding/colors).
{{% /expand %}}

{{% variantgenerator %}}
