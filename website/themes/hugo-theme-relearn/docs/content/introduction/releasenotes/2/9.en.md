+++
title = 'Version 2.9'
type = 'releasenotes'
weight = -9

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.81.0'
+++

## 2.9.0 (2021-11-19) {#2-9-0}

### Breaking

- {{% badge style="breaking" %}}Breaking{{% /badge %}} This release removes the themes implementation of `ref`/`relref` in favor for Hugo's standard implementation. This is because of inconsistencies with the themes implementation. In advantage, your project becomes standard compliant and exchanging this theme in your project to some other theme will be effortless.

  In a standard compliant form you must not link to the `*.md` file but to its logical name. You'll see, referencing other pages becomes much easier. All three types result in the same reference:

  | Type          | Non-Standard                     | Standard               |
  |---------------|----------------------------------|------------------------|
  | Branch bundle | `configuration/reference/_index.md` | `configuration/reference` |
  | Leaf bundle   | `configuration/reference/index.md`  | `configuration/reference` |
  | Page          | `configuration/reference.md`        | `configuration/reference` |

  If you've linked from a page of one language to a page of another language, conversion is a bit more difficult but [Hugo got you covered](https://gohugo.io/methods/shortcode/relref/#examples) as well.

  Also, the old themes implementation allowed refs to non-existing content. This will cause Hugo's implementation to show the error below and abort the generation. If your project relies on this old behavior, you can [reconfigure the error handling](https://gohugo.io/methods/shortcode/relref/#examples) of Hugo's implementation.

  In the best case your usage of the old implementation is already standard compliant and you don't need to change anything. You'll notice this very easily once you've started `hugo server` after an upgrade and no errors are written to the console.

  You may see errors on the console after the update in the form of

  ````shell
  ERROR 2021/11/19 22:29:10 [en] REF_NOT_FOUND: Ref "configuration/reference/_index.md": "hugo-theme-relearn\docs\content\_index.en.md:19:22": page not found
  ````

  In this case, you must apply one of two options:

  1. Start up a text editor with regular expression support for search and replace. Search for `(ref\s+"[^"]*?)(?:/_index|/index)?(?:\.md)?(#[^"]*?)?"` and replace it by `$1$2"` in all `*.md` files. **This is the recommended choice**.

  2. Copy the old implementation files `theme/hugo-theme-relearn/layouts/shortcode/ref.html` and `theme/hugo-theme-relearn/layouts/shortcode/relref.html` to your own projects `layouts/shortcode/ref.html` and `layouts/shortcode/relref.html` respectively. **This is not recommended** as your project will still rely on non-standard behavior afterwards.
