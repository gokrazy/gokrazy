+++
categories = ['explanation', 'howto']
description = 'Adding Custom Output Formats'
title = 'Output Formats'
weight = 7
+++

Hugo can display your content in different [formats](https://gohugo.io/configuration/output-formats/) like HTML, JSON, Google AMP, etc. To do this, templates must be provided.

The Relearn theme by default comes with templates for [HTML, HTML for print, RSS and Markdown](configuration/sitemanagement/outputformats). If this is not enough, this page describes how you can create your own output formats.

If you instead just want to [customize the layout of an existing output format](configuration/customization/designs), the theme got you covered as well.

## Creating an Output Format

Suppose you want to be able to send your articles as HTML formatted emails. The pages of these format need to be self contained so an email client can display the content without loading any further assets.

Therefore we add a new output format called `email` that outputs HTML and assembles a completely custom HTML document structure.

1. Add the output format to your `hugo.toml`

    {{< multiconfig file=hugo >}}
    [outputFormats]
      [outputFormats.email]
        name= 'email'
        baseName = 'index.email'
        isHTML = true
        mediaType = 'text/html'
        permalinkable = false
        noUgly = true

    [outputs]
      home = ['html', 'rss', 'email']
      section = ['html', 'rss', 'email']
      page = ['html', 'email']
    {{< /multiconfig >}}

2. Create a file `layouts/_default/baseof.email.html`

    ````html {title="layouts/_default/baseof.email.html" hl_Lines="15"}
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{ .Title }}</title>
      <style type="text/css">
        /* add some styles here to make it pretty */
      </style>
      <style type="text/css">
        /* add chroma style for code highlighting */
        {{- "/assets/css/chroma-relearn-light.css" | readFile | safeCSS }}
      </style>
    </head>
    <body>
      <main>
        {{- block "body" . }}{{ end }}
      </main>
    </body>
    </html>
    ````

    The marked `block` construct above will cause the display of the article with a default HTML structure. 	In case you want to keep it really simple, you could replace this line with just `{{ .Content }}`.

3. _Optional_: create a file `layouts/_default/article.email.html`

	In our case, we want to display a disclaimer in front of every article. To do this we have to define the output of an article ourself and rely on the above `block` statement to call our template.

    ````html {title="layouts/_default/article.email.html"}
    <article class="email">
      <blockquote>
        View this article on <a href="http://example.com{{ .RelPermalink }}">our website</a>
      </blockquote>
      {{ partial "article-content.html" . }}
    </article>
    ````

4. _Optional_: create a file `layouts/_default/_markup_/render-image.email.html`

    In our case, we want to convert each image into a base 64 encoded string to display it inline in the email without loading external assets.

    ````html {title="layouts/_default/_markup_/render-image.email.html"}
    {{- $dest_url := urls.Parse .Destination }}
    {{- $dest_path := path.Clean ($dest_url.Path) }}
    {{- $img := .Page.Resources.GetMatch $dest_path }}
    {{- if and (not $img) .Page.File }}
      {{- $path := path.Join .Page.File.Dir $dest_path }}
      {{- $img = resources.Get $path }}
    {{- end }}
    {{- if $img }}
      {{- if (gt (len $img.Content) 1000000000) }}
        {{/* currently resizing does not work for animated gifs :-( */}}
        {{- $img = $img.Resize "600x webp q75" }}
      {{- end }}
      <img src="data:{{ $img.MediaType }};base64,{{ $img.Content | base64Encode }}">
    {{- end }}
    ````

## Partials

### For HTML Output Formats

If you want to keep the general HTML framework and only change specific parts, you can provide these as blocks:

- `layouts/_default/list.<FORMAT>.html`: _Optional_: Controls how sections are displayed
- `layouts/_default/single.<FORMAT>.html`: _Optional_: Controls how a pages are displayed
- `layouts/_default/taxonomy.<FORMAT>.html`: _Optional_: Controls how taxonomy pages are displayed
- `layouts/_default/term.<FORMAT>.html`: _Optional_: Controls how term pages are displayed

For a real-world example, check out the `print` output format implementation

- [`layouts/_default/list.print.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/list.print.html)
- [`layouts/_default/single.print.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/single.print.html)
- [`layouts/_default/taxonomy.print.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/taxonomy.print.html)
- [`layouts/_default/term.print.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/taxonomy.print.html)

