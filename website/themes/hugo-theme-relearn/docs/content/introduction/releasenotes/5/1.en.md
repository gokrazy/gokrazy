+++
title = 'Version 5.1'
type = 'releasenotes'
weight = -1

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.1.0 (2022-07-15) {#5-1-0}

### Hugo 0.95.0

- {{% badge style="hugo" %}}0.95.0{{% /badge %}} This release requires a newer Hugo version.

### Change

- {{% badge style="change" %}}Change{{% /badge %}} Because the print preview URLs were non deterministic for normal pages in comparison to page bundles, this is now changed. Each print preview is now accessible by adding a `index.print.html` to the default URL.

  You can revert this behavior by overwriting the `print` output format setting in your `hugo.toml`to:

  {{< multiconfig file=hugo >}}
  [outputFormats]
	[outputFormats.print]
	  name= 'print'
	  baseName = 'index'
	  path = '_print'
	  isHTML = true
	  mediaType = 'text/html'
	  permalinkable = false
  {{< /multiconfig >}}
