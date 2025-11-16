+++
categories = ['howto', 'reference']
description = 'Nice icons for your page'
title = 'Icon'
+++

The `icon` shortcode displays icons using the [Font Awesome](https://fontawesome.com) library.

{{% icon heart %}}
{{% icon skull-crossbones blue %}}
{{% icon style="warning" %}}
{{% icon icon="angle-double-up" color="blue" %}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{%/* icon icon="heart" */%}}
{{%/* icon icon="skull-crossbones" style="blue" */%}}
{{%/* icon style="warning" */%}}
{{%/* icon icon="angle-double-up" color="blue" */%}}
````

{{% /tab %}}
{{% tab title="shortcode (positional)" %}}

````go
{{%/* icon heart */%}}
{{%/* icon skull-crossbones blue */%}}
{{%/* icon exclamation-triangle red */%}}
{{%/* icon angle-double-up blue */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/icon.html" (dict
    "page" .
    "icon" "heart"
)}}
{{ partial "shortcodes/icon.html" (dict
    "page" .
    "icon" "skull-crossbones"
    "style" "blue"
)}}
{{ partial "shortcodes/icon.html" (dict
    "page" .
    "style" "warning"
)}}
{{ partial "shortcodes/icon.html" (dict
    "page" .
    "icon" "angle-double-up"
    "color" "blue"
)}}
````

{{% /tab %}}
{{< /tabs >}}

### Parameter

| Name                  | Position | Default         | Notes       |
|-----------------------|----------|-----------------|-------------|
| **icon**              | 1        | _&lt;empty&gt;_ | [Font Awesome icon name](#finding-an-icon) to be displayed. It will be displayed in the text color of its according context. |
| **style**             | 2        | _&lt;empty&gt;_ | The style scheme used for the icon.<br><br>- by severity: `caution`, `important`, `info`, `note`, `tip`, `warning`<br>- by brand color: `primary`, `secondary`, `accent`<br>- by color: `blue`, `cyan`, `green`, `grey`, `magenta`, `orange`, `red`<br>- by special color: `default`, `transparent`, `code`, `link`, `action`<br><br>You can also [define your own styles](shortcodes/notice#defining-own-styles). |
| **color**             |          | _&lt;empty&gt;_ | The [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) to be used. If not set, the chosen color depends on the **style**. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching color for the severity<br>- for all other styles: the corresponding color<br><br> |

### Finding an icon

Browse through the available icons in the [Font Awesome Gallery](https://fontawesome.com/v6/search?m=free). Notice that the **free** filter is enabled, as only the free icons are available by default.

Once on the Font Awesome page for a specific icon, for example the page for the [heart](https://fontawesome.com/v6/icons/heart?s=solid), copy the icon name and paste into the Markdown content.

### Customizing Icons

Font Awesome provides many ways to modify the icon

- Change color (by default the icon will inherit the parent color)
- Increase or decrease size
- Rotate
- Combine with other icons

Check the full documentation on [web fonts with CSS](https://docs.fontawesome.com/web/style/styling) for more.

## Examples

### Standard Usage

````go
Built with {{%/* icon heart */%}} by Relearn and Hugo
````

Built with {{% icon heart %}} by Relearn and Hugo

### With color

````go
- Built with {{%/* icon heart red */%}} by Relearn and Hugo
- Built with {{%/* icon icon="heart" style="red" */%}} by Relearn and Hugo - long form, same as above
- Built with {{%/* icon icon="heart" color="red" */%}} by Relearn and Hugo - this uses the HTML color red instead of the red style
````

- Built with {{% icon heart red %}} by Relearn and Hugo
- Built with {{% icon icon="heart" style="red" %}} by Relearn and Hugo - long form, same as above
- Built with {{% icon icon="heart" color="red" %}} by Relearn and Hugo - this uses the HTML color red instead of the red style

### Advanced HTML Usage

While the shortcode simplifies using standard icons, the icon customization and other advanced features of the Font Awesome library require you to use HTML directly. Paste the `<i>` HTML into markup, and Font Awesome will load the relevant icon.

````html
Built with <i class="fas fa-heart"></i> by Relearn and Hugo
````

Built with <i class="fas fa-heart"></i> by Relearn and Hugo

To use these native HTML elements in your Markdown, add this in your `hugo.toml`:

````toml
[markup.goldmark.renderer]
    unsafe = true
````

### Style

#### By Severity

````go
{{%/* icon style="caution" */%}}
{{%/* icon style="important" */%}}
{{%/* icon style="info" */%}}
{{%/* icon style="note" */%}}
{{%/* icon style="tip" */%}}
{{%/* icon style="warning" */%}}
````

{{% icon style="caution" %}}
{{% icon style="important" %}}
{{% icon style="info" %}}
{{% icon style="note" %}}
{{% icon style="tip" %}}
{{% icon style="warning" %}}

#### By Brand Colors

````go
{{%/* icon style="primary" icon="bullhorn" */%}}
{{%/* icon style="secondary" icon="bullhorn" */%}}
{{%/* icon style="accent" icon="bullhorn" */%}}
````

{{% icon style="primary" icon="bullhorn" %}}
{{% icon style="secondary" icon="bullhorn" %}}
{{% icon style="accent" icon="bullhorn" %}}

#### By Color

````go
{{%/* icon style="blue" icon="palette" */%}}
{{%/* icon style="cyan" icon="palette" */%}}
{{%/* icon style="green" icon="palette" */%}}
{{%/* icon style="grey" icon="palette" */%}}
{{%/* icon style="magenta" icon="palette" */%}}
{{%/* icon style="orange" icon="palette" */%}}
{{%/* icon style="red" icon="palette" */%}}
````

{{% icon style="blue" icon="palette" %}}
{{% icon style="cyan" icon="palette" %}}
{{% icon style="green" icon="palette" %}}
{{% icon style="grey" icon="palette" %}}
{{% icon style="magenta" icon="palette" %}}
{{% icon style="orange" icon="palette" %}}
{{% icon style="red" icon="palette" %}}

#### By Special Color

````go
{{%/* icon style="default" icon="palette" */%}}
{{%/* icon style="transparent" icon="palette" */%}}
{{%/* icon style="code" icon="palette" */%}}
{{%/* icon style="link" icon="palette" */%}}
{{%/* icon style="action" icon="palette" */%}}
````

{{% icon style="default" icon="palette" %}}
{{% icon style="transparent" icon="palette" %}}
{{% icon style="code" icon="palette" %}}
{{% icon style="link" icon="palette" %}}
{{% icon style="action" icon="palette" %}}
