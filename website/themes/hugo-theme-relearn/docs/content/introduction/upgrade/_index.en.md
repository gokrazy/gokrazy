+++
categories = ['tutorial']
description = 'How to upgrade your Relearn site'
title = 'Upgrade'
weight = 2
+++

Consider Hugo and the theme one unit. If you upgrade the theme, in many cases, you need also to upgrade Hugo and vice versa.

The [releasenotes of the theme](introduction/releasenotes) mention if a newer version of Hugo is required.

Note, that it is only necessary to upgrade if you are experiencing fixed bugs or want to use new features. It is perfectly fine to stay with arbitrary old versions of Hugo and the theme if everything works for you.

## Semver

Recent releases of the theme follow the [semver standard](https://semver.org/).

## Theme Repo Organization

The `main` branch of the source code repo contains all versions with the development version at the HEAD. This means, pulling from the `main` branch may give you a beta version.

As this is not suitable for production, the repository contains stable tags for each released version in the form of `7.2.1`.

In addition, the repository contains floating tags for

- the latest patch level release of a minor version in the form of `7.2.x`
- the latest minor level release of a major version in the form of `7.x`
- the latest major version in the form of `x`

Choose a tag that best fits your needs.

## Planning the Upgrade

Depending on your previously used version of Hugo and the theme, you might need to upgrade files of your project.

The [releasenotes](introduction/releasenotes) announce theme related modifications and help you identifying spots in your files that require changes.

Also watch the console during build of your project, as it may show further warnings or errors with hints of what's wrong and how to fix it.

Note that these [hints may be removed after a while](https://gohugo.io/troubleshooting/deprecation) by Hugo or the theme. In case you are updating from rather far beyond versions, consider to do the upgrade in steps:

Say, you are using Relearn 4.0.1 and want to upgrade your project to the latest version (say 7.2.1):

- find out the [last theme release of version 4](introduction/changelog/4) (which is 4.2.5) and the [required Hugo version](introduction/releasenotes/4) (at least 0.93.0) and upgrade
- run `hugo server` and fix any errors
- find out the [last theme release of version 5](introduction/changelog/5) (which is 5.27.0) and the [required Hugo version](introduction/releasenotes/5) (at least 0.121.0) and upgrade
- run `hugo server` and fix any errors
- etc. until done

This procedure may lead to more work than updating in one single step, but it will be far easier to make adaptions and can be divided into smaller units of work.

## Upgrade the Theme

Updating the theme depends on the way [how you've installed it](introduction/quickstart#install-the-theme).

Run all following commands from the root of your Hugo project.

### Download as a Zip File

Remove the old version of the theme by removing the `themes/hugo-theme-relearn` directory.

Download the .zip archive of a certain version of the theme and unzip it into the `themes/hugo-theme-relearn` directory

Eg. to upgrade to version 7.2.1 download from [https://github.com/McShelby/hugo-theme-relearn/releases/tag/7.2.1](https://github.com/McShelby/hugo-theme-relearn/releases/tag/7.2.1)

### Use Hugo's Module System

Upgrade the Relearn theme using [Hugo's module system](https://gohugo.io/hugo-modules/use-modules/#update-one-module) to a certain version.

Eg. to upgrade to version 7.2.1

````shell
hugo mod get -u github.com/McShelby/hugo-theme-relearn@7.2.1
````

### Use as a Git Submodule

Upgrade the Relearn theme using [Git](https://git-scm.com/) to a certain version.

Eg. to upgrade to version 7.2.1

````shell
git submodule update --depth 1 themes/hugo-theme-relearn
git -C themes/hugo-theme-relearn fetch --tags --force
git -C themes/hugo-theme-relearn checkout 7.2.1
````
