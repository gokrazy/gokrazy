+++
categories = ['explanation', 'howto']
description = 'What to know as a maintainer'
title = 'Maintaining'
+++

## Semver

This project tries to follow the [semver policy](https://semver.org/) - although not followed 100% in the past.

Usually an entry of {{% badge style="breaking" %}}Breaking{{% /badge %}} on the [What's new](introduction/releasenotes) page causes a new major release number.

All other entries on the [What's new](introduction/releasenotes) page will increase the minor release number.

Releases resulting in a new major or minor number are called main release.

Releases containing bugfixes only, are only increasing the patch release number. Those releases don't result in announcements on the [What's new](introduction/releasenotes) page.

Entries on the [What's new](introduction/releasenotes) page are checked and enforced during the `version-release` GitHub Action.

## Managing Issues

Issues are categorized and managed by assigning [labels](#labels) to it.

Once working on an issue, assign it to a fitting maintainer.

When done, close the ticket. Once an issue is closed, it needs to be assigned to next release milestone.

A once released ticket is not allowed to be reopened and rereleased in a different milestone. This would cause the changelog to be changed even for the milestone the issue was previously released in. Instead write a new ticket.

## Managing Pull Requests

If a PR is merged and closed it needs an accompanied issue assigned to. If there is no issue for a PR, the maintainer needs to create one.

You can assign multiple PRs to one issue as long as they belong together.

Usually set the same labels and milestone for the PR as for the accompanied issue.

## Labels

### Kind

An issue that results in changesets must have exactly one of the following labels. This needs to be assigned latest before release.

| Label                                                    | Description                                | Changelog section |
|----------------------------------------------------------|--------------------------------------------|-------------------|
| {{% badge color="#5498d8" %}}documentation{{% /badge %}} | Improvements or additions to documentation | -                 |
| {{% badge color="#99d856" %}}discussion{{% /badge %}}    | This issue was converted to a discussion   | -                 |
| {{% badge color="#d8d104" %}}task{{% /badge %}}          | Maintenance work                           | Maintenance       |
| {{% badge color="#d8ae04" %}}feature{{% /badge %}}       | New feature or request                     | Features          |
| {{% badge color="#d88704" %}}bug{{% /badge %}}           | Something isn't working                    | Fixes             |

### Impact

If the issue would cause a new main release due to [semver semantics](#semver) it needs one of the according labels and the matching badge on the [What's new](introduction/releasenotes) page.

| Label                                               | Description                                             |
|-----------------------------------------------------|---------------------------------------------------------|
| {{% badge color="#d73a4a" %}}change{{% /badge %}}   | Introduces changes with existing installations          |
| {{% badge color="#d73a4a" %}}breaking{{% /badge %}} | Introduces breaking changes with existing installations |

### Declination

If an issue does not result in changesets but is closed anyways, it must have exactly one of the following labels.

| Label                                                 | Description                               |
|-------------------------------------------------------|-------------------------------------------
| {{% badge color="#9fa2a5" %}}duplicate{{% /badge %}}  | This issue or pull request already exists |
| {{% badge color="#9fa2a5" %}}invalid{{% /badge %}}    | This doesn't seem right                   |
| {{% badge color="#9fa2a5" %}}support{{% /badge %}}    | Request for achieving a special goal      |
| {{% badge color="#9fa2a5" %}}unresolved{{% /badge %}} | No progress on this issue                 |
| {{% badge color="#9fa2a5" %}}update{{% /badge %}}     | A change in behavior after updat          |
| {{% badge color="#9fa2a5" %}}wontchange{{% /badge %}} | This will not be worked on                |

### Halt

You can assign one further label out of the following list to signal readers that development on an open issue is currently halted for different reasons.

| Label                                                    | Description                                             |
|----------------------------------------------------------|---------------------------------------------------------|
| {{% badge color="#998f6b" %}}blocked{{% /badge %}}       | Depends on other issue to be fixed first                |
| {{% badge color="#998f6b" %}}idea{{% /badge %}}          | A valuable idea that's currently not worked on          |
| {{% badge color="#998f6b" %}}undecided{{% /badge %}}     | No decision was made yet                               |
| {{% badge color="#6426ff" %}}helpwanted{{% /badge %}}    | Great idea, send in a PR                                |
| {{% badge color="#6426ff" %}}needsfeedback{{% /badge %}} | Further information is needed                           |

### 3rd-Party

If the issue is not caused by a programming error in the themes own code, you can label the causing program or library.

| Label                                               | Description                                                 |
|-----------------------------------------------------|-------------------------------------------------------------|
| {{% badge color="#e550a7" %}}asciidoc{{% /badge %}} | This is a topic related to processing of AsciiDoc           |
| {{% badge color="#e550a7" %}}browser{{% /badge %}}  | This is a topic related to the browser but not the theme    |
| {{% badge color="#e550a7" %}}device{{% /badge %}}   | This is a topic related to a certain device                 |
| {{% badge color="#e550a7" %}}hugo{{% /badge %}}     | This is a topic related to Hugo itself but not the theme    |
| {{% badge color="#e550a7" %}}mermaid{{% /badge %}}  | This is a topic related to Mermaid itself but not the theme |

## Setting Up a Development Environment

Git Hooks are used to automate some tasks. They are stored in the `.githooks` root folder.

Documentation for each hook is contained in each file.

At least the `pre-commit` hook is required, as it updates the version number on each commit. This helps to help debugging of user related issues.

## Making Releases

A release is based on a milestone named like the release itself - just the version number, eg: `1.2.3`. It's in the maintainers responsibility to check [semver semantics](#semver) of the milestone's name prior to release and change it if necessary.

Making releases is automated by the `version-release` GitHub Action. It requires the version number of the milestone that should be released. The release will be created from the `main` branch of the repository.

Treat released milestones as immutable. Don't rerelease an already released milestone. An already released milestone may already been consumed by your users.

During execution of the action a few things are checked. If a check fails the action fails, resulting in no new release. You can correct the errors afterwards and rerun the action.

The following checks will be enforced

- the milestone exists
- there is at least one closed issue assigned to the milestone
- all assigned issues for this milestone are closed
- if it's a main release, there must be an accompanying releasenotes file present in the repo at `introduction/releasenotes/<major>/<minor>.en.md`

After a successful run of the action

- the changelog at `introduction/changelog/<major>/<minor>/<patch>.<lang>.md` is created for english and piratish, including missing generic upper level files
- the `CHANGELOG.md` is updated
- the releasenotes at `introduction/releasenotes/<major>/<minor>.en.md` are updated, including release version and release date
- missing generic upper level files for english and piratish are created
- the version number for the `<meta generator>` is updated
- the updated files are committed
- the milestone is closed
- the repository is tagged with the version number (eg. `1.2.3`), the main version number (eg. `1.2.x`) and the major version number (eg. `1.x`)
- a new entry in the [GitHub release list](https://github.com/McShelby/hugo-theme-relearn/releases) with the according changelog will be created
- the [official documentation](https://mcshelby.github.io/hugo-theme-relearn/) is built and deployed
- the version number for the `<meta generator>` is updated to a temporary and committed (this helps to determine if users are running directly on the main branch or are using releases)
- a new milestone for the next patch release is created (this can later be renamed to a main release if necessary)
