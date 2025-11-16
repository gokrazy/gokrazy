+++
categories = ['explanation', 'howto']
description = 'How to extend image effects'
options = ['imageEffects']
title = 'Image Effects'
weight = 4
+++

This page shows you, how to configure custom [image effects](authoring/markdown#image-effects) on top of existing ones.

This setting can also [be overridden by your front matter](authoring/linking/imageeffects).

If you don't configure anything in your `hugo.toml`, the image effects default to

## Default Values

{{< multiconfig >}}
imageEffects.border = false
imageEffects.dataurl = false
imageEffects.inlinecontent = false
imageEffects.lazy = true
imageEffects.lightbox = true
imageEffects.shadow = false
{{< /multiconfig >}}

## Configuration

{{% badge style="option" %}}Option{{% /badge %}} You can change these settings in your `hugo.toml` and add arbitrary custom effects as boolean values (like `bg-white` in the below snippet).

{{< multiconfig file=hugo section=params >}}
imageEffects.bg-white = true
imageEffects.border = true
imageEffects.lazy = false
{{< /multiconfig >}}

This would result in

{{< multiconfig >}}
imageEffects.bg-white = true
imageEffects.border = true
imageEffects.dataurl = false
imageEffects.inlinecontent = false
imageEffects.lazy = false
imageEffects.lightbox = true
imageEffects.shadow = false
{{< /multiconfig >}}

### Example

With this configuration in effect, the following URL

````md {title="Markdown"}
![Minion](https://octodex.github.com/images/minion.png)
````

would result in

````html {title="HTML"}
<img src="https://octodex.github.com/images/minion.png" loading="lazy" alt="Minion" class="bg-white border lightbox">
````

## Styling Effects

If the resulting effect value is `true` a class with the effect's name will be added.

Styles for default effects are contained in the theme. Add styles for your custom effects to `layouts/partials/content-header.html`.

For the above custom effect you could add the following style:

````html {title="layouts/partials/content-header.html"}
<style>
img.bg-white {
  background-color: white;
}
</style>
````
