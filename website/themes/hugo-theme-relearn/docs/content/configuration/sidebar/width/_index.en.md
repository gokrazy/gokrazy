+++
categories = ['howto']
description = 'Changing the width of the sidebar'
title = 'Width'
weight = 1
+++

The theme adjusts the menu width based on browser size.

If you want to change the chosen default width, you can add CSS variables to `layouts/partials/custom-header.html`.

## Changing Menu Width

The menu width changes for different screen sizes:

| Screen Size | Screen Width  | Menu Width |
| ----------- | ------------- | ---------- |
| Small       | < 48rem       | 14.375rem  |
| Medium      | 48rem - 60rem | 14.375rem  |
| Large       | >= 60rem      | 18.75rem   |

You can change the menu width but not the screen width breakpoints.

To adjust the menu width, use these CSS variables. Note that `--MENU-WIDTH-S` is for the mobile menu flyout on small screens.

````html {title="layouts/partials/custom-header.html"}
<style>
:root {
    --MENU-WIDTH-S: 14.375rem;
    --MENU-WIDTH-M: 14.375rem;
    --MENU-WIDTH-L: 18.75rem;
}
</style>
````
