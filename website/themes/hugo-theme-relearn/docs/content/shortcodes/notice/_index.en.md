+++
categories = ['howto', 'reference']
description = 'Boxes to help you structure your page'
options = ['boxStyle']
title = 'Notice'
+++

The `notice` shortcode shows boxes with configurable color, title and icon.

{{% notice style="primary" title="There may be pirates" icon="skull-crossbones" %}}
It is all about the boxes.
{{% /notice %}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="markdown" %}}

````md
> [!primary] There may be pirates
> It is all about the boxes.
````

{{% /tab %}}
{{% tab title="shortcode" %}}

````go
{{%/* notice style="primary" title="There may be pirates" icon="skull-crossbones" */%}}
It is all about the boxes.
{{%/* /notice */%}}
````

{{% /tab %}}
{{% tab title="shortcode (positional)" %}}

````go
{{%/* notice primary "There may be pirates" "skull-crossbones" */%}}
It is all about the boxes.
{{%/* /notice */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/notice.html" (dict
  "page"  .
  "style" "primary"
  "title" "There may be pirates"
  "icon" "skull-crossbones"
  "content" "It is all about the boxes."
)}}
````

{{% /tab %}}
{{< /tabs >}}

[Markdown callout syntax](https://gohugo.io/render-hooks/blockquotes/#extended-syntax) has limited features as not all of the below parameter are accessible. Nevertheless, it is widely available in other Markdown parsers like [GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) or [Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts#Change+the+title) and therefore is the recommend syntax for generating portable Markdown.

If you want to display a transparent expandable box without any border, you can also use the [`expand` shortcode](/shortcodes/expand).

### Parameter

| Name                  | Position | Default         | Notes       |
|-----------------------|----------|-----------------|-------------|
| **groupid**           |          | _&lt;empty&gt;_ | Arbitrary name of the group the box belongs to.<br><br>Expandable boxes with the same **groupid** sychronize their open state. |
| **style**             | 1        | `default`       | The style scheme used for the box.<br><br>- by severity: `caution`, `important`, `info`, `note`, `tip`, `warning`<br>- by brand color: `primary`, `secondary`, `accent`<br>- by color: `blue`, `cyan`, `green`, `grey`, `magenta`, `orange`, `red`<br>- by special color: `default`, `transparent`, `code`, `link`, `action`<br><br>You can also [define your own styles](#defining-own-styles). |
| **color**             |          | see notes       | The [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) to be used. If not set, the chosen color depends on the **style**. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching color for the severity<br>- for all other styles: the corresponding color<br><br>This is not available using Markdown callout syntax. |
| **title**             | 2        | see notes       | Arbitrary text for the box title. Depending on the **style** there may be a default title. Any given value will overwrite the default.<br><br>- for severity styles: the matching title for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no title for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces) |
| **icon**              | 3        | see notes       | [Font Awesome icon name](shortcodes/icon#finding-an-icon) set to the left of the title. Depending on the **style** there may be a default icon. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching icon for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no icon for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces)<br><br>This is not available using Markdown callout syntax. |
| **expanded**          |          | _&lt;empty&gt;_ | Whether to draw an expander and how the content is displayed.<br><br>- _&lt;empty&gt;_: no expander is drawn and the content is permanently shown<br>- `true`: the expander is drawn and the content is initially shown<br>- `false`: the expander is drawn and the content is initially hidden |
| _**&lt;content&gt;**_ |          | _&lt;empty&gt;_ | Arbitrary text to be displayed in box. |

## Settings

### Defining own Styles

{{% badge style="option" %}}Option{{% /badge %}} Besides the predefined `style` values [from above](#parameter), you are able to define your own.

{{< multiconfig file=hugo section=params >}}
boxStyle = [
	{ identifier = 'magic', i18n = '', title = 'Magic', icon = 'rainbow', color = 'gold' },
	{ identifier = 'new', title = ' ', style = 'info', icon = 'plus-circle' }
]
{{< /multiconfig >}}

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **identifier**        | _&lt;empty&gt;_ | This must match the `style` parameter used in a shortcode. |
| **style**             | _&lt;empty&gt;_ | If you define this optional parameter, this is where default values for **title**, **icon** and **color** are taken from if **style** exists beforehand. You can reference predefined styles as also your own styles. |
| **title**             | _&lt;empty&gt;_ | The default title used. If you have set **style** and don't want any title at all, you have to set this parameter to " ". See the parameter **i18n** if you use multiple languages in your site. |
| **i18n**              | _&lt;empty&gt;_ | If no **title** is given but **i18n** is set, the title will be taken from the translation files by that key. |
| **icon**              | _&lt;empty&gt;_ | The default icon used. If you have set **style** and don't want any icon at all, you have to set this parameter to " ". |
| **color**             | _&lt;empty&gt;_ | The default color used. If you have set **style** and don't want any color at all, you have to set this parameter to " ". |

Below is a [usage example](#user-defined-style).

## Examples

### By Severity Using Markdown Callout Syntax

````md
> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!INFO]
> Information that users <ins>_might_</ins> find interesting.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.
````

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!INFO]
> Information that users <ins>_might_</ins> find interesting.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

### By Brand Colors with Title and Icon Variantion

````go
{{%/* notice style="primary" title="Primary" */%}}
A **primary** disclaimer
{{%/* /notice */%}}

{{%/* notice style="secondary" title="Secondary" */%}}
A **secondary** disclaimer
{{%/* /notice */%}}

{{%/* notice style="accent" icon="stopwatch" */%}}
An **accent** disclaimer
{{%/* /notice */%}}
````

{{% notice style="primary" title="Primary" %}}
A **primary** disclaimer
{{% /notice %}}

{{% notice style="secondary" title="Secondary" %}}
A **secondary** disclaimer
{{% /notice %}}

{{% notice style="accent" icon="stopwatch" %}}
An **accent** disclaimer
{{% /notice %}}

### By Color

````go
{{%/* notice style="blue" title="Blue"*/%}}
A **blue** disclaimer
{{%/* /notice */%}}

{{%/* notice style="cyan" title="Cyan" */%}}
A **cyan** disclaimer
{{%/* /notice */%}}

{{%/* notice style="green" title="Green" */%}}
A **green** disclaimer
{{%/* /notice */%}}

{{%/* notice style="grey" icon="bug" */%}}
A **grey** disclaimer
{{%/* /notice */%}}

{{%/* notice style="magenta" title="Magenta" */%}}
A **magenta** disclaimer
{{%/* /notice */%}}

{{%/* notice style="orange" title="Orange" icon="bug" */%}}
A **orange** disclaimer
{{%/* /notice */%}}

{{%/* notice style="red" title="Red" */%}}
A **red** disclaimer
{{%/* /notice */%}}
````

{{% notice style="blue" title="Blue" %}}
A **blue** disclaimer
{{% /notice %}}

{{% notice style="cyan" title="Cyan" %}}
A **cyan** disclaimer
{{% /notice %}}

{{% notice style="green" title="Green" %}}
A **green** disclaimer
{{% /notice %}}

{{% notice style="grey" icon="bug" %}}
A **grey** disclaimer
{{% /notice %}}

{{% notice style="magenta" title="Magenta" %}}
A **magenta** disclaimer
{{% /notice %}}

{{% notice style="orange" title="Orange" icon="bug" %}}
A **orange** disclaimer
{{% /notice %}}

{{% notice style="red" title="Red" %}}
A **red** disclaimer
{{% /notice %}}

### By Special Color

````go
{{%/* notice style="default" title="Default" icon="skull-crossbones" */%}}
Just some default color.
{{%/* /notice */%}}

{{%/* notice style="transparent" title="Transparent" icon="skull-crossbones" */%}}
No visible borders.
{{%/* /notice */%}}

{{%/* notice style="code" title="Code" icon="skull-crossbones" */%}}
Colored like a code fence.
{{%/* /notice */%}}

{{%/* notice style="link" title="Link" icon="skull-crossbones" */%}}
Style of topbar buttons
{{%/* /notice */%}}

{{%/* notice style="action" title="Action" icon="skull-crossbones" */%}}
Style of action buttons like Mermaid zoom or block code copy-to-clipboard
{{%/* /notice */%}}
````

{{% notice style="default" title="Default" icon="skull-crossbones" %}}
Just some default color.
{{% /notice %}}

{{% notice style="transparent" title="Transparent" icon="skull-crossbones" %}}
No visible borders.
{{% /notice %}}

{{% notice style="code" title="Code" icon="skull-crossbones" %}}
Colored like a code fence.
{{% /notice %}}

{{% notice style="link" title="Link" icon="skull-crossbones" %}}
Style of topbar buttons
{{% /notice %}}

{{% notice style="action" title="Action" icon="skull-crossbones" %}}
Style of action buttons like Mermaid zoom or block code copy-to-clipboard
{{% /notice %}}

### Various Features

#### With User-Defined Color, Font Awesome Brand Icon and Markdown in Title and Content

````go
{{%/* notice color="fuchsia" title="**Hugo** is _awesome_" icon="fa-fw fab fa-hackerrank" */%}}
{{% include "shortcodes/include/INCLUDE_ME.md" %}}
{{%/* /notice */%}}
````

{{% notice color="fuchsia" title="**Hugo** is _awesome_" icon="fa-fw fab fa-hackerrank" %}}
{{% include "shortcodes/include/INCLUDE_ME.md" %}}
{{% /notice %}}

#### Expandable Content Area with `groupid`

If you give multiple expandable boxes the same `groupid`, at most one will be open at any given time. If you open one of the boxes, all other boxes of the same group will close.

````go
{{%/* notice style="green" title="Expand me..." groupid="notice-toggle" expanded="true" */%}}
No need to press you!
{{%/* /notice */%}}

{{%/* notice style="red" title="Expand me..." groupid="notice-toggle" expanded="false" */%}}
Thank you!
{{%/* /notice */%}}
````

{{% notice style="green" title="Expand me..." groupid="notice-toggle" expanded="true" %}}
No need to press you!
{{% /notice %}}

{{% notice style="red" title="Expand me..." groupid="notice-toggle" expanded="false" %}}
Thank you!
{{% /notice %}}

#### No Content or No Title

````go
{{%/* notice style="accent" title="Just a bar" */%}}
{{%/* /notice */%}}

{{%/* notice style="accent" */%}}
Just a box
{{%/* /notice */%}}
````

{{% notice style="accent" title="Just a bar" %}}
{{% /notice %}}

{{% notice style="accent" %}}
Just a box
{{% /notice %}}

#### Various Markdown Callouts

````go
> [!caution] Callouts can have custom titles
> Like this one.

> [!caution] Title-only callout

> [!note]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed

> [!note]+ Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed

> [!info] Can callouts be nested?
> > [!important] Yes!, they can.
> > > [!tip]  You can even use multiple layers of nesting.
````

> [!caution] Callouts can have custom titles
> Like this one.

> [!caution] Title-only callout

> [!note]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed

> [!note]+ Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed

> [!info] Can callouts be nested?
> > [!important] Yes!, they can.
> > > [!tip]  You can even use multiple layers of nesting.

#### Code with Collapsed Colored Borders

````
> [!secondary]
> ```c
> // With colored border in Markdown syntax
> printf("Hello World!");
> ```

{{%/* notice style="red" */%}}
```c
// With colored border in Shortcode syntax
printf("Hello World!");
```
{{%/* /notice */%}}
````

> [!secondary]
> ```c
> // With colored border in Markdown syntax
> printf("Hello World!");
> ```

{{% notice style="red" %}}
```c
// With colored border in Shortcode syntax
printf("Hello World!");
```
{{% /notice %}}

#### User-defined Style

Self-defined styles can be [configured](#defining-own-styles) in your `hugo.toml` and used for every shortcode, that accepts a `style` parameter.

{{< multiconfig file=hugo section=params >}}
boxStyle = [
	{ identifier = 'magic', i18n = '', title = 'Magic', icon = 'rainbow', color = 'gold' },
]
{{< /multiconfig >}}

````md {title="page.md"}
> [!magic]
> It's a kind of...
>
> Maaagic!
````

> [!magic]
> It's a kind of...
>
> Maaagic!
