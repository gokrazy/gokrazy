+++
description = 'A theme for Hugo designed for documentation.'
title = 'Hugo Relearn Theme'
type = 'home'

[[cascade]]
  [cascade.params]
    [cascade.params.build]
      render = 'never'
  [cascade.target]
    path = '/introduction/changelog/*/*/*'
+++
{{% replaceRE "https://mcshelby.github.io/hugo-theme-relearn/" "" %}}
{{< include "README.md" "true" >}}
{{% /replaceRE %}}