+++
categories = ['howto']
description = 'Configure the topbar'
frontmatter = ['disableBreadcrumb', 'disableNextPrev', 'disableMarkdownButton', 'disableSourceButton', 'disablePrintButton', 'disableToc', 'editURL']
options = ['disableBreadcrumb', 'disableNextPrev', 'disableMarkdownButton', 'disableSourceButton', 'disablePrintButton', 'disableToc', 'editURL']
outputs = ['html', 'rss', 'print', 'markdown', 'source']
title = 'Topbar'
weight = 4
+++

This page is about how to configure the topbar using configuration options. If you want to add further buttons or functionality, [see this section](configuration/customization/topbar).

Your topbar contains the following elements. Some of them are configuarable:

- {{% button style="transparent" icon="bars" %}}{{% /button %}} **sidebar**: opens the sidebar flyout if in mobile layout
- {{% button style="transparent" icon="list-alt" %}}{{% /button %}} **toc**: [opens the table of contents in an overlay](#table-of-contents)
- {{% button style="transparent" icon="empty" %}}{{% /button %}} **breadcrumb**: shows the clickable [breadcrumbs](#breadcrumbs)
- {{% button style="transparent" icon="pen" %}}{{% /button %}} **edit**: browses to the editable page if the `editURL` [parameter is set](#edit-button)
- {{% button style="transparent" icon="code" %}}{{% /button %}} **source**: browses to the [chapters source code](#source-button) if [source support](configuration/sitemanagement/outputformats#source-support) was activated
- {{% button style="transparent" icon="fa-fw fab fa-markdown" %}}{{% /button %}} **markdown**: browses to the [chapters Markdown source](#markdown-button) if [markdown support](configuration/sitemanagement/outputformats#markdown-support) was activated
- {{% button style="transparent" icon="print" %}}{{% /button %}} **print**: browses to the [chapters printable page](#print-button) if [print support](configuration/sitemanagement/outputformats#print-support) was activated
- {{% button style="transparent" icon="chevron-left" %}}{{% /button %}} **prev**: browses to the [previous page](#arrow-navigation) if there is one
- {{% button style="transparent" icon="chevron-right" %}}{{% /button %}} **next**: browses to the [next page](#arrow-navigation) if there is one
- {{% button style="transparent" icon="ellipsis-v" %}}{{% /button %}} **more**: opens the overlay if screen space is limited

## Table of Contents

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Set `disableToc=true` to hide the TOC button on all pages. If the button is hidden, also the keyboard shortcut is disabled. This can be overridden in a page's front matter.

{{< multiconfig >}}
disableToc = true
{{< /multiconfig >}}

## Breadcrumbs

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} Set `disableBreadcrumb=true` to hide the breadcrumb in the topbar.

Further breadcrumbs settings can be found in the [content configuration section](configuration/content/titles).

{{< multiconfig >}}
disableBreadcrumb = true
{{< /multiconfig >}}

## Edit Button

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} If `editURL` is set to a URL, an edit button will be shown in the topbar. If the button is hidden, also the keyboard shortcut is disabled.

The value can contain the macro `${FilePath}` which will be replaced by the file path of your displayed page. If no `${FilePath}` is given in the value, the value is treated as if the `${FilePath}` was appended at the end of the value. This can be overridden in the pages front matter.

{{< multiconfig >}}
editURL = 'https://github.com/McShelby/hugo-theme-relearn/edit/main/docs/content/${FilePath}'
{{< /multiconfig >}}

## Markdown Button

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can hide the Markdown button if the [Markdown output format](configuration/sitemanagement/outputformats/#markdown-support) is active by setting `disableMarkdownButton=true`.

{{< multiconfig >}}
disableMarkdownButton = true
{{< /multiconfig >}}

## Source Button

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can hide the Source button if the [Source output format](configuration/sitemanagement/outputformats/#source-support) is active by setting `disableSourceButton=true`.

{{< multiconfig >}}
disableSourceButton = true
{{< /multiconfig >}}

## Print Button

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can hide the print button if the [print output format](configuration/sitemanagement/outputformats/#print-support) is active by setting `disablePrintButton=true`.

{{< multiconfig >}}
disablePrintButton = true
{{< /multiconfig >}}

## Arrow Navigation

{{% badge style="option" %}}Option{{% /badge %}} {{% badge style="frontmatter" %}}Front Matter{{% /badge %}} You can hide the previous/next buttons by setting `disableNextPrev=true`. If the buttons are hidden, also the keyboard shortcuts are disabled.

{{< multiconfig >}}
disableNextPrev = true
{{< /multiconfig >}}
