+++
categories = ['explanation', 'howto']
description = 'How to extend link effects'
options = ['linkEffects']
title = 'Link Effects'
weight = 3
+++

This page shows you, how to configure custom [link effects](authoring/markdown#link-effects) on top of existing ones.

This setting can also [be overridden by your front matter](authoring/linking/linkeffects).

If you don't configure anything in your `hugo.toml`, the link effects default to

## Default Values

{{< multiconfig >}}
linkEffects.download = false
linkEffects.target = false
{{< /multiconfig >}}

## Configuration

{{% badge style="option" %}}Option{{% /badge %}} You can change these settings in your `hugo.toml` and add arbitrary custom effects as boolean values (like `bg-white` in the below snippet).

{{< multiconfig file=hugo section=params >}}
linkEffects.bg-white = true
linkEffects.target = '_blank'
{{< /multiconfig >}}

This would result in

{{< multiconfig >}}
[linkEffects]
linkEffects.bg-white = true
linkEffects.download = false
linkEffects.target = '_blank'
{{< /multiconfig >}}

### Example

With this configuration in effect, the following URL

````md {title="Markdown"}
[Magic in new window](images/magic.gif)
````

would result in

````html {title="HTML"}
<a href="/images/magic.gif?target=_blank" target="_blank" class="bg-white">Magic in new window</a>
````

## Styling Effects

If the resulting effect value is `true` a class with the effect's name will be added.

Styles for default effects are contained in the theme. Add styles for your custom effects to `layouts/partials/content-header.html`.

For the above custom effect you could add the following style:

````html {title="layouts/partials/content-header.html"}
<style>
a.bg-white {
  background-color: white;
}
</style>
````
