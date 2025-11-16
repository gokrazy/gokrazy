+++
description = "A theme fer Cap'n Hugo designed fer documentat'n."
title = "Cap'n Hugo Relearrrn Theme"
type = 'home'

[[cascade]]
  [cascade.params]
    [cascade.params.build]
      render = 'never'
  [cascade.target]
    path = '/introduction/changelog/*/*/*'

[[cascade]]
  [cascade.params]
    urlIgnoreCheck = [ '.*' ]
+++
{{< piratify true >}}