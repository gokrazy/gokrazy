+++
categories = ['explanation', 'howto']
description = 'Extending page designs'
title = 'Page Designs'
weight = 6
+++

Page designs are used to provide different layouts for a given output format. If you instead want to [provide a new output format](configuration/customization/outputformats), the theme got you covered as well.

A page is displayed by exactly one page design _for each output format_, is represented by [Hugo's reserved `type` front matter](https://gohugo.io/content-management/front-matter/#type) and uses [Hugo's content view mechanism](https://gohugo.io/templates/types/#content-view).

A page design usually consists of

- [one or more content view files](https://gohugo.io/templates/types/#content-view): depending on the output format taken from [the list below](#partials)
- [an optional archetype file](https://gohugo.io/content-management/archetypes/): a template for creating new Markdown files with the correct setting for the `type` front matter and any furhter parameter
- optional CSS styles

> [!warning]
> Don't use Hugo's reserved `type` option in your modifications for other functionality!

## Using a Page Design

Regardless of shipped or custom page designs, you are [using them in the same way](authoring/frontmatter/designs). Either by manually setting the `type` front matter to the value of the page design or by using an archetype during creation of a new page.

If no `type` is set in your front matter or the page design doesn't exist for a given output format, the page is treated as if `type='default'` was set.

The Relearn theme ships with the page designs `home`, `chapter`, and `default` for the HTML output format.

The shipped `print` and `markdown` output formats only display using the `default` page design.

## Creating a Page Design

Suppose you are writing a documentation site for some software. Each time a new release is created, you are adding a new releasenotes page to your site. Those pages should contain a common disclaimer at the top. You neither want to copy the text into each new file nor want you to use a shortcode but create a page design called `releasenotes`.

1. Choose a name (here, `releasenotes`)
2. Create a content view file at `layouts/releasenotes/article.html`

    ````html {title="layouts/releasenotes/article.html" hl_Lines="6-8"}
    <article class="releasenotes">
      <header class="headline">
        {{partial "content-header.html" .}}
      </header>
      {{partial "heading-pre.html" .}}{{partial "heading.html" .}}{{partial "heading-post.html" .}}
      <p class="disclaimer">
        This software release comes without any warranty!
      </p>
      {{partial "article-content.html" .}}
      <footer class="footline">
        {{partial "content-footer.html" .}}
      </footer>
    </article>
    ````

    The marked lines are your customizations, the rest of the file was copied over from the default implementation of [`layouts/_default/article.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/layouts/_default/article.html)

    In this file, you can customize the page structure as needed. For HTML based output formats, typically you'll want to:

    - Set a `class` at the `article` element for custom CSS styles
    - Call `{{ partial "article-content.html" . }}` to show your page content

3. _Optional_: create an archetype file at `archetypes/releasenotes.md`

    ````toml {title="archetypes/releasenotes.md"}
    +++
    title = "{{ replace .Name "-" " " | title }}"
    type = "releasenotes"
    +++

    This is a new releasenote.
    ````

4. _Optional_: add CSS in the file `layouts/partials/custom-header.html`

    ````html {title="layouts/partials/custom-header.html"}
    <style>
    .releasenotes .disclaimer {
      background-color: pink;
      font-size: 72rem;
    }
    </style>
    ````

## Partials

### For any Output Format

These files are common for all output formats.

- `layouts/<DESIGN>/baseof.<FORMAT>`: _Optional_: The top most file you could provide to completely redefine the whole design. No further partials will be called if you don' call them yourself

### For HTML Output Formats

If you want to keep the general HTML framework and only change specific parts, you can provide these files for the page desingn for the HTML output format independently of one another.

- `layouts/<DESIGN>/article.html`: _Optional_: Controls how one page's content and title are displayed
- `layouts/<DESIGN>/body.html`: _Optional_: Determines what to contain in the content area (for example a single page, a list of pages, a tree of sub pages)
- `layouts/<DESIGN>/menu.html`: _Optional_: Defines the sidebar menu layout

For a real-world example, check out the `changelog` page design implementation

- [`docs/layouts/changelog/article.html`](https://github.com/McShelby/hugo-theme-relearn/blob/main/docs/layouts/changelog/article.html)

## Migration from Relearn 7

Hugo 0.146 or newer required some changes to the themes file structure.

- Move your files from `layouts/<DESIGN>/views` up one level to `layouts/<DESIGN>`

## Migration from Relearn 6

Previous to Relearn 7, page designs were defined by a proprietary solution unique to the theme. Depending on your modifications you may have to change some or all of the following to migrate to Relearn 7's page designs.

- In all your `*.md` files, replace the `archetype` front matter with `type`; the value stays the same; don't forget your archetype files if you have some
- Move your files `layouts/partials/archetypes/<DESIGN>/article.html` to `layouts/<DESIGN>/article.html`

    The files will most likely require further modifications as they now receive the page as it context (dot `.`) instead of the `.page` and `.content` parameter.

    **Old**:

    ````html {title="layouts/partials/archetypes/&lt;DESIGN&gt;/article.html" hl_Lines="1-3 10 16"}
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

    ````html {title="layouts/&lt;DESIGN&gt;/article.html" hl_Lines="7"}
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
