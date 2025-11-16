+++
categories = ['howto']
description = 'Configure all things menus'
frontmatter = ['alwaysopen', 'collapsibleMenu', 'linkTitle', 'menuPageRef', 'menuPost', 'menuPre', 'menuUrl', 'ordersectionsby', 'sidebarfootermenus', 'sidebarheadermenus', 'sidebarmenus']
options = ['alwaysopen', 'collapsibleMenu', 'disableShortcutsTitle', 'ordersectionsby', 'sidebarfootermenus', 'sidebarheadermenus', 'sidebarmenus']
title = 'Menus'
weight = 4
+++

The theme can build menu trees from [the structure of your page files](authoring/structure) or from [Hugo's build in menu feature](https://gohugo.io/content-management/menus/).

---

- {{% badge style="option" %}}Option{{% /badge %}} Configuration options in your `hugo.toml` apply to all menus.

- {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} In case of page structure menus, individual configuration is done via a page's front matter.

- {{% badge style="hugomenu" %}}Menu{{% /badge %}}. In case of Hugo menus, individual configuration is done via a menu entry's configuration.

---

## Expand State of Submenus

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can change how submenus appear with `alwaysopen`.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} For Hugo menus, you have to set `params.alwaysopen` instead.

If `alwaysopen=false` for any given entry, its children will not be shown in the menu as long as it is not necessary for the sake of navigation.

The theme generates the expand state based on the following rules:

- all parent entries of the active page including their [visible](authoring/meta#hidden) siblings are shown regardless of any settings
- immediate child entries of the active entry are shown regardless of any settings
- if not overridden, all other first level entries behave like they would have been given `alwaysopen=false`
- if not overridden, all other entries of levels besides the first behave like they would have been given `alwaysopen=true`
- all [visible](authoring/meta#hidden) entries show their immediate child entries if `alwaysopen=true`; this proceeds recursively
- all remaining entries are not shown

{{< multiconfig section=params >}}
alwaysopen = false
{{< /multiconfig >}}

## Expander for Submenus

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Set `collapsibleMenu=true` to show submenus as collapsible trees with a clickable expander.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} For Hugo menus, you have to set `params.collapsibleMenu=true` instead.

{{< multiconfig section=params >}}
collapsibleMenu = true
{{< /multiconfig >}}

> [!WARNING]
> Using this option may cause degraded build performance by slowing down your build process.
>
> This is usually the case for menus with many entries and happens for page menus as well as for Hugo menus.
>
> We've seen builds taking 2 minutes with 1000+ pages, and over 30 minutes with 5000+ pages when using a page menu.
>
> This happens because each new page affects all other pages, leading to exponentially longer build times.

## Ordering Menu Entries

### By Hugo's Default Sort Order

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} {{% badge style="hugomenu" %}}Menu{{% /badge %}} Hugo provides a [simple way](https://gohugo.io/quick-reference/glossary/#default-sort-order) to handle order of your entries taking into account the `weight`, `date` and `linkTitle` front matter .

{{% badge style="hugomenu" %}}Menu{{% /badge %}} Hugo menus can only be sorted by weight.

{{< multiconfig >}}
weight = 5
{{< /multiconfig >}}

### By Other

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Use `ordersectionsby` to sort by other aspects if Hugo's default sort order does not match your needs. See the [children shortcode](shortcodes/children#parameter) for a complete list.

{{< multiconfig section=params >}}
ordersectionsby = 'linktitle'
{{< /multiconfig >}}

## Title for Menu Entries

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} A page's `linkTitle` or `title` front matter will be used for naming a menu entry of a page menu, in that order if both are defined. Using `linkTitle` helps to shorten the text for menu entries if the page’s title is too descriptive.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} A menu entry's `title` or `name` will be used for naming a menu entry of a Hugo menu, in that order if both are defined.

For example for a page named `install/linux.md`

