# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Hugo Relearn Theme is a documentation theme for Hugo, forked from the Learn theme. It's designed for creating documentation sites with features like multilingual support, dark mode, search, print support, and extensive shortcodes.

Minimum Hugo version required can be found in `theme.toml`.

## Development Commands

### Running the Theme

Development uses the `docs` for manual testing and documenting new features.

```bash
# Run the dev server from exampleSite directory
cd exampleSite
hugo server -p 1414
```

Development uses the `exampleSite` for manual testing and providing a simple showcase. The goal is to keep configuration minimal and be a first starting point for new users.

```bash
# Run the dev server from exampleSite directory
cd exampleSite
hugo server
```

#### Configurations

During development cycles, the server is started manually without an environment option.

The following other environments are available:

- **testing** - used to test the site during development using `test-hugo.bat`
- **github** - used to release the site on GitHub Pages
- **dev** - used to generate the site similar to GitHub Pages but usable locally
- **performance** - disables all performance intensive features to make building as fast as possible
- **versioning** - used to manually test the versioning feature

### Building

```bash
# Build from docs
cd docs
hugo

# Build with minification (production)
hugo --minify
```

### Screenshots Tool

```bash
# Generate screenshots using Puppeteer
cd tools
npm install
npm run screenshots
```

## Architecture

### Directory Structure

- **layouts/** - Hugo templates organized by type
  - **_default/** - Base layouts (baseof.html, single.html, list.html, etc.)
  - **partials/** - Reusable template partials
    - **_relearn/** - Core theme helper functions (.gotmpl files)
  - **shortcodes/** - Theme shortcodes (badge, button, card, tabs, mermaid, etc.)
  - **chapter/**, **home/** - Specialized page layouts

- **assets/** - Source files processed by Hugo Pipes
  - **css/** - Stylesheets including theme variants and chroma syntax highlighting
  - **js/** - JavaScript modules (theme.js, search, clipboard, etc.)

- **i18n/** - Translation files (.toml) for 26+ languages

- **archetypes/** - Content templates (default.md, chapter.md, home.md)

- **exampleSite/** - Full demo site used for development
  - **config/_default/** - Base configuration
  - **config/testing/**, **config/github/**, etc. - Environment-specific configs

- **docs/** - Documentation site source (separate from exampleSite)
  - **config/_default/** - Base configuration
  - **config/testing/**, **config/github/**, etc. - Environment-specific configs

### Key Template Concepts

**Partials in `layouts/partials/_relearn/`:**
- `.gotmpl` extension indicates Hugo template functions
- Core utilities: `boxStyle`, `decoratedLink`, `imageAttributes`, `linkAttributes`, `menuObject`, `dependencies`
- These are helper functions, not rendered partials

**Shortcodes:**
- Highly modular - each shortcode in `layouts/shortcodes/`
- Support both inline and block syntax
- Examples: badge, button, card/cards, expand, icon, include, math, mermaid, notice, openapi, tab/tabs, tree

**Dependencies System:**
- Theme uses a dependency loading system defined in `hugo.toml` under `params.relearn.dependencies`
- Dependencies: Math, Mermaid, OpenApi, Search, Theme
- Loaded on-demand based on shortcode usage

### Output Formats

Theme supports custom output formats:
- **print** - Printable versions of pages
- **source** - Markdown source view
- Define in `hugo.toml` under `[outputFormats]`

### Theming System

**Color Variants:**
- Multiple built-in variants in `assets/css/theme-*.css`
- Variants: relearn-light, relearn-dark, relearn-bright, learn, neon, blue, green, red, zen-light, zen-dark
- Users can switch variants via the topbar
- Base theme variables in `assets/css/variables.css`

**Chroma Syntax Highlighting:**
- Separate chroma stylesheets for each variant: `chroma-*.css`

### Search Implementation

- Two search engines supported: Lunr and Orama
- Search files in `assets/js/search*.js`
- Search index generated at build time via `_relearn_searchindex.js`

### JavaScript Architecture

- **theme.js** - Main theme JavaScript
- Modular dependencies loaded from subdirectories:
  - `auto-complete/` - Search autocomplete
  - `clipboard/` - Copy-to-clipboard
  - `lunr/`, `orama/` - Search engines
  - `mathjax/`, `mermaid/`, `d3/` - Feature libraries
  - `perfect-scrollbar/` - Scrollbar customization

## Code Quality Standards

### Commit Message Format

Use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format.

Common commit types:
- **Common:** build, browser, chore, docs, shortcodes, theme
- **Features:** a11y, archetypes, alias, generator, i18n, mobile, print, rss, variant
- **Structure:** favicon, search, menu, history, scrollbar, nav, toc, clipboard, syntaxhighlight, boxes
- **Shortcodes:** attachments, badge, button, children, expand, icon, include, math, mermaid, notice, openapi, piratify, siteparam, tabs

Example: `search: improve Orama integration for multilingual sites`

### Development Principles

- **Convention over configuration** - Site should work with minimal configuration
- **Stay close to Hugo** - Follow Hugo patterns and conventions
- **No build tools** - Avoid npm/preprocessing for theme itself (contributors may not be front-end developers)
- **Document features** - New features require documentation and release notes entries
- **Backwards compatibility** - Don't break existing features unless necessary
- **Clean output** - Remove console errors, check HTML whitespace and indentation

### Git Hooks

Python-based git hooks in `.githooks/`:
- `post-commit.py` - Post-commit processing
- `pre-push.py` - Pre-push validation

## Important Files

- **hugo.toml** - Theme configuration and module requirements
- **theme.toml** - Theme metadata (name, features, Hugo version)
- **go.mod** - Hugo module definition
- **.prettierrc.json** / **.prettierignore** - Code formatting (Prettier)
- **.editorconfig** - Editor configuration
- **CHANGELOG.md** - Detailed version history

## Content Development

### Front Matter

Standard front matter for content:
````toml
+++
title = "Page Title"
weight = 10  # Ordering in sidebar
+++
````

### Page Types

- **Home** - Site landing page (uses `layouts/home/`)
- **Chapter** - Section pages (uses `layouts/chapter/`)
- **Default** - Regular content pages

### Multilingual Sites

- Translation files in `i18n/*.toml`
- Content organized by language code: `content/en/`, `content/de/`, etc.
- Set `defaultContentLanguage` in hugo.toml

## Testing

Test against the exampleSite which demonstrates all theme features. Verify:
- Search functionality (both Lunr and Orama)
- Print output
- Theme variant switching
- Shortcodes rendering
- Mobile responsiveness
- Multilingual navigation
- No console errors

## Release Process

Releases happen directly from the `main` branch without prior notice. Every commit to `main` must be production-ready and result in a releasable version.