### For Non-HTML Output Formats

- `layouts/_default/list.<FORMAT>.<EXTENSION>`: _Mandatory_: Controls how sections are displayed
- `layouts/_default/single.<FORMAT>.<EXTENSION>`: _Mandatory_: Controls how pages are displayed
- `layouts/_default/baseof.<FORMAT>.<EXTENSION>`: _Optional_: Controls how sections and pages are displayed. If not provided, you have to provide your implementation in `list.<FORMAT>.<EXTENSION>` and `single.<FORMAT>.<EXTENSION>`

For a real-world example, check out the `markdown` output format implementation

- [`layouts/_default/baseof.md`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/baseof.markdown.md)
- [`layouts/_default/list.md`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/list.markdown.md)
- [`layouts/_default/single.md`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/single.markdown.md)

## Migration from Relearn 7

Hugo 0.146 or newer required the theme to make changes that may affect you if you are using own output formats. You may have to adjust your templates in `layouts/_default` according to Hugo's migration instructions.

### For HTML Output Formats

- You need to define a block `storeOutputFormat` for your HTML based output format templates and add `{{- .Store.Set \"relearnOutputFormat\" \"<your-output-format-name>\" }}` to it.

### For Non-HTML Output Formats

- Move your files `layouts/<DESIGN>/views` up one level to `layouts/<DESIGN>`

## Migration from Relearn 6

Previous to Relearn 7, HTML output formats did not use the `baseof.html` but now do.

### For HTML Output Formats

- Move your files `layouts/partials/article.<FORMAT>.html` to `layouts/_default/article.<FORMAT>.html`

    The files will most likely require further modifications as they now receive the page as it context (dot `.`) instead of the `.page` and `.content` parameter.

	**Old**:

    ````html {title="layouts/partials/article.&lt;FORMAT&gt;.html" hl_Lines="1-3 10 16"}
    {{- $page := .page }}
    {{- $content := .content }}
    {{- with $page }}
    <article class="default">
      <header class="headline">
        {{- partial "content-header.html" . }}
      </header>
      {{partial "heading-pre.html" .}}{{partial "heading.html" .}}{{partial "heading-post.html" .}}

      {{ $content | safeHTML }}

      <footer class="footline">
        {{- partial "content-footer.html" . }}
      </footer>
    </article>
    {{- end }}
    ````

	**New**:

    ````html {title="layouts/_default/article.&lt;FORMAT&gt;.html" hl_Lines="7"}
    <article class="default">
      <header class="headline">
        {{- partial "content-header.html" . }}
      </header>
      {{partial "heading-pre.html" .}}{{partial "heading.html" .}}{{partial "heading-post.html" .}}

      {{ partial "article-content.html" . }}

      <footer class="footline">
        {{- partial "content-footer.html" . }}
      </footer>
    </article>
    ````

### For Non-HTML Output Formats

- Merge your files `layouts/partials/header.<FORMAT>.html`, `layouts/partials/footer.<FORMAT>.html` to `layouts/_default/baseof.<FORMAT>.html`

	**Old**:

    ````html {title="layouts/partials/header.&lt;FORMAT&gt;.html"}
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{ .Title }}</title>
      <style type="text/css">
        /* add some styles here to make it pretty */
      </style>
      <style type="text/css">
        /* add chroma style for code highlighting */
        {{- "/assets/css/chroma-relearn-light.css" | readFile | safeCSS }}
      </style>
    </head>
    <body>
      <main>
    ````

    ````html {title="layouts/partials/footer.&lt;FORMAT&gt;.html"}
      </main>
    </body>
    </html>
    ````

	**New**:

	The upper part of the file is from your `header.<FORMAT>.html` and the lower part is from your `footer.<FORMAT>.html`.

	The marked line needs to be added, so your output format uses a potential `layouts/_default/article.<FORMAT>.html`

    ````html {title="layouts/_default/baseof.&lt;FORMAT&gt;.html" hl_Lines="15"}
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{ .Title }}</title>
      <style type="text/css">
        /* add some styles here to make it pretty */
      </style>
      <style type="text/css">
        /* add chroma style for code highlighting */
        {{- "/assets/css/chroma-relearn-light.css" | readFile | safeCSS }}
      </style>
    </head>
    <body>
      <main>
        {{- block "body" . }}{{ end }}
      </main>
    </body>
    </html>
    ````
