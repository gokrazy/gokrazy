+++
categories = ['reference']
description = 'All front matter for the Relearn theme'
linkTitle = 'Reference'
title = 'Front Matter Reference'
weight = 5
+++

Every Hugo page must have front matter.

In addition to [Hugo's standard front matter](https://gohugo.io/content-management/front-matter/#fields), the Relearn theme offers extras settings listed here.

Throughout the documentation, theme-specific front matter is marked with a {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} badge.

Add theme front matter directly to the root of your page's front matter. For example:

{{< multiconfig fm=true section=params >}}
math = true
{{< /multiconfig >}}

## Index

{{< taxonomy "frontmatter" "h3" >}}

## All Front Matter

Here's a list of all available front matter with example values.  Default values are described in the [annotated example](#annotated-front-matter) below or in each front matter's documentation.

{{< multiconfig fm=true section=params >}}
{{% include "frontmatter.toml" %}}
{{< /multiconfig >}}

## Annotated Front Matter

````toml {title="toml"}
+++
[params]
{{% include "frontmatter.toml" %}}+++
````
