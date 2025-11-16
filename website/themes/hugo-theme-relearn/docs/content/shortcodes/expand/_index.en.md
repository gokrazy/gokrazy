+++
categories = ['howto', 'reference']
description = 'Expandable/collapsible sections of text'
title = 'Expand'
+++

The `expand` shortcode displays an expandable/collapsible section of text.

{{% expand title="Expand me..." %}}Thank you!

That's some text with a footnote[^1]

[^1]: And that's the footnote.

That's some more text with a footnote.[^someid]

[^someid]:
    Anything of interest goes here.

    Blue light glows blue.
{{% /expand %}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="markdown" %}}

````md
> [!transparent]- Expand me...
> Thank you!
````

{{% /tab %}}
{{% tab title="shortcode" %}}

````go
{{%/* expand title="Expand me..." */%}}Thank you!{{%/* /expand */%}}
````

{{% /tab %}}
{{% tab title="shortcode (positional)" %}}

````go
{{%/* expand "Expand me..." */%}}Thank you!{{%/* /expand */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/expand.html" (dict
  "page"  .
  "title" "Expand me..."
  "content" "Thank you!"
)}}
````

{{% /tab %}}
{{< /tabs >}}

[Markdown callout syntax](https://gohugo.io/render-hooks/blockquotes/#extended-syntax) is available in other Markdown parsers like [Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts#Change+the+title) and therefore is the recommend syntax for generating portable Markdown.

The [`notice` shortcode](shortcodes/notice) is also capable of displaying expandable/collapsible sections of text but with additional parameter for color and additional icons.

The theme supports Hugo’s built-in [`details` shortcode](https://gohugo.io/content-management/shortcodes/#details) by mapping the parameter to the theme's `expand` shortcode.

### Parameter

| Name                  | Position | Default          | Notes       |
|-----------------------|----------|------------------|-------------|
| **title**             | 1        | `"Expand me..."` | Arbitrary text to appear next to the expand/collapse icon. |
| **expanded**          | 2        | `false`          | How the content is displayed.<br><br>- `true`: the content is initially shown<br>- `false`: the content is initially hidden |
| _**&lt;content&gt;**_ |          | _&lt;empty&gt;_  | Arbitrary text to be displayed on expand. |

## Examples

### All Defaults

````go
{{%/* expand */%}}Yes, you did it!{{%/* /expand */%}}
````

{{% expand %}}Yes, you did it!{{% /expand %}}

### Initially Expanded

````go
{{%/* expand title="Expand me..." expanded="true" */%}}No need to press you!{{%/* /expand */%}}
````

{{% expand title="Expand me..." expanded="true" %}}No need to press you!{{% /expand %}}

### Arbitrary Text

````go
{{%/* expand title="Show me almost **endless** possibilities" */%}}
You can add standard markdown syntax:

- multiple paragraphs
- bullet point lists
- _emphasized_, **bold** and even **_bold emphasized_** text
- [links](https://example.com)
- etc.

```plaintext
...and even source code
```

> the possibilities are endless (almost - including other shortcodes may or may not work)
{{%/* /expand */%}}
````

{{% expand title="Show me almost **endless** possibilities" %}}
You can add standard markdown syntax:

- multiple paragraphs
- bullet point lists
- _emphasized_, **bold** and even **_bold emphasized_** text
- [links](https://example.com)
- etc.

```plaintext
...and even source code
```

> the possibilities are endless (almost - including other shortcodes may or may not work)
{{% /expand %}}

### Using Hugo's `details` Shortcode

````go
{{%/* details */%}}
...is what it's all about!
{{%/* /details */%}}
````

{{% details %}}
...is what it's all about!
{{% /details %}}
