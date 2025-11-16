+++
categories = ['explanation']
description = "Your content's directory structure"
title = 'Directory Structure'
weight = 1
+++

In **Hugo**, pages are the core of your site.

The theme generates the navigation menu out of the given directory structure.

Organize your site like [any other Hugo project](https://gohugo.io/content-management/organization/). Typically, you will have a _content_ directory with all your pages.

````tree
- content | folder
  - log | folder
    - first-day | folder
      - _index.md | fa-fw fab fa-markdown | secondary
      - first-sub-page | folder
        - _index.md | fa-fw fab fa-markdown | secondary
        - picture1.png | file-alt | accent
        - plain.txt | file-alt | accent
    - second-day | folder
      - index.md | fa-fw fab fa-markdown | secondary
      - picture1.png | file-alt | accent
      - picture2.png | file-alt | accent
    - third-day.md | fa-fw fab fa-markdown | secondary
    - _index.md | fa-fw fab fa-markdown | secondary
  - _index.md | fa-fw fab fa-markdown | secondary
````

> [!note]
> While you can also go different, `_index.md` (with an underscore) is recommended for each directory, it's your _directory's home page_.
>
> See [Hugo's guide for content ](https://gohugo.io/content-management/) to learn more.
