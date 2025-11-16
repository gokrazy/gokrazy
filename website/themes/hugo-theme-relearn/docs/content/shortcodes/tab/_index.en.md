+++
categories = ['howto', 'reference']
description = 'Show content in a single tab'
title = 'Tab'
+++

You can use a `tab` shortcode to display a single tab with a title.

{{% tab title="c" %}}
```python
printf("Hello World!");
```
{{% /tab %}}

{{% tab title="Ramblings" color="blue" %}}
Just some **text**.
{{% /tab %}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{%/* tab title="c" */%}}
```c
printf("Hello World!");
```
{{%/* /tab */%}}

{{%/* tab title="Ramblings" color="blue" */%}}
Just some **text**.
{{%/* /tab */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/tab.html" (dict
  "page"  .
  "title" "c"
  "content" ("```c\nprintf(\"Hello World!\")\n```" | .RenderString)
)}}
{{ partial "shortcodes/tab.html" (dict
  "page"  .
  "color" "blue"
  "title" "Ramblings"
  "content" ("Just some **text**" | .RenderString)
)}}
````

{{% /tab %}}
{{< /tabs >}}

If you want multiple tabs grouped together you can wrap your tabs into the [`tabs` shortcode](shortcodes/tabs).

If you want further options when using a single code tab, you can also use the [`highlight` shortcode](shortcodes/highlight).

### Parameter

| Name                  | Default         | Notes       |
|-----------------------|-----------------|-------------|
| **style**             | see notes       | The style scheme used for the tab. If you don't set a style and you display a single code block inside of the tab, its default styling will adapt to that of a `code` block. Otherwise `default` is used.<br><br>- by severity: `caution`, `important`, `info`, `note`, `tip`, `warning`<br>- by brand color: `primary`, `secondary`, `accent`<br>- by color: `blue`, `cyan`, `green`, `grey`, `magenta`, `orange`, `red`<br>- by special color: `default`, `transparent`, `code`, `link`, `action`<br><br>You can also [define your own styles](shortcodes/notice#defining-own-styles). |
| **color**             | see notes       | The [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) to be used. If not set, the chosen color depends on the **style**. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching color for the severity<br>- for all other styles: the corresponding color |
| **title**             | see notes       | Arbitrary title for the tab. Depending on the **style** there may be a default title. Any given value will overwrite the default.<br><br>- for severity styles: the matching title for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no title for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces) |
| **icon**              | see notes       | [Font Awesome icon name](shortcodes/icon#finding-an-icon) set to the left of the title. Depending on the **style** there may be a default icon. Any given value will overwrite the default.<br><br>- for severity styles: a nice matching icon for the severity<br>- for all other styles: _&lt;empty&gt;_<br><br>If you want no icon for a severity style, you have to set this parameter to `" "` (a non empty string filled with spaces) |
| _**&lt;content&gt;**_ | _&lt;empty&gt;_ | Arbitrary text to be displayed in the tab. |

## Examples

### Single Code Block with Collapsed Margins

````go
{{%/* tab title="Code" */%}}
```python
printf("Hello World!");
```
{{%/* /tab */%}}
````

{{% tab title="Code" %}}

```python
printf("Hello World!");
```

{{% /tab %}}

### Mixed Markdown Content

````go
{{%/* tab title="_**Mixed**_" */%}}
A tab can not only contain code but arbitrary text. In this case text **and** code will get a margin.
```python
printf("Hello World!");
```
{{%/* /tab */%}}
````

{{% tab title="_**Mixed**_" %}}

A tab can not only contain code but arbitrary text. In this case text **and** code will get a margin.

```python
printf("Hello World!");
```

{{% /tab %}}

### Understanding `style` and `color` Behavior

The `style` parameter affects how the `color` parameter is applied.

````go
{{</* tabs */>}}
{{%/* tab title="just colored style" style="blue" */%}}
The `style` parameter is set to a color style.

This will set the background to a lighter version of the chosen style color as configured in your theme variant.
{{%/* /tab */%}}
{{%/* tab title="just color" color="blue" */%}}
Only the `color` parameter is set.

This will set the background to a lighter version of the chosen CSS color value.
{{%/* /tab */%}}
{{%/* tab title="default style and color" style="default" color="blue" */%}}
The `style` parameter affects how the `color` parameter is applied.

The `default` style will set the background to your `--MAIN-BG-color` as configured for your theme variant resembling the default style but with different color.
{{%/* /tab */%}}
{{%/* tab title="just severity style" style="info" */%}}
The `style` parameter is set to a severity style.

This will set the background to a lighter version of the chosen style color as configured in your theme variant and also affects the chosen icon.
{{%/* /tab */%}}
{{%/* tab title="severity style and color" style="info" color="blue" */%}}
The `style` parameter affects how the `color` parameter is applied.

This will set the background to a lighter version of the chosen CSS color value and also affects the chosen icon.
{{%/* /tab */%}}
{{</* /tabs */>}}
````

{{< tabs >}}
{{% tab title="just colored style" style="blue" %}}

The `style` parameter is set to a color style.

This will set the background to a lighter version of the chosen style color as configured in your theme variant.

{{% /tab %}}
{{% tab title="just color" color="blue" %}}

Only the `color` parameter is set.

This will set the background to a lighter version of the chosen CSS color value.

{{% /tab %}}
{{% tab title="default style and color" style="default" color="blue" %}}

The `style` parameter affects how the `color` parameter is applied.

The `default` style will set the background to your `--MAIN-BG-color` as configured for your theme variant resembling the default style but with different color.

{{% /tab %}}
{{% tab title="just severity style" style="info" %}}

The `style` parameter is set to a severity style.

This will set the background to a lighter version of the chosen style color as configured in your theme variant and also affects the chosen icon.

{{% /tab %}}
{{% tab title="severity style and color" style="info" color="blue" %}}

The `style` parameter affects how the `color` parameter is applied.

This will set the background to a lighter version of the chosen CSS color value and also affects the chosen icon.

{{% /tab %}}
{{< /tabs >}}
