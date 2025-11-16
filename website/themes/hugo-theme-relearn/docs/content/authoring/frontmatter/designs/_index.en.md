+++
categories = ['howto']
description = 'How to vary layouts by using page designs'
title = 'Page Designs'
weight = 1
+++

Page designs are used to provide different layouts for your pages.

A page is displayed by exactly one page design and is represented by [Hugo's reserved `type` front matter](https://gohugo.io/content-management/front-matter/#type).

The Relearn theme ships with the page designs `home`, `chapter`, and `default` for the HTML output format but you can [define further custom page designs](configuration/customization/designs).

## Using a Page Design

Regardless of shipped or custom page design, you are using them in the same way.

- If you have an [archetype file](https://gohugo.io/content-management/archetypes/), you can just do

    ````shell
	hugo new --kind chapter log/_index.md
    ````

- If you are creating your Markdown files manually, you can achieve the same by just setting `type='chapter'` in the front matter to make your page displayed with the `chapter` page design.

    ````toml {title="log/_index.md"}
    +++
    title = "Captain's Log"
    type = "chapter"
    +++
    ````

If no `type` is set in your front matter or the page design doesn't exist for a given output format, the page is treated as if `type='default'` was set.

## Predefined Designs for the HTML Output Format

### Home {#archetypes-home}

A **Home** page is the starting page of your project. It's best to have only one page of this kind in your project.

To create a home page, run the following command

````shell
hugo new --kind home _index.md
````

![Home page](pages-home.png?width=60pc)

### Chapter {#archetypes-chapter}

A **Chapter** displays a page meant to be used as introduction for a set of child pages.

Commonly, it contains a title front matter and a short description in the content.

To create a chapter page, run the following command

````shell
hugo new --kind chapter log/_index.md
````

If a numerical `weight` front matter is set, it will be used to generate the subtitle of the chapter page. Set the number to a consecutive value starting at 1 for each new chapter on the same directory level.

![Chapter page](pages-chapter.png?width=60pc)

### Default {#archetypes-default}

A **Default** page is any other content page.

To create a default page, run either one of the following commands

````shell
hugo new log/first-day/_index.md
````

or

````shell
hugo new log/second-day/index.md
````

or

````shell
hugo new log/third-day.md
````

![Default page](pages-default.png?width=60pc)
