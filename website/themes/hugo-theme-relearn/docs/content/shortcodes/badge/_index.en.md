+++
categories = ['howto', 'reference']
description = 'Marker badges to display in your text'
title = 'Badge'
+++

The `badge` shortcode displays colorful markers in your text with optional icons.

{{% badge %}}Important{{% /badge %}}
{{% badge style="primary" title="Version" %}}6.6.6{{% /badge %}}
{{% badge style="red" icon="angle-double-up" %}}Captain{{% /badge %}}
{{% badge style="info" %}}New{{% /badge %}}
{{% badge style="hugo" %}}Awesome{{% /badge %}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{%/* badge %}}Important{{% /badge */%}}
{{%/* badge style="primary" title="Version" %}}6.6.6{{% /badge */%}}
{{%/* badge style="red" icon="angle-double-up" %}}Captain{{% /badge */%}}
{{%/* badge style="info" %}}New{{% /badge */%}}
{{%/* badge color="fuchsia" icon="fa-fw fab fa-hackerrank" %}}Awesome{{% /badge */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/badge.html" (dict
    "page"    .
    "content" "Important"
)}}
{{ partial "shortcodes/badge.html" (dict
  "page"  .
  "style" "primary"
  "title" "Version"
  "content" "6.6.6"
)}}
{{ partial "shortcodes/badge.html" (dict
  "page"  .
  "style" "red"
  "icon"  "angle-double-up"
  "content" "Captain"
)}}
{{ partial "shortcodes/badge.html" (dict
  "page"  .
  "style" "info"
  "content" "New"
)}}
{{ partial "shortcodes/badge.html" (dict
  "page"  .
  "color" "fuchsia"
  "icon"  "fab fa-hackerrank"
  "content" "Awesome"
)}}
````

{{% /tab %}}
{{< /tabs >}}

