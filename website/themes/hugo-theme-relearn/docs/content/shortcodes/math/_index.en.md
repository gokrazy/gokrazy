+++
categories = ['howto', 'reference']
description = 'Beautiful math and chemical formulae'
frontmatter = ['customMathJaxURL', 'math', 'math.force', 'mathJaxInitialize']
options = ['customMathJaxURL', 'math', 'math.force', 'mathJaxInitialize']
title = 'Math'
+++

The `math` shortcode renders complex math and chemical formulae using the [MathJax](https://mathjax.org/) library.

{{< math align="center" >}}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
{{< /math >}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="passthrough" %}}

````md
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
````

{{% /tab %}}
{{% tab title="markdown" %}}

````md
```math {align="center"}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
```
````

{{% /tab %}}
{{% tab title="shortcode" %}}

````go
{{</* math align="center" */>}}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
{{</* /math */>}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/math.html" (dict
  "page"    .
  "content" "$$left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$"
  "align"   "center"
)}}
````

{{% /tab %}}
{{< /tabs >}}

You can also use [pure Markdown](authoring/markdown#subscript-and-superscript) for writing simple math expressions.

Passthrough syntax is only available by [further configuration](#passthrough-configuration) and has limited features as it does not provide any of the below parameter. Nevertheless, it is widely available in other Markdown parsers like GitHub and therefore is the recommend syntax for generating portable Markdown.

### Parameter

| Name                  | Default          | Notes       |
|-----------------------|------------------|-------------|
| **align**             | `center`         | The vertical alignment.<br><br>Allowed values are `left`, `center` or `right`. |
| _**&lt;content&gt;**_ | _&lt;empty&gt;_  | Your formulae. |

## Settings

### Providing Initialization Options for the MathJax Library

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The MathJax library is configured with default settings for initialization.

You can overwrite the settings by providing a JSON object in `mathJaxInitialize`. See [MathJax's documentation](https://docs.mathjax.org/en/latest/options/index.html) for all allowed settings.

Keep in mind that initialization settings of your pages front matter overwrite all settings of your configuration options.

{{< multiconfig section=params >}}
mathJaxInitialize = '{ "chtml": { "displayAlign": "left" }, { "tex": { "inlineMath": [["\(", "\)"], ["@", "@"]], displayMath: [["\[", "\]"], ["@@", "@@"]] }, "options": { "enableMenu": false }'
{{< /multiconfig >}}

### Loading an External Version of the MathJax Library

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The theme uses the shipped MathJax library by default.

In case you want do use a different version of the MathJax library but don't want to override the shipped version, you can set `customMathJaxURL` to the URL of the external MathJax library.

{{< multiconfig section=params >}}
customMathJaxURL = 'https://unpkg.com/mathjax/es5/tex-mml-chtml.js'
{{< /multiconfig >}}

### Force Loading of the MathJax Library

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The MathJax library will be loaded if the page contains a `math` shortcode, Markdown codefence or the partial is called from your templates.

You can force loading the MathJax library if you are using passthrough syntax by setting `math=true`. If a shortcode, Markdown codefence or partial was called, the option has no effect. This must be set in case you are using the [passthrough configuration](#passthrough-configuration) to render math.

Instead of `math=true` you can also use the alias `math.force=true`.

{{< multiconfig section=params >}}
math = true
{{< /multiconfig >}}

### Passthrough Configuration

You can use your math without enclosing it in a shortcode or Markdown codefence by using a [passthrough configuration](https://gohugo.io/content-management/mathematics/#step-1)

{{< multiconfig file=hugo >}}
[markup]
  [markup.goldmark]
    [markup.goldmark.extensions]
      [markup.goldmark.extensions.passthrough]
        enable = true
        [markup.goldmark.extensions.passthrough.delimiters]
          inline = [['\(', '\)'], ['$',  '$']]
          block  = [['\[', '\]'], ['$$', '$$']]
{{< /multiconfig >}}

In this case you have to [force load](#force-loading-of-the-mathjax-library) the MathJax library either in your `hugo.toml` or in your page's front matter as the theme doesn't know if math is used.

[See the example](#passthrough-block-math) on how a passthrough configurations makes using math really easy.

## Examples

### Passthrough Block Math

With [passthrough configuration](#passthrough-configuration) enabled you can just drop your math without enclosing it by shortcodes or Markdown codefences but no other [parameters](#parameter) are available.

In this case you have to [force load](#force-loading-of-the-mathjax-library) the MathJax library by setting `math=true` either in your `hugo.toml` or in your page's front matter.

In passthrough default configuration, block math is generated if you use two consecutive `$$` as a delimiter around your formulae.

````md
$$\left|
\begin{array}{cc}
a & b \\
c & d
\end{array}\right|$$
````

$$\left|
\begin{array}{cc}
a & b \\
c & d
\end{array}\right|$$

### Passthrough Inline Math

The same usage restrictions as of the [previous example](#passthrough-block-math) apply here as well.

In passthrough default configuration, inline math is generated if you use a single `$` as a delimiter around your formulae.

````md
Euclid already knew, $\sqrt{2}$ is irrational.
````

Euclid already knew, $\sqrt{2}$ is irrational.

### Markdown Codefence Block Math with Right Alignment

If you are using Markdown codefences, more [parameter](#parameter) are available. Your formulae still needs to be enclosed by `$` or `$$` as delimiters respectively.


````md
```math {align="right"}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
```
````

````math {align="right"}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
````

### Shortcode Block Math with Right Alignment

You can also use shortcode syntax. Your formulae still needs to be enclosed by `$` or `$$` as delimiters respectively.

````md
{{</* math align="right" */>}}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
{{</* /math */>}}
````

{{< math align="right" >}}
$$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
{{< /math >}}

### Chemical Formulae

The MathJax library can also be used for chemical formulae.

````md
$$\ce{Hg^2+ ->[I-] HgI2 ->[I-] [Hg^{II}I4]^2-}$$
`````

$$\ce{Hg^2+ ->[I-] HgI2 ->[I-] [Hg^{II}I4]^2-}$$
