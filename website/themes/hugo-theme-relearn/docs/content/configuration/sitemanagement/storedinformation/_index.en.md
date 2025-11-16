+++
categories = ['explanation']
description = "Information on what's stored on the reader's side"
title = 'Stored Information'
weight = 5
+++

The theme will store information in the reader's browser. It is considered to fall under the exception clause in [DIRECTIVE 2002/58/EC OF THE EUROPEAN PARLIAMENT AND OF THE COUNCIL, Art. 5(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02002L0058-20091219#id-8b90d9c9-eb09-44f5-a58d-51d9cb3a50cd).

> This shall not prevent any technical storage or access for the sole purpose of carrying out the transmission of a communication over an electronic communications network, or as strictly necessary in order for the provider of an information society service explicitly requested by the subscriber or user to provide the service.

The theme stores the following information in localstorage or sessionstorage.

- Currently applicable search term to carry over to the following presented pages. This will be used to mark the search term in the page's text.

  This can be turned off by [disabling search](configuration/sidebar/search#configure-search).

- [Selected tab](shortcodes/tabs#behavior-of-the-groupid) of a tab group to apply the selection to other tab groups on the present page and all following presented pages.

  This can not be turned off.

- Visited pages to show a check mark in the menu if the page was previously visited.

  This can be turned off by [disabling the history](configuration/sidebar/headerfooter#history).

- The selected theme variant to carry over to the following presented pages.

  This can be turned off by only having [one theme variant configured](configuration/branding/colors#single-variant).

The theme is not responsible for stored information of third-party-scripts (every library stored in subdirectories of `assets/js/`).
