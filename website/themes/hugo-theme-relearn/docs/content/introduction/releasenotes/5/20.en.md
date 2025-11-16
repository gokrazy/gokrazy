+++
title = 'Version 5.20'
type = 'releasenotes'
weight = -20

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.20.0 (2023-08-26) {#5-20-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The theme has updated its Swagger dependency to 5.4.1 for the [`openapi` shortcode](shortcodes/openapi).

  With this comes a change in the light theme variants of `Relearn Bright`, `Relearn Light` and `Zen Light` by switching the syntaxhighlighting inside of openapi to a light scheme. This brings it more in sync with the code style used by the theme variants itself.

  Additionally, the syntaxhighlighting inside of openapi for printing was switched to a light scheme for all theme variants.

  If you dislike this change, you can revert this in your theme variants CSS by adding

	````css
	--OPENAPI-CODE-theme: obsidian;
	--PRINT-OPENAPI-CODE-theme: obsidian;
	````

- {{% badge style="change" %}}Change{{% /badge %}} For consistency reasons, we renamed the CSS variable `--MENU-SECTION-HR-color` to `--MENU-SECTION-SEPARATOR-color`. You don't need to change anything in your custom color stylesheet as the old name will be used as a fallback.

### New

- {{% badge style="new" %}}New{{% /badge %}} The theme variants `Zen Light` and `Zen Dark` now add more contrast between menu, topbar and content by adding thin borders.

  Those borders are now configurable by using the CSS variables `--MAIN-TOPBAR-BORDER-color`, `--MENU-BORDER-color`, `--MENU-TOPBAR-BORDER-color`, `--MENU-TOPBAR-SEPARATOR-color`, `--MENU-HEADER-SEPARATOR-color` and `--MENU-SECTION-ACTIVE-CATEGORY-BORDER-color`.

  For existing variants nothing has changed visually.

- {{% badge style="new" %}}New{{% /badge %}} The default values for the [image effects](authoring/markdown#image-effects) are [now configurable](configuration/customization/imageeffects) for your whole site via `hugo.toml` or for each page through front matter.

- {{% badge style="new" %}}New{{% /badge %}} This release fixes a long-standing bug where Mermaid graphs could not be displayed if they were initially hidden - like in collapsed `expand` or inactive `tabs`.

- {{% badge style="new" %}}New{{% /badge %}} Restored compatibility with Hugo versions lower than {{% badge style="hugo" %}}0.111.0{{% /badge %}} for the [`highlight` shortcode](shortcodes/highlight). This does not change the minimum required Hugo version.
