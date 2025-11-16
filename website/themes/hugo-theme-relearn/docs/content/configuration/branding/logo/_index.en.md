+++
categories = ['howto']
description = 'Provide your own logo and favicon'
title = 'Logo'
weight = 1
+++

## Change the Favicon

If your favicon is an SVG, PNG, or ICO, just drop your image in your site's `assets/images/` or `static/images/` directory and name it `favicon.svg`, `favicon.png`, or `favicon.ico` respectively.

If you want to adjust your favicon according to your OS settings for light/dark mode, add the image files `assets/images/favicon-light.svg` and `assets/images/favicon-dark.svg` to your site's directory, respectively, corresponding to your file format. In case some of the files are missing, the theme falls back to `favicon.svg` for each missing file. All supplied favicons must be of the same file format.

If no favicon file is found, the theme will look up the alternative filename `logo` in the same location and will repeat the search for the list of supported file types.

If you need to change this default behavior, create a new file `layouts/partials/favicon.html` in your site's directory and write something like this:

````html {title="layouts/partials/favicon.html"}
<link rel="icon" href="/images/favicon.bmp" type="image/bmp">
````

## Change the Logo

By default, only your site title will be shown at the top of the menu. You can [configure this](configuration/sidebar/headerfooter#title), or override the logo partial.

Create a new file in `layouts/partials/logo.html` of your site. Then write any HTML you want. You could use an `img` HTML tag and reference an image, or you could paste an SVG definition!

The size of the logo will adapt automatically.

> [!note]
> In case of SVGs, additional styling may be required.

### Example

Suppose you've stored your logo as `static/images/logo.png` then your `layouts/partials/logo.html` could look something like this:

````html {title="layouts/partials/logo.html"}
<a id="R-logo" href="{{ partial "permalink.gotmpl" (dict "to" .Site.Home) }}">
  <img src="{{"images/logo.png" | relURL}}" alt="brand logo">
</a>
````
