+++
title = 'Version 5.0'
type = 'releasenotes'
weight = 0

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.93.0'
+++

## 5.0.0 (2022-07-05) {#5-0-0}

### Breaking

- {{% badge style="breaking" %}}Breaking{{% /badge %}} The theme changed how JavaScript and CSS dependencies are loaded to provide a better performance. In case you've added own JavaScript code that depends on the themes jQuery implementation, you have to put it into a separate `*.js` file (if not already) and add the `defer` keyword to the `script` element. Eg.

  ````html
  <script defer src="myscript.js"></script>
  ````

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The way [archetypes](authoring/frontmatter/designs) are used to generate output has changed. The new systems allows you, to redefine existing archetypes or even generate your own ones.

  Your existing markdown files will still work like before and therefore you don't need to change anything after the upgrade. Nevertheless, it is recommended to adapt your existing markdown files to the new way as follows:

  - for your home page, add the front matter parameter `archetype = "home"` and remove the leading heading

  - for all files containing the deprecated front matter parameter `chapter = true`, replace it with `archetype = "chapter"` and remove the leading headings

- {{% badge style="change" %}}Change{{% /badge %}} The front matter options `pre` / `post` were renamed to `menuPre` / `menuPost`. The old options will still be used if the new options aren't set. Therefore you don't need to change anything after the upgrade.

### New

- {{% badge style="new" %}}New{{% /badge %}} Adding new partials `heading-pre.html` / `heading-post.html` and according front matter options `headingPre` / `headingPost` to modify the way your page`s main heading gets styled.

- {{% badge style="new" %}}New{{% /badge %}} The new shortcode `math` is available to add beautiful math and chemical formulae. See the [documentation](shortcodes/math) for available features. This feature will not work with Internet Explorer 11.
