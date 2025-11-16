+++
title = 'Version 5.5'
type = 'releasenotes'
weight = -5

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.5.0 (2022-11-06) {#5-5-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} The way images are processed has changed. Now images are lazy loaded by default which speeds up page load on slow networks and/or big pages and also the print preview.

  For that the JavaScript code to handle the [lightbox and image effects](authoring/markdown#image-effects) on the client side was removed in favour for static generation of those effects on the server.

  If you have used HTML directly in your Markdown files, this now has the downside that it doesn't respect the effect query parameter anymore. In this case you have to migrate all your HTML `img` URLs manually to the respective HTML attributes.

  | Old                                                    | New                                                             |
  |--------------------------------------------------------|-----------------------------------------------------------------|
  | `<img src="pic.png?width=20vw&classes=shadow,border">` | `<img src="pic.png" style="width:20vw;" class="shadow border">` |

