+++
aliases = '/shortcodes/swagger'
categories = ['howto', 'reference']
description = 'UI for your OpenAPI / Swagger specifications'
frontmatter = ['customOpenapiURL', 'openapi.errorlevel', 'openapi.force']
options = ['customOpenapiURL', 'openapi.errorlevel', 'openapi.force']
title = 'OpenAPI'
+++

The `openapi` shortcode displays your OpenAPI / Swagger specifications using the [Swagger UI](https://github.com/swagger-api/swagger-ui) library.

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{</* openapi src="https://petstore3.openapi.io/api/v3/openapi.json" */>}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/openapi.html" (dict
  "page" .
  "src"  "https://petstore3.openapi.io/api/v3/openapi.json"
)}}
````

{{% /tab %}}
{{< /tabs >}}

If you want to print out (or generate a PDF) from your OpenAPI documentation, don't initiate printing directly from the page because the elements are optimized for interactive usage in a browser.

Instead, open the [print preview](authoring/frontmatter/topbar) in your browser and initiate printing from that page. This page is optimized for reading and expands most of the available sections.

### Parameter

| Name                 | Default          | Notes       |
|----------------------|------------------|-------------|
| **src**              | _&lt;empty&gt;_  | The path to the to the OpenAPI specification resource or URL to be used. Resource paths adhere to [Hugo's logical path](https://gohugo.io/methods/page/path/). |

## Settings

### Enabling Link Warnings

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can use `openapi.errorlevel` to control what should happen if a local OpenAPI specification link can not be resolved to a resource.

If not set or empty, any unresolved link is written as given into the resulting output. If set to `warning` the same happens and an additional warning is printed in the built console. If set to `error` an error message is printed and the build is aborted.

Please note that this can not resolve files inside of your `static` directory. The file must be a resource of the page or the site.

Link warnings are also available for [images & links](authoring/frontmatter/linking#enabling-link-and-image-link-warnings) and the [include](shortcodes/include#enabling-link-warnings) shortcode.

{{< multiconfig section=params >}}
openapi.errorlevel = 'warning'
{{< /multiconfig >}}

### Loading an External Version of the Swagger UI Library

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The theme uses the shipped Swagger UI library by default.

In case you want do use a different version of the Swagger UI library but don't want to override the shipped version, you can set `customOpenapiURL` to the URL of the external Swagger UI library.

{{< multiconfig section=params >}}
customOpenapiURL = 'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js'
{{< /multiconfig >}}

### Force Loading of the Swagger UI Library

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} The Swagger UI library will be loaded if the page contains an `openapi` shortcode or codefence.

You can force loading the Swagger UI library if no shortcode or codefence was used by setting `openapi.force=true`. If a shortcode or codefence was found, the option has no effect. This comes handy in case you are using scripting to render a spec.

{{< multiconfig section=params >}}
openapi.force = true
{{< /multiconfig >}}

### Setting a Specific Swagger UI Theme

The recommended way to configure your Swagger UI theme is to set the default value using the `--OPENAPI-theme` variable in your [color variant stylesheet](configuration/branding/generator). This allows your specs to look pretty when the user switches the color variant.

## Example

### Using Local File

````go
{{</* openapi src="petstore.json" */>}}
````

{{< openapi src="petstore.json" >}}
