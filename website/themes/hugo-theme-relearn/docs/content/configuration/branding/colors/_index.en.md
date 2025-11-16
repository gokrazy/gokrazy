+++
categories = ['explanation', 'howto']
description = "Learn how to customize your site's colors"
options = ['themeVariant']
title = 'Colors'
weight = 2
+++

The Relearn theme offers color variants to change your site's appearance. Each color variant contains of a CSS file and optional settings in your `hugo.toml`.

You can use the [shipped variants](#shipped-variants), [customize them](#modifying-variants), or create your own. The [interactive variant generator](configuration/branding/generator) can help you with this.

Once set up in `hugo.toml`, you can switch variants using the selector at the bottom of the menu.

## Shipped Variants

The theme ships with the following set of variants

- Relearn
  - Light: the classic Relearn default, coming with signature green, dark sidebar and light content area
  - Dark: dark variant of Light, coming with signature green, dark sidebar and dark content area
  - Bright: alternative of Light, coming with signature green, green sidebar and light content area
- Zen
  - Light: a more relaxed white/grey variant, coming with blue accents, light sidebar and light content area
  - Dark: dark variant of Light, coming with blue accents, dark sidebar and dark content area
- Experimental
  - Neon: a variant that glows in the dark, gradient sidebar and dark content area
- Retro
  - Learn: the default of the old Learn theme, coming with signature light purple, dark sidebar and light content area
  - Blue: a blue variant of the old Learn theme, coming tinted in blue, dark sidebar and light content area
  - Green: a green variant of the old Learn theme, coming tinted in green, dark sidebar and light content area
  - Red: a red variant of the old Learn theme, coming tinted in red, dark sidebar and light content area

## Changing the Variant

{{% badge style="option" %}}Option{{% /badge %}} Set the `themeVariant` option to change the variant.

The theme offers the recommended [advanced configuration mode](#theme-variant-advanced) that combines the functionality for [multiple variants](#multiple-variants), [OS setting adjustments](#adjust-to-os-settings), and more.

### Simple Setup {#theme-variant}

#### Single Variant

Set `themeVariant` to your theme CSS file name:

{{< multiconfig file=hugo section=params >}}
themeVariant = 'relearn-light'
{{< /multiconfig >}}

Place your theme file in `assets/css` or `themes/hugo-theme-relearn/assets/css`. Name it `theme-*.css`.

In the above example, the path of your theme file must be `assets/css/theme-relearn-light.css` or `themes/hugo-theme-relearn/assets/css/theme-relearn-light.css`.

#### Multiple Variants

To let the reader choose between multiple variants by displaying a variant switcher, set `themeVariant` like this:

{{< multiconfig file=hugo section=params >}}
themeVariant = [ 'relearn-light', 'relearn-dark' ]
{{< /multiconfig >}}

The first variant is the default, and a selector will appear if there's more than one.

If you want to have more control, where the variant switcher is positioned or you want to configure a different icon, see the [chapter on sidebar configuration](configuration/sidebar/menus#defining-sidebar-menus).

> [!note]
> The selected theme variant will be [stored in the reader's browser](configuration/sitemanagement/storedinformation).

#### Adjust to OS Settings

Use the `auto` value to match OS light/dark settings. Usually it makes sense to set it in the first position and make it the default.

{{< multiconfig file=hugo section=params >}}
themeVariant = [ 'auto', 'red' ]
{{< /multiconfig >}}

If you don't configure anything else, the theme will default to use `relearn-light` for light mode and `relearn-dark` for dark mode.

Default is `relearn-light` for light and `relearn-dark` for dark mode. These defaults are overwritten by the first two non-auto options of your `themeVariant` array.

You can override the default with `themeVariantAuto`:

{{< multiconfig file=hugo section=params >}}
themeVariantAuto = [ 'learn', 'neon' ]
{{< /multiconfig >}}

### Advanced {#theme-variant-advanced}

The theme offers an advanced way to configure theme variants and all of the aspects above inside of a single configuration item. This comes with some features previously unsupported.

Like with the [multiple variants](#multiple-variants) option, you are defining your theme variants in an array but now in a table with suboptions.

Again, in this case, the first variant is the default chosen on first view and a variant selector will be shown in the menu footer if the array contains more than one entry.

{{< multiconfig file=hugo section=params >}}
themeVariant = [ 'relearn-light', 'relearn-dark' ]
{{< /multiconfig >}}

you now write it that way:

{{< multiconfig file=hugo section=params >}}
themeVariant = [
  {identifier = 'relearn-light'},
  {identifier = 'relearn-dark'}
]
{{< /multiconfig >}}

The `identifier` option is mandatory and equivalent to the string in the first example. Further options can be configured, see the table below.

#### Parameter

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| identifier            | _&lt;empty&gt;_ | Must correspond to the name of a color variant either in your site's or the theme's directory in the form `assets/css/theme-<IDENTIFIER>.css`. |
| name                  | see notes       | The name to be displayed in the variant selector. If not set, the identifier is used in a human readable form. |
| auto                  | _&lt;empty&gt;_ | If set, the variant is treated as an [auto mode variant](#adjust-to-os-settings). It has the same behavior as the `themeVariantAuto` option. The first entry in the array is the color variant for light mode, the second for dark mode. Defining auto mode variants with the advanced options has the benefit that you can now have multiple auto mode variants instead of just one with the simple options. |

#### Example Configuration

{{< multiconfig file=hugo section=params >}}
themeVariant = [
	{ identifier = 'relearn-auto',  name = 'Relearn Light/Dark', auto = [] },
	{ identifier = 'relearn-light'  },
	{ identifier = 'relearn-dark'   },
	{ identifier = 'relearn-bright' },
	{ identifier = 'zen-auto',      name = 'Zen Light/Dark', auto = [ 'zen-light', 'zen-dark' ] },
	{ identifier = 'zen-light'      },
	{ identifier = 'zen-dark'       },
	{ identifier = 'retro-auto',    name = 'Retro Learn/Neon', auto = [ 'learn', 'neon' ] },
	{ identifier = 'neon'           },
	{ identifier = 'learn'          }
]
{{< /multiconfig >}}

## Advanced Topics

### Modifying Variants

In case you like a shipped variant but only want to tweak some aspects, you have some choices. **Don't edit the file in the theme's directory!** You will lose the ability to later easily upgrade your theme to a newer version.

1. Copy and change

    You can copy the shipped variant file from the theme's `themes/hugo-theme-relearn/assets/css` directory to the site's `assets/css` directory and either store it with the same name or give it a new name. Edit the settings and save the new file. Afterwards, you can use it in your `hugo.toml` by the chosen name.

2. Create and import

    You can create a new variant file in the site's `assets/css` directory and give it a new name. Import the shipped variant, add the settings you want to change and save the new file. Afterwards, you can use it in your `hugo.toml` by the chosen name.

    For example, you want to use the `relearn-light` variant but want to change the syntax highlighting schema to the one used in the `neon` variant. For that, create a new `assets/css/theme-my-branding.css` in your site's directory and add the following lines:

    ````css {title="assets/css/theme-my-branding.css"}
    @import "theme-relearn-light.css";

    :root {
      --CODE-theme: neon; /* name of the chroma stylesheet file */
      --CODE-BLOCK-color: rgba( 226, 228, 229, 1 ); /* fallback color for code text */
      --CODE-BLOCK-BG-color: rgba( 40, 42, 54, 1 ); /* fallback color for code background */
    }
    ````

    Afterwards, put this in your `hugo.toml` to use your new variant:

    {{< multiconfig file=hugo section=params >}}
    themeVariant = 'my-branding'
    {{< /multiconfig >}}

    In comparison to _copy and change_, this has the advantage that you profit from any adjustments to the `relearn-light` variant while keeping your modifications.

### Non-standard Modifications

You may feel tempted to add further modifications besides just setting CSS variables in your custom variant stylesheet.

While this is possible, please note that due to the way the theme uses the variant files, the following will not work

- `@font-face` rules - they need to be moved to `assets/css/fonts.css`, `assets/css/custom.css` or `layouts/partials/custom-header.html`
- rules selecting the `html` element - replace `html` with `:root`


### React to Variant Switches in JavaScript

Once a color variant is fully loaded, either initially or by switching the color variant manually with the variant selector, the custom event `themeVariantLoaded` on the `document` will be dispatched. You can add an event listener and react to changes.

````javascript {title="JavaScript"}
document.addEventListener( 'themeVariantLoaded', function( e ){
  console.log( e.detail.variant ); // `relearn-light`
});
````
