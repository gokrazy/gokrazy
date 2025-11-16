+++
categories = ['howto']
description = 'Display page meta information with your content'
options = ['dateFormat', 'hideAuthorName', 'hideAuthorEmail', 'hideAuthorDate']
title = 'Page Meta Information'
weight = 3
+++

The theme supports a default display of page meta information in `layouts/partials/content-footer.html`.

The content footer dynamically pulls information based on the availability of [GitInfo metadata](https://gohugo.io/methods/page/gitinfo/). If Git information is present, it uses the author's name, email, and the date from the Git commit details. This ensures that the displayed information is always up-to-date with the latest modifications.

In cases where Git information is not available, the theme falls back to `LastModifierDisplayName`, `LastModifierEmail`, and `Date` [defined in the page's front matter](authoring/meta#footer-information).

## Disable Display of Author's Name

{{% badge style="option" %}}Option{{% /badge %}} You can disable the output of an author's name and its according email address by setting this parameter to `true`.

{{< multiconfig file=hugo section=params >}}
hideAuthorName = true
{{< /multiconfig >}}

## Disable Display of Author's Email

{{% badge style="option" %}}Option{{% /badge %}} The author's email, when displayed, is presented as a clickable mailto link, providing a convenient way for readers to reach out. You can disable the output of an author's email address by setting this parameter to `true`.

{{< multiconfig file=hugo section=params >}}
hideAuthorEmail = true
{{< /multiconfig >}}

## Disable Display of Authoring Date

{{% badge style="option" %}}Option{{% /badge %}} # If the standard content-footer finds an authoring date, you can disable its output by setting this parameter to `true`.

{{< multiconfig file=hugo section=params >}}
hideAuthorDate = true
{{< /multiconfig >}}

## Adjust the Timestamp Format

{{% badge style="option" %}}Option{{% /badge %}} You can overwrite the default date format used when displaying a pages meta information. See [the Hugo docs](https://gohugo.io/functions/time/format/#localization) for possible values.

{{< multiconfig file=hugo section=params >}}
dateFormat = ':date_medium'
{{< /multiconfig >}}
