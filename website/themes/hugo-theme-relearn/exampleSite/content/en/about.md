+++
description = 'About this Website'
title = 'About'
weight = 3

[params]
  menuPre = '<i class="fa-fw fas fa-info-circle"></i> '
+++

## Face it

This is an example site for the [Relearn theme](https://mcshelby.github.io/hugo-theme-relearn/pir/index.html) of the [Hugo](https://gohugo.io) static site generator.

It displays content about the fictional ship {{% badge style="primary" icon="anchor" %}}The Purple Pulpo{{% /badge %}} in English and a crude Piratish accent. Don't take it too serious.

The goal with this site is to showcase a minimal example with as less configuration as possible. It is meant to be a starting point for your own website. The configuration files are documented to help you understand the reason behind certain settings.

## Run it

The source code for this website is contained in the [Relearn repository](https://github.com/McShelby/hugo-theme-relearn/tree/main/exampleSite). After the [installation of Hugo](https://gohugo.io/installation/) you can build the site locally from inside the `exampleSite` directory with

````bash
hugo server
````

Then you can access the site by navigating to `http://localhost:1313` in your browser.

For a detailed installation guide, see the [Relearn documentation](https://mcshelby.github.io/hugo-theme-relearn/introduction/quickstart/index.html).

## Modify it

While minimal in configuration, this showcase contains an auto translation into the Piratish language. This required some additional files and directories, totally unnecessary for a simple site. You can delete them if you use this site as a starting template. Namely these are:

- `content/pir/`
- `i18n/`
- `layouts/partials/shortcodes/piratify.html`
- `layouts/partials/toc.html`
- `layouts/shortcodes/piratify.html`

You will also have to add this to the `hugo.toml` to deactivate the translation:

````toml {title="hugo.toml"}
disableLanguages = ['pir']
````

**or** remove all references to the Piratish language.