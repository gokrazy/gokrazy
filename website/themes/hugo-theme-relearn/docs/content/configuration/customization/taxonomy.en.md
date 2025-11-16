+++
categories = ['explanation', 'howto', 'reference']
description = 'How to display custom taxonomies on your pages'
tags = ['taxonomy']
title = 'Taxonomies'
weight = 8
+++

This page explains how to show custom taxonomies on your pages.

For more details, check the official docs on [setting up custom taxonomies](https://gohugo.io/content-management/taxonomies/#configure-taxonomies) and [using them in your content](https://gohugo.io/content-management/taxonomies/#assign-terms-to-content).

## Default Behavior

The Relearn theme automatically shows Hugo's [default taxonomies](https://gohugo.io/content-management/taxonomies/#default-taxonomies) _tags_ and _categories_ out of the box.

- Tags appear at the top of the page in alphabetical order in form of baggage tags.
- Categories appear at the bottom of the page in alphabetical order as a list prefixed with an icon.

Each item links to a page showing all articles with that term.

## Setting Up Custom Taxonomies

To add custom taxonomies, update your `hugo.toml` file. You also have to add the default taxonomies if you want to use them.

{{< multiconfig file=hugo >}}
[taxonomies]
  category = 'categories'
  mycustomtag = 'mycustomtags'
  tag = 'tags'
{{< /multiconfig >}}

## Showing Custom Taxonomies

To display your custom taxonomy terms, add this to your page (usually in `layouts/partials/content-footer.html`):

````go
{{ partial "term-list.html" (dict
  "page" .
  "taxonomy" "mycustomtags"
  "icon" "layer-group"
) }}
````

### Parameter

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **page**              | _&lt;empty&gt;_ | Mandatory reference to the page. |
| **taxonomy**          | _&lt;empty&gt;_ | The plural name of the taxonomy to display as used in your front matter. |
| **class**             | _&lt;empty&gt;_ | Additional CSS classes set on the outermost generated HTML element.<br><br>If set to `tags` you will get the visuals for displaying the _tags_ taxonomy, otherwise it will be a simple list of links as for the _categories_ taxonomy. |
| **style**             | `primary`       | The style scheme used if **class** is `tags`.<br><br>- by severity: `caution`, `important`, `info`, `note`, `tip`, `warning`<br>- by brand color: `primary`, `secondary`, `accent`<br>- by color: `blue`, `cyan`, `green`, `grey`, `magenta`, `orange`, `red`<br>- by special color: `default`, `transparent`, `code`, `link`, `action` |
| **color**             | see notes       | The [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) to be used if **class** is `tags`. If not set, the chosen color depends on the **style**. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching color for the severity<br>- for all other styles: the corresponding color |
| **icon**              | _&lt;empty&gt;_ | An optional [Font Awesome icon name](shortcodes/icon#finding-an-icon) set to the left of the list. |
