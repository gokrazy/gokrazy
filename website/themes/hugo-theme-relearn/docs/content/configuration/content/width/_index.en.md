+++
categories = ['howto']
description = 'Changing the content area width'
title = 'Width'
weight = 1
+++

The theme adjusts the content width when you resize your browser.

If you want to change the chosen default width, you can add CSS variables to `layouts/partials/custom-header.html`.

## Changing the Main Area's Maximum Width

The main area has a default maximum width of `80.25rem` for better readability. If you want to change this, you can set a CSS variable

For full width, use a large value like `1000rem`.

````html {title="layouts/partials/custom-header.html"}
<style>
:root {
    --MAIN-WIDTH-MAX: 1000rem;
}
</style>
````
