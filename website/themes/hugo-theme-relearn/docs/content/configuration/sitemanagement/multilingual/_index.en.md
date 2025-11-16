+++
categories = ['howto']
description = 'How to set up a multilingual site'
options = ['disableLanguageSwitchingButton']
title = 'Multilingual'
weight = 2
+++

The Relearn theme works with [Hugo's multilingual mode](https://gohugo.io/content-management/multilingual/).

It supports many languages, including right-to-left languages.

{{% expand "Supported languages" %}}
- Arabic
- Simplified Chinese
- Traditional Chinese
- Czech
- Danish
- Dutch
- English
- Finnish
- French
- German
- Hindi
- Hungarian
- Indonesian
- Italian
- Japanese
- Korean
- Persian
- Polish
- Portuguese
- Romanian
- Russian
- Spanish
- Swahili
- Turkish
- Ukrainian
- Vietnamese
{{% /expand %}}

## Translation by File Name

Here's how to make your site multilingual using [translations by file name](https://gohugo.io/content-management/multilingual/#translation-by-file-name):

1. Set up languages in your `hugo.toml` file:

    {{< multiconfig file=hugo >}}
    defaultContentLanguage = 'en'

    [languages]
      [languages.en]
        weight = 1
        languageName = 'English'
        languageCode = 'en'
        title = 'My Website'

      [languages.pir]
        weight = 2
        languageName = 'Pirrratish'
        languageCode = 'art-x-pir'
        languageDirection = 'rtl'
        title = 'Arrr, my Website'
    {{< /multiconfig >}}

2. Duplicate your content files and add language codes to their file names:

    ````tree
    - content | folder
      - log | folder
        - first-day | folder
          - _index.en.md | fa-fw fab fa-markdown | secondary
          - _index.pir.md | fa-fw fab fa-markdown | secondary
        - second-day | folder
          - index.en.md | fa-fw fab fa-markdown | secondary
          - index.pir.md | fa-fw fab fa-markdown | secondary
        - third-day.en.md | fa-fw fab fa-markdown | secondary
        - third-day.pir.md | fa-fw fab fa-markdown | secondary
        - _index.en.md | fa-fw fab fa-markdown | secondary
        - _index.pir.md | fa-fw fab fa-markdown | secondary
      - _index.en.md | fa-fw fab fa-markdown | secondary
      - _index.pir.md | fa-fw fab fa-markdown | secondary
    - themes | folder
      - hugo-theme-relearn | folder
        - ... | folder
    - hugo.toml | file-alt | accent
    ````

## Translation by Content Directory

The theme also support [translations by content directory](https://gohugo.io/content-management/multilingual/#translation-by-content-directory) which can be configured in a similar way.

1. Set up languages in your `hugo.toml` file:

    {{< multiconfig file=hugo >}}
    defaultContentLanguage = 'en'

    [languages]
      [languages.en]
        weight = 1
        languageName = 'English'
        languageCode = 'en'
        contentDir = 'content/en'
        title = 'My Website'

      [languages.pir]
        weight = 2
        languageName = 'Pirrratish'
        languageCode = 'art-x-pir'
        languageDirection = 'rtl'
        contentDir = 'content/pir'
        title = 'Arrr, my Website'
    {{< /multiconfig >}}

2. Duplicate your content files into separate directories named by their language code:

    ````tree
      - content | folder
        - en | folder
          - log | folder
            - first-day | folder
              - _index.md | fa-fw fab fa-markdown | secondary
            - second-day | folder
              - index.md | fa-fw fab fa-markdown | secondary
            - third-day.md | fa-fw fab fa-markdown | secondary
            - _index.md | fa-fw fab fa-markdown | secondary
          - _index.md | fa-fw fab fa-markdown | secondary
        - pir | folder
          - log | folder
            - first-day | folder
              - _index.md | fa-fw fab fa-markdown | secondary
            - second-day | folder
              - index.md | fa-fw fab fa-markdown | secondary
            - third-day.md | fa-fw fab fa-markdown | secondary
            - _index.md | fa-fw fab fa-markdown | secondary
          - _index.md | fa-fw fab fa-markdown | secondary
      - themes | folder
        - hugo-theme-relearn | folder
          - ... | folder
      - hugo.toml | file-alt | accent
    ````


## Search Settings

Check the [search configuration](configuration/sidebar/search#mixed-language-support) for multilingual options.

## Turn Off Language Switching

{{% badge style="option" %}}Option{{% /badge %}} By default the theme shows a language switcher in the lower part of the menu.

If you want to have more control, where the language switcher is positioned or you want to configure a different icon, see the [chapter on sidebar configuration](configuration/sidebar/menus#defining-sidebar-menus).

To disable the language switcher set `disableLanguageSwitchingButton=true`

{{< multiconfig file=hugo section=params >}}
disableLanguageSwitchingButton = true
{{< /multiconfig >}}
