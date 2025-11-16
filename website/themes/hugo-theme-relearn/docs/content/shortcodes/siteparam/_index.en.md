+++
categories = ['howto', 'reference']
description = 'Get value of site params'
title = 'SiteParam'
+++

The `siteparam` shortcode prints values of site-wide params contained in your `hugo.toml`.

## Usage

To print params from a page's front matter and falling back to the site options, use Hugo's built-in [`param` shortcode](https://gohugo.io/shortcodes/param/).

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{%/* siteparam name="editURL" */%}}
````

{{% /tab %}}
{{% tab title="shortcode (positional)" %}}

````go
{{%/* siteparam "editURL" */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/siteparam.html" (dict
  "page" .
  "name" "editURL"
)}}
````

{{% /tab %}}
{{< /tabs >}}

### Parameter

| Name                 | Position | Default          | Notes       |
|----------------------|----------|------------------|-------------|
| **name**             | 1        | _&lt;empty&gt;_  | The name of the site param to be displayed. |

## Examples

### `editURL`

```go
`editURL` value: {{%/* siteparam name="editURL" */%}}
```

`editURL` value: {{% siteparam name="editURL" %}}

### Nested Parameter with Markdown and HTML Formatting

To use formatted parameter, add this in your `hugo.toml`:

{{< multiconfig file=hugo >}}
[markup.goldmark.renderer]
  unsafe = true
{{< /multiconfig >}}

Now values containing Markdown will be formatted correctly.

{{< multiconfig file=hugo section=params >}}
[siteparam.test]
  text = 'A **nested** parameter <b>with</b> formatting'
{{< /multiconfig >}}

```go
Formatted parameter: {{%/* siteparam name="siteparam.test.text" */%}}
```

Formatted parameter: {{% siteparam name="siteparam.test.text" %}}
