+++
categories = ['reference']
description = 'All configuration options for the Relearn theme'
title = 'Options Reference'
weight = 6
+++

This page explains how to configure the Relearn theme in your `hugo.toml` file.

In addition to [Hugo's standard options](https://gohugo.io/getting-started/configuration/#all-configuration-settings), the Relearn theme offers extra settings listed here.

Throughout the documentation, theme-specific options are marked with a {{% badge style="option" %}}Option{{% /badge %}} badge.

Add theme options to the `params` section of your `hugo.toml`. For example:

{{< multiconfig file=hugo section=params >}}
math = true
{{< /multiconfig >}}

## Index

{{< taxonomy "options" "h3" >}}

## All Configuration Options

Here's a list of all available options with example values. Default values are described in the [annotated example](#annotated-configuration-options) below in each option's documentation.

{{< multiconfig file=hugo section=params >}}
{{% include "config/_default/params.toml" %}}
{{< /multiconfig >}}

## Annotated Configuration Options

````toml {title="hugo.toml"}
[params]
{{% include "config/_default/params.toml" %}}
````
