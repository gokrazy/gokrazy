+++
categories = ['howto']
description = 'Colors of syntax highlighting and 3rd-party modules'
title = 'Module Theming'
weight = 3
+++

## Change Syntax Highlighting

If you want to switch the syntax highlighting theme together with your color variant, first you need to configure your installation [according to Hugo's documentation](https://gohugo.io/content-management/syntax-highlighting/#generate-syntax-highlighter-css) to provide a syntax highlighting stylesheet file.

{{< multiconfig file=hugo >}}
markup.highlight.noClasses=false
{{< /multiconfig >}}

You can use one of the shipped stylesheet files or use Hugo to generate a file for you.

````shell
hugo gen chromastyles --style=monokai > chroma-mycode.css
````

The file must be written to `assets/css/chroma-<NAME>.css`. To use it with your color variant, you have to modify `--CODE-theme: <NAME>` in the color variant stylesheet file.

````css {title="assets/css/theme-my-branding.css"}
@import "theme-relearn-light.css";
:root {
  --CODE-theme: mycode; /* name of the chroma stylesheet file */
}
````

## Change 3rd-Party Libraries Theming

Some of the shipped shortcodes are using 3rd-party libraries. See the individual shortcode documentation on how to change their theming.

- [`mermaid` shortcode](shortcodes/mermaid#setting-a-specific-mermaid-theme)
- [`openapi` shortcode](shortcodes/openapi#setting-a-specific-swagger-ui-theme)
