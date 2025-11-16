+++
categories = ['howto', 'reference']
description = 'Displays content from other files'
frontmatter = ['include.errorlevel']
options = ['include.errorlevel']
title = 'Include'
+++

The `include` shortcode includes other pages, resources or files from your project.

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{%/* include file="shortcodes/include/INCLUDE_ME.md" */%}}
````

{{% /tab %}}
{{% tab title="shortcode (positional)" %}}

````go
{{%/* include "shortcodes/include/INCLUDE_ME.md" */%}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/include .html" (dict
  "page" .
  "file" "shortcodes/include/INCLUDE_ME.md"
)}}
````

{{% /tab %}}
{{< /tabs >}}

The included files can even contain Markdown and will be taken into account when generating the table of contents.

### Parameter

| Name                 | Position | Default          | Notes       |
|----------------------|----------|------------------|-------------|
| **file**             | 1        | _&lt;empty&gt;_  | The path to the page, resource or file to be included. Page and resource paths adhere to [Hugo's logical path](https://gohugo.io/methods/page/path/). If not found by logical path it falls back to [Hugo's build-in `readFile` function](https://gohugo.io/functions/readfile/) |
| **hidefirstheading** | 2        | `false`          | When `true` and the included file contains headings, the first heading will be hidden. This comes in handy, eg. if you include otherwise standalone Markdown files. |

## Settings

### Enabling Link Warnings

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can use `include.errorlevel` to control what should happen if a local link can not be resolved to a resource.

If not set or empty, any unresolved link is written as given into the resulting output. If set to `warning` the same happens and an additional warning is printed in the built console. If set to `error` an error message is printed and the build is aborted.

Please note that this can not resolve files inside of your `static` directory. The file must be a resource of the page or the site.

Link warnings are also available for [images & links](authoring/frontmatter/linking#enabling-link-and-image-link-warnings) and the [openapi](shortcodes/openapi#enabling-link-warnings) shortcode.

{{< multiconfig section=params >}}
include.errorlevel = 'warning'
{{< /multiconfig >}}

## Examples

### Arbitrary Content

````go
{{%/* include "shortcodes/include/INCLUDE_ME.md" */%}}
````

{{% include "shortcodes/include/INCLUDE_ME.md" %}}
