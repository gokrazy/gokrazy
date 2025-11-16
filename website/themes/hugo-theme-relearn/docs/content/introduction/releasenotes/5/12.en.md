+++
title = 'Version 5.12'
type = 'releasenotes'
weight = -12

[params]
  disableToc = false
  hidden = true
  minHugoVersion = '0.95.0'
+++

## 5.12.0 (2023-05-04) {#5-12-0}

### Change

- {{% badge style="change" %}}Change{{% /badge %}} In the effort to comply with WCAG standards, the implementation of the collapsible menu was changed (again). While Internet Explorer 11 has issues in displaying it, the functionality still works.

### New

- {{% badge style="new" %}}New{{% /badge %}} Support for the great [VSCode Front Matter CMS extension](https://github.com/estruyf/vscode-front-matter) which provides on-premise CMS capabilties to Hugo.

  The theme provides Front Matter CMS snippets for its shortcodes. Currently only English and German is supported. Put a reference into your `frontmatter.json` like this

  ````json {title="frontmatter.json"}
  {
	...
	"frontMatter.extends": [
		"./vscode-frontmatter/snippets.en.json"
	]
	...
  }
  ````

- {{% badge style="new" %}}New{{% /badge %}} Support for languages that are written right to left (like Arabic) is now complete and extended to the menu, the top navigation bar and print. You can experience this in the [pirate translation](/?lang=pir). This feature is not available in Internet Explorer 11.

- {{% badge style="new" %}}New{{% /badge %}} The scrollbars are now colored according to their variant color scheme to better fit into the visuals.
