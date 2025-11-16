+++
title = 'Version 5.25'
type = 'releasenotes'
weight = -25

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.112.4'
+++

## 5.25.0 (2024-02-29) {#5-25-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} This release deprecates the [`attachments` shortcode](shortcodes/attachments) in favor of the new the [`resources` shortcode](shortcodes/resources).

  If you are using Hugo below {{% badge style="hugo" %}}0.123.0{{% /badge %}}, you don't need to change anything as the old shortcode still works (but may generate warnings).

  Anyways, users are strongly advised to migrate as the `attachments` shortcode will not receive support anymore. Migration instructions are listed on the [`attachments` shortcode page](shortcodes/attachments#migration).

- {{% badge style="change" %}}Change{{% /badge %}} If you run Hugo with [GitInfo](https://gohugo.io/methods/page/gitinfo/) configured, the default page footer now prints out name, email address and date of the last commit. If you want to turn this off you either have to run Hugo without GitInfo (which is the default) or overwrite the `content-footer.html` partial.
