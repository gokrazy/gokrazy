+++
categories = ['howto']
description = 'How to keep older versions of your site'
options = ['disableVersioningWarning', 'version', 'versionIndexURL', 'versions']
title = 'Versioning'
weight = 3
+++

{{% badge style="option" %}}Option{{% /badge %}} The theme offers a way to version your site. This is useful if you want to keep older versions of your site available while also providing links to the current version. Each site version needs to be created separately and is functional independent of each other.

A version switcher will be displayed at the top of the sidebar if versioning is configured. If the user selects a different version, the theme will navigate to the actual page location but in the selected version. If this page does not exist in the selected version, the 404 page will be displayed.

If you want to have more control, where the version switcher is positioned or you want to configure a different icon, see the [chapter on sidebar configuration](configuration/sidebar/menus#defining-sidebar-menus).

## Example: Versioning an Existing Nonversioned Site

Assume, you have written a documentation for an app. At some point you are a releasing a new major version. This new version requires enhanced documentation while the older documentation must still be available for users of the older app version.

Your site's source files reside in the directory `/home/me/mysite` on your local disc. The current URL of your site (the value set in `baseURL` in your `hugo.toml`) is `https://example.com/`. When done, the URL of the latest version of your site should not change. The archived version of your site should be available at the URL `https://example.com/v1.0/`.

This is your intial config file before versioning:

{{< multiconfig file=/home/me/mysite/hugo >}}
baseURL = 'https://example.com/'
{{< /multiconfig >}}

To setup versioning, you have to do the following steps:

1. Prepare `/home/me/mysite/hugo.toml` of the current version for versioning.
    - add an array of all available `versions`
    - add information, which of these versions is the latest by setting the `isLatest` option on **one** item (here onto `v2.0`) in the `versions` array
    - add information, which of these versions your site actually is, by setting the `version` option (here to `v2.0`)

    After the modifications the config file looks like:

      {{< multiconfig file=/home/me/mysite/hugo >}}
      baseURL = 'https://example.com/'
      params = { version = 'v2.0', versions = [
        { identifier = 'v2.0', title = 'Latest', baseURL = 'https://example.com/', isLatest = true },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://example.com/v1.0/' }
      ]}
      {{< /multiconfig >}}
2. Generate the current site with the changed configuration and deploy the resulting directory to `baseURL` (here to `https://example.com/`)
    - this step has not changed to your previous deploy, so everything should be familiar until here
3. Copy the source files from `/home/me/mysite` into a new directory `/home/me/mysite-1.0` for the archived version
4. Prepare `/home/me/mysite-1.0/hugo.toml` of the archived version for release.
    - change the information, which of the versions your site actually is, by setting the `version` option (here to `v1.0`)
    - change the top level `baseURL` to the URL of version 1.0 (here to `https://example.com/v1.0/`)

    After the modifications the config file looks like:

      {{< multiconfig file=/home/me/mysite-1.0/hugo >}}
      baseURL = 'https://example.com/v1.0/'
      params = { version = 'v1.0', versions = [
        { identifier = 'v2.0', title = 'Latest', baseURL = 'https://example.com/', isLatest = true },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://example.com/v1.0/' }
      ]}
      {{< /multiconfig >}}
5. Generate the archived site with the changed configuration and deploy the resulting directory to `baseURL` (here to `https://example.com/v1.0/`)
6. Now you're ready to edit the content of your current version and proceed with your usual workflow.

**A few things to note here:**

- `version` must be an `identifier` of one of the entries in the `versions` array
- you are not limited with the `baseURL`; these can be absolute or relative to your server root, can also reside in sub-subdirectories or be subdomains
- you can generate your archived versions into a sub-directory of the current version (as with this example)
- if you generate your archived versions into a sub-directory take care in your workflow not to delete older archived versions during build
- the example does not take version control systems into account (like git or subversion) as such a workflow is highly subjective
- both sites are completely independent autonomous Hugo sites; if you want to test this setup locally, you will need two running Hugo servers
- if you want to test this locally, you will need to adept the top level `baseURL` parameter as well as the `baseURL` parameter in the `versions` array to your local setup; best is to have [preconfigured environment configs](https://gohugo.io/configuration/introduction/#configuration-directory) available

## Example: Add a New Version to a Versioned Site

At some point, your version 2 of the app may be deprecated, too, as you've released a new version 3.

The structure from the previous example still applys. Your current version of your site's source files reside in the directory `/home/me/mysite` on your local disc, the archived version in `/home/me/mysite-0.1`. The current URL of your site (the value set in `baseURL` in your `hugo.toml`) is `https://example.com/`. When done, the URL of the latest version of your site should not change. The archived version of your site should be available at the URL `https://example.com/v2.0/`.

You only need to generate the current and the new archived version of your site (`v3.0` and `v2.0`), the former archived version (`v1.0`) doesn't need to be generated again..

1. Prepare `/home/me/mysite/hugo.toml` of the current version for the new archived version.
    - add the new archived version to the array of available `versions`
    - change information, which of these versions is the latest by setting the `isLatest` option on **one** item (here onto `v3.0`) in the `versions` array
    - add information, which of these versions your site actually is, by setting the `version` option (here to `v3.0`)

    After the modifications the config file looks like:

      {{< multiconfig file=/home/me/mysite/hugo >}}
      baseURL = 'https://example.com/'
      params = { version = 'v3.0', versions = [
        { identifier = 'v3.0', title = 'Latest', baseURL = 'https://example.com/', isLatest = true },
        { identifier = 'v2.0', title = 'v2.0', baseURL = 'https://example.com/v.2.0/' },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://example.com/v1.0/' }
      ]}
      {{< /multiconfig >}}
2. Generate the current site with the changed configuration and deploy the resulting directory to `baseURL` (here to `https://example.com/`)
3. Copy the source files from `/home/me/mysite` into a new directory `/home/me/mysite-2.0` for the archived version
4. Prepare `/home/me/mysite-2.0/hugo.toml` of the archived version for release.
    - change the information, which of the versions your site actually is, by setting the `version` option (here to `v2.0`)
    - change the top level`baseURL` to the URL of version 2.0 (here to `https://example.com/v2.0/`)

    After the modifications the config file looks like:

      {{< multiconfig file=/home/me/mysite-2.0/hugo >}}
      baseURL = 'https://example.com/v2.0/'
      params = { version = 'v2.0', versions = [
        { identifier = 'v3.0', title = 'Latest', baseURL = 'https://example.com/', isLatest = true },
        { identifier = 'v2.0', title = 'v2.0', baseURL = 'https://example.com/v.2.0/' },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://example.com/v1.0/' }
      ]}
      {{< /multiconfig >}}
5. Generate the archived site with the changed configuration and deploy the resulting directory to `baseURL` (here to `https://example.com/v2.0/`)
6. Now you're ready to edit the content of your current version and proceed with your usual workflow.

**A few things to note here:**

- you **don't need to regenerate version 1** of your site as long as the version marked with `isLatest=true` hasn't changed its `baseURL` parameter. The old archived versions will access the version index of the latest site using JavaScript to display all currently available versions in the version switcher
- with each new version, you will need another Hugo server instance to run a complete local test

## Example: Multilingual Setup

If you have a multilingual site **and** you have different `baseURL` settings for each language, you need to also configure versioning for each language separately!

To stay with the above example, here's the configuration for your current version:

{{< multiconfig file=/home/me/mysite-2.0/hugo >}}
[languages]
  [languages.en]
    weight = 1
    languageName = 'English'
    languageCode = 'en'
    contentDir = 'content/en'
    title = 'My Website'
    baseURL = 'https://example.com/'

    [languages.en.params]
      version = 'v2.0'
      versions = [
        { identifier = 'v2.0', title = 'Latest', baseURL = 'https://example.com/', isLatest = true },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://example.com/v1.0/' }
      ]

  [languages.pir]
    weight = 2
    languageName = 'Pirrratish'
    languageCode = 'art-x-pir'
    languageDirection = 'rtl'
    contentDir = 'content/pir'
    title = 'Arrr, my Website'
    baseURL = 'https://pir.example.com/'

    [languages.pir.params]
      version = 'v2.0'
      versions = [
        { identifier = 'v2.0', title = 'Latest', baseURL = 'https://pir.example.com/', isLatest = true },
        { identifier = 'v1.0', title = 'v1.0', baseURL = 'https://pir.example.com/v1.0/' }
      ]
{{< /multiconfig >}}

## Hiding the Versioning Warning

{{% badge style="option" %}}Option{{% /badge %}} If visitors navigate to an archived version of your site, they will see a versioning warning at the top of each page.

You can disable it be setting the `disableVersioningWarning` option to `true` in your `hugo.toml`.

{{< multiconfig file=hugo section=params >}}
disableVersioningWarning = true
{{< /multiconfig >}}

## Adjusting the Versioning Warning

### Method 1

You can adjust the text of the versioning warning by overriding the key `Versioning-warning` in your i18n files.

The following parameter are available to be included in the text:

- `pageVersion` - the element of the displayed page's version from your `versions` array
- `pageUrl` - the URL of the displayed page
- `latestVersion` - the element of the version marked with `isLatest` from your `versions` array
- `latestUrl` - the URL of the displayed page mapped to the latest version

### Method 2

You can override `layouts/partials/versioning-waring.html`. This is called once a version conflict was recognized. So the only thing for you to do is writing the message.

The following parameter are available in this partial:

- `page` - the current [Page](https://gohugo.io/methods/page/)
- `pageVersion` - the element of the displayed page's version from your `versions` array
- `pageUrl` - the URL of the displayed page
- `latestVersion` - the element of the version marked with `isLatest` from your `versions` array
- `latestUrl` - the URL of the displayed page mapped to the latest version

## Change URL of the Version Index

{{%badge style="cyan" icon="gears" title=" "%}}Option{{%/badge%}} The default URL for the version index can be changed with the `versionIndexURL` parameter

{{< multiconfig file=hugo section=params >}}
versionIndexURL = 'myversionindex.js'
{{< /multiconfig >}}

{{% notice note %}}
You only need to change these if you have other own content created for those URLs.

Check for duplicate URLs by running `hugo --printPathWarnings`.
{{% /notice %}}