{{< multiconfig fm=true >}}
title = 'Install on Linux'
linkTitle = 'Linux'
{{< /multiconfig >}}

## Icons for Menu Entries

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} For page menus, add a `menuPre` to insert any HTML code before the menu label. You can also set `menuPost` to insert HTML code after the menu label.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} For Hugo menus, add a `pre` to insert any HTML code before the menu label. You can also set `post` to insert HTML code after the menu label.

If `pageRef` is set for the menu entry and no `pre` or `post` was configured, `menuPre` and `menuPost` of the referenced page will be taken.

The example below uses the GitHub icon for an entry of a page menu.

{{< multiconfig fm=true >}}
title = 'GitHub Repo'
[params]
  menuPre = '<i class="fab fa-github"></i> '
{{< /multiconfig >}}

## Disable Menu Entries

You may want to structure your entries in a hierarchical way but don't want to generate clickable parent entries? The theme got you covered.

### For Page Menus

To stay with the [initial example](authoring/structure): Suppose you want `log/first-day` appear in the sidebar but don't want to generate a page for it. So the entry in the sidebar should not be clickable but should be expandable.

For this, open `content/log/first-day/_index.md` and add the following front matter

{{< multiconfig fm=true >}}
[build]
  render = 'never'
{{< /multiconfig >}}

### For Hugo Menus

Just don't give your parent menu entry configuration a `url` or `pageRef`. See the [next section](#title-for-arbitrary-menus) for a special case.

