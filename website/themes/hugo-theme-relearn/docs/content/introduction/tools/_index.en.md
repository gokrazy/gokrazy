+++
categories = ['howto']
description = 'All about supported 3rd party tools'
title = 'Tool Integration'
weight = 3
+++

## Front Matter CMS

The theme supports the great [VSCode Front Matter CMS extension](https://github.com/estruyf/vscode-front-matter) which provides on-premise CMS capabilties to Hugo.

For that, the theme provides a snippets file so you can use shortcodes from inside the Front Matter CMS.

Currently only English and German is supported.

To use them in your Front Matter CMS, put a reference into your `frontmatter.json` like this

````json {title="frontmatter.json"}
{
  "frontMatter.extends": [
    "./vscode-frontmatter/snippets.en.json"
  ]
}
````
