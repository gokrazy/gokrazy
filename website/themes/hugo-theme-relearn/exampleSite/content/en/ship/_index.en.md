+++
description = 'Overview of the ship'
title = 'The Ship'
type = 'chapter'
weight = 1

[params]
  menuPre = '<i class="fa-fw fas fa-sailboat"></i> '
+++

## Overview


Up in the Upper Decks, our lookout is either spotting treasure or taking an unauthorized nap in the Crow's Nest, while the helmsman tries to convince everyone that yes, that spinning wheel actually does something.

In Midst Ship, the Captain's busy adding another gold tassel to their hat collection, and the crew quarters are hosting the weekly "Who Stole My Last Clean Sock" investigation.

Down in Cargo, well... let's just say what the health inspector doesn't know won't hurt them. Between the mysteriously moving crates and that barrel of pickles that's been fermenting since the last century, it's quite an adventure.

## Map

````mermaid
graph TD
    A[The Purple Pulpo] --> B1[Upper Decks]
    A --> B2[Midst Ship]
    A --> B3[Cargo]
    B1 --> C11[Crow's Nest]
    B1 --> C12[The Helm]
    B2 --> C21[Captain's Cabin]
    B2 --> C22[Crew Quarters]

    click B1 "upper" "View Upper Decks"
    click B2 "midst" "View Midst Ship"
    click B3 "cargo" "View Cargo"
    click C11 "upper/nest" "View Crow's Nest"
    click C12 "upper/helm" "View the Helm"
    click C21 "midst/captain" "View the Captain's Cabin"
    click C22 "midst/crew" "View the Crew Quarters"

    style A fill:mediumpurple,stroke:rebeccapurple,stroke-width:4px
    style B1 fill:mediumvioletred,stroke:purple,stroke-width:4px
    style C11 fill:mediumvioletred,stroke:purple,stroke-width:4px
    style C12 fill:mediumvioletred,stroke:purple,stroke-width:4px
    style B2 fill:dodgerblue,stroke:royalblue,stroke-width:4px
    style C21 fill:dodgerblue,stroke:royalblue,stroke-width:4px
    style C22 fill:dodgerblue,stroke:royalblue,stroke-width:4px
    style B3 fill:darkturquoise,stroke:teal,stroke-width:4px
````
