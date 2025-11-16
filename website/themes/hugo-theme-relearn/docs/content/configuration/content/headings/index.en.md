+++
categories = ['howto']
description = 'Configuring heading anchors'
options = ['disableAnchorCopy', 'disableAnchorScrolling']
title = 'Headings'
weight = 4
+++

Headings can have anchor links that appear when you hover over them.

You can change what happens when you click the anchor icon in your `hugo.toml` file. By default, all options are turned on. If you turn off all options, no anchor icon will show up when you hover.

## Copy Anchor Links

{{% badge style="option" %}}Option{{% /badge %}} Set `disableAnchorCopy=true` to prevent copying the anchor link when you click the icon.

{{< multiconfig file=hugo section=params >}}
disableAnchorCopy = true
{{< /multiconfig >}}

## Scroll to Heading

{{% badge style="option" %}}Option{{% /badge %}} Set `disableAnchorScrolling=true` to stop the page from scrolling to the heading when you click the anchor icon.

{{< multiconfig file=hugo section=params >}}
disableAnchorScrolling = true
{{< /multiconfig >}}