If you want to learn how to configure different Hugo menus for each language, [see the official docs](https://gohugo.io/content-management/multilingual/#menus).

The following example will not generate clickable menu entries for the `Parent 1` and `Parent 2` menu entries.

{{< multiconfig fm=true >}}
[[menu.shortcuts]]
  name = 'Parent 1'
  weight = 1

[[menu.shortcuts]]
  parent = 'Parent 1'
  name = 'Child 1'
  url = 'https://example.com/1'

[[menu.shortcuts]]
  name = 'Parent 2'
  weight = 2

[[menu.shortcuts]]
  parent = 'Parent 2'
  name = 'Child 2'
  url = 'https://example.com/2'
{{< /multiconfig >}}

## Predefined Shortcuts Menu

By default, the theme supports one additional Hugo menu below the page menu in the sidebar named `shortcuts`. You only need to configure it in your `hugo.toml` to appear in your sidebar. For example:

{{< multiconfig fm=true >}}
[[menu.shortcuts]]
  name = 'Example Entry'
  weight = 1
  url = 'https://example.com'
{{< /multiconfig >}}

## Title for the Predefined Shortcuts Menu

{{% badge style="option" %}}Option{{% /badge %}} By default, the predefined shortcut menu has a the title _More_ (in the English translation) displayed above it.

You can disable this title with `disableShortcutsTitle=true`.

{{< multiconfig file=hugo section=params >}}
disableShortcutsTitle = true
{{< /multiconfig >}}

To change the title, override your translation file.

````toml {title="i18n/en.toml"}
[shortcuts-menuTitle]
other = "Other Great Stuff"
````

## Title for Arbitrary Menus

Each menu may have an optional title above its tree. This must be activated for each [menu by setting `disableMenuTitle=false` for each sidebar menu configuration](#defining-sidebar-menus).

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} For page menus, set the `menuTitle` front matter for the root page of the menu. For example in the home page for the default sidebar menu. If no `menuTitle` was set, the title will be taken from your translation files by the key `<identifier>-menuTitle`, where `<identifier>` is the identifier of your sidebar menu configuration.

{{% badge style="hugomenu" %}}Menu{{% /badge %}} For Hugo menus, the title will be taken from your translation files by the key `<identifier>-menuTitle`, where `<identifier>` is the identifier of your sidebar menu configuration.

If you don't want to fiddle around with your translation files, you also have the possibility to let the title be taken from the menu definition. For that, define a nested menu that **only has one top-level entry** without `url` or `pageRef`.

In this case, the `title` or `name` is taken for the menu heading.

If you want to learn how to configure different Hugo menus for each language, [see here](https://gohugo.io/content-management/multilingual/#menus).

{{< multiconfig fm=true >}}
[[menu.addendum]]
  identifier = 'addendum-top'
  name = 'A Menu Title for the Whole Menu'

[[menu.addendum]]
  parent = 'addendum-top'
  name = 'A Menu Entry Title for Child 1'
  url = 'https://example.com/1'
  weight = 1

[[menu.addendum]]
  parent = 'addendum-top'
  name = 'A Menu Entry Title for Child 2'
  url = 'https://example.com/2'
  weight = 2
{{< /multiconfig >}}

## Defining Sidebar Menus

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Menus are defined for individual areas of the sidebar:

- `sidebarheadermenus`: the non-scrolling area below the search box
- `sidebarmenus`: the scrolling area below the search box
- `sidebarfootermenus`: the area at the bottom of the sidebar

As these options are arrays, you can define as many menus, as you like in each area. Each menu is displayed as a distinct block in their area. You can configure titles for each menu and dividers between multiple menus.

If you don't set these options in your `hugo.toml`, the theme defaults as follows:

- `sidebarheadermenus`:
  - a divider to separate from the logo (depending on the color configuration of the theme variant) if any of the following is configured
  - a home button if [configured](configuration/sidebar/headerfooter#home-button-configuration), see notes below
  - a divider
  - the version switcher if versioning is [configured](configuration/sitemanagement/versioning)
  - a divider to separate from the `sidebarmenus` (depending on the color configuration of the theme variant)
- `sidebarmenus`:
  - the main page menu based on your [content structure](authoring/structure)
  - the `shortcuts` menu including the title if [configured](#predefined-shortcuts-menu), see notes below
- `sidebarfootermenus`:
  - a divider to separate from the `sidebarmenus` if any of the following is configured
  - the language switcher if multilingual is [configured](configuration/sitemanagement/multilingual#turn-off-language-switching)
  - the variant switcher if multiple variants are [configured](configuration/branding/colors/#multiple-variants)
  - the history clearer if you [configured](configuration/sidebar/headerfooter#history) to mark visited pages


This comes down to the following pseudo default configuration.

{{< multiconfig section=params >}}
sidebarheadermenus = [
  { type = 'divider' },
  { type = 'menu', identifier = 'homelinks', disableTitle = true },
  { type = 'divider' },
  { type = 'custom', identifier = 'headercontrols', elements = [ { type = 'versionswitcher' } ] },
  { type = 'divider' }
]

sidebarmenus = [
  { type = 'page', identifier = 'main' },
  { type = 'menu', identifier = 'shortcuts', disableTitle = false }
]

sidebarfootermenus = [
  { type = 'divider' },
  { type = 'custom', identifier = 'footercontrols', elements = [ { type = 'historyclearer' }, { type = 'variantswitcher' }, { type = 'languageswitcher' } ] }
]
{{< /multiconfig >}}

Notes:

- multiple consecutive dividers are removed by the theme if no other content is in between them
- if you redefine the `homelinks` like displayed above, you have to define a Hugo menu to replicate the implicit default configuration
- for the `shortcuts` if the implicit default configuration is active, the value for `disableTitle` will be determined by your [configuration for `disableShortcutsTitle`](#predefined-shortcuts-menu).

### Page Menu

The page menu generates a menu tree out of your directory structure. You can give it a starting page from where the tree is generated down. If no starting page is given, the home page is used.

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **type**              | _&lt;empty&gt;_ | `page`, required |
| **identifier**        | _&lt;empty&gt;_ | Optional with no special meaning besides for error messages |
| **main**              | `true`          | Whether to add additional spacing and larger text to the menu |
| **disableTitle**      | `true`          | Whether to print a title above the menu |
| **pageRef**           | `/`             | The path of the page to start the menu tree |

### Hugo Menu

The Hugo menu generates a menu tree out of a Hugo menu definition with the same `identifier`.

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **type**              | _&lt;empty&gt;_ | `menu`, required  |
| **identifier**        | _&lt;empty&gt;_ | The identifier of the menu definition in your `hugo.toml` |
| **main**              | `false`         | Whether to add additional spacing and larger text to the menu |
| **disableTitle**      | `false`         | Whether to print a title above the menu; for the predefined `shortcuts` menu, accounts to the setting of `disableShortcutsTitle` |

### Custom

The custom menu allows you to define arbitrary HTML snippets wrapped inside of a `li` element. There is no title available to print above these menus.

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **type**              | _&lt;empty&gt;_ | `custom`, required |
| **identifier**        | _&lt;empty&gt;_ | Optional with no special meaning besides for error messages |
| **main**              | `false`         | Whether to add additional spacing and larger text to the menu |
| **elements**          | _&lt;empty&gt;_ | The list of snippets, contained in `layouts/partials/sidebar/element`, to be displayed. See below.

### Custom Element

An HTML element snippet of a custom menu has its own parameter. Self-defined snippets have further parameters that are passed to your snippet partial when called. Your snippets must be stored in `layouts/partials/sidebar/element` and the name of the snippet partial needs to be `<TYPE>.html` where `<TYPE>` is the type of the element.

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **type**              | _&lt;empty&gt;_ | The theme ships with the following snippets:<br><br>- `languageswitcher`: will display the language switcher<br>- `variantswitcher`: will display the variant switcher<br>- `versionswitcher`: will display the version switcher<br>- `historyclearer`: will display a button to clear the history of visited links |
| **icon**              | see notes       | [Font Awesome icon name](shortcodes/icon#finding-an-icon) set to the left of the list entry. Depending on the **type** there is a default icon. Any given value will overwrite the default. |

### Divider

A horizontal ruler

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **type**              | _&lt;empty&gt;_ | `divider` |
| **identifier**        | _&lt;empty&gt;_ | Optional with no special meaning besides for error messages |

### Example

The following example

- configures the language switcher and history clearer into the menu header
- changes the icon of the language switcher to {{< icon icon="globe" >}}
- only shows the the page menu in the main sidebar section
- keeps the menu footer empty

> [!note]
> If you want to reconfigure the sidebar menus, you have to copy over everything from the [default configuration](#defining-sidebar-menus) you want to keep as reconfiguration will reset all sidebar menus.

{{< multiconfig section=params >}}
sidebarheadermenus = [
	{ type = 'custom', elements = [
		{ type = 'languageswitcher', icon= 'globe' },
		{ type = 'historyclearer' }
	]},
	{ type = 'divider' },
]
sidebarmenus = [
	{ type = 'page' }
]
sidebarfootermenus = []
{{< /multiconfig >}}

## Redefining Sidebar Menus for Certain Pages

Suppose you are building a site that contains a topmost `log` and `ship` section.

When the user is on one of the log pages he should only see a page menu containing all log pages, while on one of the ship pages she should only see a page menu containing all sub pages of the ship section.

For both sections, the default `shortcuts` Hugo menu should be displayed as if [defaults menus](#defining-sidebar-menus) were used.

Directory structure:

````tree
- content | folder
  - log | folder
    - first-day.md | fa-fw fab fa-markdown | secondary
    - second-day.md | fa-fw fab fa-markdown | secondary
    - third-day.md | fa-fw fab fa-markdown | secondary
    - _index.md | fa-fw fab fa-markdown | secondary
  - ship | folder
    - cargo.md | fa-fw fab fa-markdown | secondary
    - midst.md | fa-fw fab fa-markdown | secondary
    - upper.md | fa-fw fab fa-markdown | secondary
    - _index.md | fa-fw fab fa-markdown | secondary
  - _index.md | fa-fw fab fa-markdown | secondary
````

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Using [Hugo's cascade feature](https://gohugo.io/content-management/front-matter/#cascade), we can redefine the menus once in `log/_index.md` and `ship/_index.md` setting `sidebarmenus` so they will be used in all children pages.

Setting the `sidebarmenus` Front Matter will overwrite all default menus. If you want to display the `shortcuts` Hugo menu as well like in this example, you have to declare it with the Front Matter as given in the [default options](#defining-sidebar-menus).

{{< multiconfig fm=true file="log/_index.md">}}
title = "Captain's Log"
[[cascade]]
  [cascade.params]
    sidebarmenus = [
      { type = 'page', identifier = 'log', pageRef = '/log' },
      { type = 'menu', identifier = 'shortcuts' },
    ]
{{< /multiconfig >}}

{{< multiconfig fm=true file="ship/_index.md">}}
title = 'The Ship'
[[cascade]]
  [cascade.params]
    sidebarmenus = [
      { type = 'page', identifier = 'ship', pageRef = '/ship' },
      { type = 'menu', identifier = 'shortcuts' },
    ]
{{< /multiconfig >}}

## Displaying Arbitrary Links in a Page Menu

You may have the need to add arbitrary links at some point in your menu that should redirect to other pages in your site structure. These are called crosslinks.

Assume the following structure

````tree
- content | folder
  - log | folder
    - first-day.md | fa-fw fab fa-markdown | secondary
    - second-day.md | fa-fw fab fa-markdown | secondary
    - third-day.md | fa-fw fab fa-markdown | secondary
    - _index.md | fa-fw fab fa-markdown | secondary
  - burning-sail-incident.md | fa-fw fab fa-markdown | secondary
  - kraken-incident.md | fa-fw fab fa-markdown | secondary
  - _index.md | fa-fw fab fa-markdown | secondary
````

You now want to add a top level menu entry that points to `third-day` as separate `crows-nest-incident`.

For that create a new page with the following front matter

{{< multiconfig fm=true file="content/crows-nest-incident.md" >}}
title = "The Crow's Nest Incident"
[params]
  menuPageRef = '/log/third-day'
{{< /multiconfig >}}

{{% badge style="frontmatter" %}}Front Matter{{% /badge %}} If you want to link to an external page instead, you can use `menuUrl` instead of `menuPageRef`.

Pages defining a crosslink are never part of the arrow navigation and are skipped instead.

So with the above example and alphabetical sorting of the menu entries, pressing {{% button style="transparent" icon="chevron-left" %}}{{% /button %}} on `kraken-incident` page will skip the newly added `crows-nest-incident` and instead will load `burning-sail-incident`.

Having sub pages below a page that has `menuUrl` or `menuPageRef` set in their front matter is undefined.

## Displaying Pages Exclusively in a Hugo Menu

Sometimes you want to hide pages from the page menu but instead want to show them in a Hugo menu. For that you have two choices

1. Create a [headless branch bundle](https://gohugo.io/content-management/page-bundles/#headless-bundle), `_index.md` in its own folder with the below front matter. The branch bundle will **not** be contained in the sitemap.

    {{< multiconfig fm=true file="content/showcase/_index.en.md" >}}
    title = 'Showcase'
    [build]
      render = 'always'
      list = 'never'
      publishResources = true
    {{< /multiconfig >}}

2. Or, put a child page _inside_ a headless branch bundle with the following front matter in the bundle. This causes the child but not the branch bundle to be contained in the sitemap.

    {{< multiconfig fm=true file="content/more/_index.en.md" >}}
    [build]
      render = 'never'
      list = 'never'
      publishResources = false
    {{< /multiconfig >}}

    The child page can be any type of content.

    {{< multiconfig fm=true file="content/more/credits_index.en.md" >}}
    title = 'Credits'
    {{< /multiconfig >}}