### Parameter

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **style**             | `default`       | The style scheme used for the badge.<br><br>- by severity: `caution`, `important`, `info`, `note`, `tip`, `warning`<br>- by brand color: `primary`, `secondary`, `accent`<br>- by color: `blue`, `cyan`, `green`, `grey`, `magenta`, `orange`, `red`<br>- by special color: `default`, `transparent`, `code`, `link`, `action`<br><br>You can also [define your own styles](shortcodes/notice#defining-own-styles). |
| **color**             | see notes       | The [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) to be used. If not set, the chosen color depends on the **style**. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching color for the severity<br>- for all other styles: the corresponding color |
| **title**             | see notes       | Arbitrary text for the badge title. Depending on the **style** there may be a default title. Any given value will overwrite the default.<br><br>- for severity styles: the matching title for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no title for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces) |
| **icon**              | see notes       | [Font Awesome icon name](shortcodes/icon#finding-an-icon) set to the left of the title. Depending on the **style** there may be a default icon. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching icon for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no icon for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces) |
| _**&lt;content&gt;**_ | _&lt;empty&gt;_ | Arbitrary text for the badge. |

## Examples

### Style

#### By Severity

````go
{{%/* badge style="caution" %}}Magenta{{% /badge */%}}
{{%/* badge style="important" %}}Cyan{{% /badge */%}}
{{%/* badge style="info" %}}Blue{{% /badge */%}}
{{%/* badge style="note" %}}Orange{{% /badge */%}}
{{%/* badge style="tip" %}}Green{{% /badge */%}}
{{%/* badge style="warning" %}}Red{{% /badge */%}}
````

{{% badge style="caution" %}}Magenta{{% /badge %}}
{{% badge style="important" %}}Cyan{{% /badge %}}
{{% badge style="info" %}}Blue{{% /badge %}}
{{% badge style="note" %}}Orange{{% /badge %}}
{{% badge style="tip" %}}Green{{% /badge %}}
{{% badge style="warning" %}}Red{{% /badge %}}

#### By Brand Colors

````go
{{%/* badge style="primary" icon="bullhorn" title="Announcement" %}}Mandatory{{% /badge */%}}
{{%/* badge style="secondary" icon="bullhorn" title="Announcement" %}}Optional{{% /badge */%}}
{{%/* badge style="accent" icon="bullhorn" title="Announcement" %}}Special{{% /badge */%}}
````

{{% badge style="primary" icon="bullhorn" title="Announcement" %}}Mandatory{{% /badge %}}
{{% badge style="secondary" icon="bullhorn" title="Announcement" %}}Optional{{% /badge %}}
{{% badge style="accent" icon="bullhorn" title="Announcement" %}}Special{{% /badge %}}

#### By Color

````go
{{%/* badge style="blue" icon="palette" title="Color" %}}Blue{{% /badge */%}}
{{%/* badge style="cyan" icon="palette" title="Color" %}}Cyan{{% /badge */%}}
{{%/* badge style="green" icon="palette" title="Color" %}}Green{{% /badge */%}}
{{%/* badge style="grey" icon="palette" title="Color" %}}Grey{{% /badge */%}}
{{%/* badge style="magenta" icon="palette" title="Color" %}}Magenta{{% /badge */%}}
{{%/* badge style="orange" icon="palette" title="Color" %}}Orange{{% /badge */%}}
{{%/* badge style="red" icon="palette" title="Color" %}}Red{{% /badge */%}}
````

{{% badge style="blue" icon="palette" title="Color" %}}Blue{{% /badge %}}
{{% badge style="cyan" icon="palette" title="Color" %}}Cyan{{% /badge %}}
{{% badge style="green" icon="palette" title="Color" %}}Green{{% /badge %}}
{{% badge style="grey" icon="palette" title="Color" %}}Grey{{% /badge %}}
{{% badge style="magenta" icon="palette" title="Color" %}}Magenta{{% /badge %}}
{{% badge style="orange" icon="palette" title="Color" %}}Orange{{% /badge %}}
{{% badge style="red" icon="palette" title="Color" %}}Red{{% /badge %}}

#### By Special Color

````go
{{%/* badge style="default" icon="palette" title="Color" %}}Default{{% /badge */%}}
{{%/* badge style="transparent" icon="palette" title="Color" %}}Transparent{{% /badge */%}}
{{%/* badge style="code" icon="palette" title="Color" %}}Code{{% /badge */%}}
{{%/* badge style="link" icon="palette" title="Color" %}}Link{{% /badge */%}}
{{%/* badge style="action" icon="palette" title="Color" %}}Action{{% /badge */%}}
````

{{% badge style="default" icon="palette" title="Color" %}}Default{{% /badge %}}
{{% badge style="transparent" icon="palette" title="Color" %}}Transparent{{% /badge %}}
{{% badge style="code" icon="palette" title="Color" %}}Code{{% /badge %}}
{{% badge style="link" icon="palette" title="Color" %}}Link{{% /badge %}}
{{% badge style="action" icon="palette" title="Color" %}}Action{{% /badge %}}

### Variants

#### Without Icon and Title Text

````go
{{%/* badge %}}6.6.6{{% /badge */%}}
{{%/* badge style="info" icon=" " title=" " %}}Awesome{{% /badge */%}}
{{%/* badge style="red" %}}Captain{{% /badge */%}}
````

{{% badge %}}6.6.6{{% /badge %}}
{{% badge style="info" icon=" " title=" " %}}Awesome{{% /badge %}}
{{% badge style="red" %}}Captain{{% /badge %}}

#### Without Icon

````go
{{%/* badge title="Version" %}}6.6.6{{% /badge */%}}
{{%/* badge style="info" icon=" " %}}Awesome{{% /badge */%}}
{{%/* badge style="red" title="Rank" %}}Captain{{% /badge */%}}
````

{{% badge title="Version" %}}6.6.6{{% /badge %}}
{{% badge style="info" icon=" " %}}Awesome{{% /badge %}}
{{% badge style="red" title="Rank" %}}Captain{{% /badge %}}

#### Without Title Text

````go
{{%/* badge icon="star" %}}6.6.6{{% /badge */%}}
{{%/* badge style="info" title=" " %}}Awesome{{% /badge */%}}
{{%/* badge style="red" icon="angle-double-up" %}}Captain{{% /badge */%}}
````

{{% badge icon="star" %}}6.6.6{{% /badge %}}
{{% badge style="info" title=" " %}}Awesome{{% /badge %}}
{{% badge style="red" icon="angle-double-up" %}}Captain{{% /badge %}}

#### All Set

````go
{{%/* badge icon="star" title="Version" %}}6.6.6{{% /badge */%}}
{{%/* badge style="info" %}}Awesome{{% /badge */%}}
{{%/* badge style="red" icon="angle-double-up" title="Rank" %}}Captain{{% /badge */%}}
````

{{% badge icon="star" title="Version" %}}6.6.6{{% /badge %}}
{{% badge style="info" %}}Awesome{{% /badge %}}
{{% badge style="red" icon="angle-double-up" title="Rank" %}}Captain{{% /badge %}}

#### Override for Severity

````go
{{%/* badge style="info" icon="rocket" title="Feature" %}}Awesome{{% /badge */%}}
````

{{% badge style="info" icon="rocket" title="Feature" %}}Awesome{{% /badge %}}

### Other

#### With User-Defined Color, Font Awesome Brand Icon and Markdown Title and Content

````go
{{%/* badge color="fuchsia" icon="fa-fw fab fa-hackerrank" title="**Font**" %}}**Awesome**{{% /badge */%}}
````

{{% badge color="fuchsia" icon="fa-fw fab fa-hackerrank" title="**Font**" %}}**Awesome**{{% /badge %}}

#### With Icon Content

You can combine the badge with the [`icon` shortcode](shortcodes/icon) to create even more stunning visuals.

In this case you need to declare `{{</* badge */>}}` instead of `{{%/* badge */%}}`. Note, that in this case it is not possible to put markdown in the content.

````go
{{</* badge style="primary" icon="angle-double-up" >}}{{% icon skull-crossbones %}}{{< /badge */>}}  
{{</* badge style="primary" icon="angle-double-up" >}}{{% icon skull-crossbones %}} Pirate{{< /badge */>}}  
{{</* badge style="primary" title="Rank" >}}{{% icon skull-crossbones %}}{{< /badge */>}}  
{{</* badge style="primary" title="Rank" >}}{{% icon skull-crossbones %}} Pirate{{< /badge */>}}  
{{</* badge style="primary" icon="angle-double-up" title="Rank" >}}{{% icon skull-crossbones %}}{{< /badge */>}}  
{{</* badge style="primary" icon="angle-double-up" title="Rank" >}}{{% icon skull-crossbones %}} Pirate{{< /badge */>}}
````

{{< badge style="primary" icon="angle-double-up" >}}{{% icon skull-crossbones %}}{{< /badge >}}  
{{< badge style="primary" icon="angle-double-up" >}}{{% icon skull-crossbones %}} Pirate{{< /badge >}}  
{{< badge style="primary" title="Rank" >}}{{% icon skull-crossbones %}}{{< /badge >}}  
{{< badge style="primary" title="Rank" >}}{{% icon skull-crossbones %}} Pirate{{< /badge >}}  
{{< badge style="primary" icon="angle-double-up" title="Rank" >}}{{% icon skull-crossbones %}}{{< /badge >}}  
{{< badge style="primary" icon="angle-double-up" title="Rank" >}}{{% icon skull-crossbones %}} Pirate{{< /badge >}}

#### Inside of Text

````go
Lorem ipsum dolor sit amet, graecis denique ei vel, at duo primis mandamus. {{%/* badge style="blue" icon="rocket" %}}Awesome{{% /badge */%}} Et legere ocurreret pri, animal tacimates complectitur ad cum. Cu eum inermis inimicus efficiendi. Labore officiis his ex, soluta officiis concludaturque ei qui, vide sensibus vim ad.
````

Lorem ipsum dolor sit amet, graecis denique ei vel, at duo primis mandamus. {{% badge style="blue" icon="rocket" %}}Awesome{{% /badge %}} Et legere ocurreret pri, animal tacimates complectitur ad cum. Cu eum inermis inimicus efficiendi. Labore officiis his ex, soluta officiis concludaturque ei qui, vide sensibus vim ad.
