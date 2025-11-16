window.relearn = window.relearn || {};

// we need to load this script in the html head to avoid flickering
// on page load if the user has selected a non default variant

function ready(fn) {
  if (document.readyState == 'complete') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

var variants = {
  variants: window.relearn.themevariants,
  customvariantname: window.relearn.customvariantname,
  isstylesheetloaded: true,

  setup: function () {
    this.variantvariables = [];
    var extractVariables = function (node) {
      if (node.variables) {
        var group = node.title || '';
        node.variables.forEach((v) => (v.group = group));
        this.variantvariables.push(...node.variables);
      }
      if (node.children) {
        node.children.forEach((child) => extractVariables.call(this, child));
      }
    }.bind(this);
    extractVariables(this.structure);
    this.addCustomVariantStyles();

    var customvariantstylesheet = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariantstylesheet');
    var customvariant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
    if (!customvariantstylesheet || !customvariant) {
      customvariantstylesheet = '';
      window.relearn.removeItem(window.localStorage, window.relearn.absBaseUri + '/customvariantstylesheet');
      customvariant = '';
      window.relearn.removeItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
    } else if (customvariant && !window.relearn.themevariants.includes(customvariant)) {
      // this can only happen on initial load, if a previously selected variant is not available anymore
      customvariant = window.relearn.themevariants[0];
      window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/customvariant', customvariant);
    }
    this.updateCustomVariantStyles(customvariantstylesheet);

    this.init();
    ready(this.init.bind(this));
  },

  init: function (variant, old_path) {
    this.addCustomVariantOption();
    window.relearn.markVariant();
    window.relearn.changeVariant(window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/variant'));
  },

  addCustomVariantOption: function () {
    var customvariant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
    if (!customvariant) {
      return;
    }
    document.querySelectorAll('.R-variantswitcher select').forEach((select) => {
      var option = select.options[`R-select-variant-${this.customvariantname}`];
      if (!option) {
        option = document.createElement('option');
        option.id = `R-select-variant-${this.customvariantname}`;
        option.value = this.customvariantname;
        option.text = this.customvariantname.replace(/-/g, ' ').replace(/\w\S*/g, function (w) {
          return w.replace(/^\w/g, function (c) {
            return c.toUpperCase();
          });
        });
        select.appendChild(option);
      }
    });
  },

  removeCustomVariantOption: function () {
    document.querySelectorAll(`.R-variantswitcher option[value="${this.customvariantname}"]`).forEach((option) => {
      option.remove();
    });
  },

  addCustomVariantStyles: function () {
    var head = document.querySelector('head');
    var style = document.createElement('style');
    style.id = 'R-variant-styles-' + this.customvariantname;
    head.appendChild(style);
  },

  updateCustomVariantStyles: function (stylesheet) {
    stylesheet = ":root:not([data-r-output-format='print'])[data-r-theme-variant='" + this.customvariantname + "']  {" + '\n&' + stylesheet + '\n}';
    var style = document.querySelector('#R-variant-styles-' + this.customvariantname);
    if (style) {
      style.textContent = stylesheet;
    }
  },

  saveCustomVariant: function () {
    var variant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/variant');
    if (variant != this.customvariantname) {
      window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/customvariant', variant);
    }
    var stylesheet = this.generateStylesheet(this.customvariantname);
    window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/variant', this.customvariantname);
    window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/customvariantstylesheet', stylesheet);
    this.updateCustomVariantStyles(stylesheet);

    this.addCustomVariantOption();
    window.relearn.markVariant();
    window.relearn.changeVariant(this.customvariantname);
  },

  normalizeColor: function (c) {
    if (!c || !c.trim) {
      return c;
    }
    c = c.trim();
    c = c.replace(/\s*\(\s*/g, '( ');
    c = c.replace(/\s*\)\s*/g, ' )');
    c = c.replace(/\s*,\s*/g, ', ');
    c = c.replace(/0*\./g, '.');
    c = c.replace(/ +/g, ' ');
    return c;
  },

  getColorValue: function (c) {
    return this.normalizeColor(getComputedStyle(document.documentElement).getPropertyValue('--INTERNAL-' + c));
  },

  getColorProperty: function (c, read_style) {
    var e = this.findColor(c);
    var p = this.normalizeColor(read_style.getPropertyValue('--' + c)).replace('--INTERNAL-', '--');
    return p;
  },

  findRootRule: function (rules, parentSelectors) {
    for (let rule of rules ?? []) {
      if ((rule.conditionText && rule.conditionText != 'screen') || (rule.selectorText && !rule.selectorText.startsWith(':root:not'))) {
        return null;
      }
      if (parentSelectors.some((selector) => rule.selectorText === selector)) {
        // Search nested rules for &:root
        for (let nestedRule of rule.cssRules ?? []) {
          if (nestedRule.selectorText === '&:root') {
            return nestedRule.style;
          }
        }
        return null;
      }
      let result = this.findRootRule(rule.cssRules, parentSelectors);
      if (result) {
        return result;
      }
    }
    return null;
  },

  findLoadedStylesheet: function (id, parentSelectors) {
    for (let sheet of document.styleSheets) {
      if (sheet.ownerNode.id === id) {
        return this.findRootRule(sheet.cssRules, parentSelectors);
      }
    }
    return null;
  },

  findColor: function (name) {
    var f = this.variantvariables.find(function (x) {
      return x.name == name;
    });
    return f;
  },

  generateColorVariable: function (e, read_style) {
    var v = '';
    var gen = this.getColorProperty(e.name, read_style);
    if (gen) {
      v += '  --' + e.name + ': ' + gen + '; /* ' + e.tooltip + ' */\n';
    }
    return v;
  },

  // ------------------------------------------------------------------------
  // CSS download
  // ------------------------------------------------------------------------

  generateStylesheet: function (variant) {
    var style = null;
    if (variant != this.customvariantname) {
      style = this.findLoadedStylesheet('R-format-style', [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + variant + '"]']);
      if (!style) {
        alert('There is nothing to be generated as auto mode variants will be generated by Hugo');
        return;
      }
    } else {
      style = this.findLoadedStylesheet('R-variant-styles-' + variant, [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + variant + '"]']);
      if (!style) {
        var customvariantbase = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
        style = this.findLoadedStylesheet('R-format-style', [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + customvariantbase + '"]']);
        if (!style) {
          alert('There is nothing to be generated as auto mode variants will be generated by Hugo');
          return;
        }
      }
    }

    var style =
      ':root {\n' +
      '  /* ' +
      variant +
      ' */\n' +
      this.variantvariables.reduce(
        function (a, e) {
          return a + this.generateColorVariable(e, style);
        }.bind(this),
        ''
      ) +
      '}\n';
    return style;
  },

  download: function (data, mimetype, filename) {
    var blob = new Blob([data], { type: mimetype });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
  },

  // ------------------------------------------------------------------------
  // external API
  // ------------------------------------------------------------------------

  changeColor: function (c) {
    var variant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/variant');
    var customvariantbase = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');

    if (customvariantbase && this.customvariantname != variant) {
      alert('You already have changes based on the "' + customvariantbase + '" variant. Please proceed editing the custom variant, reset your changes or ignore this message.');
      return;
    }
    customvariantbase = customvariantbase ?? variant;

    var base_style = this.findLoadedStylesheet('R-format-style', [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + customvariantbase + '"]']);
    if (!base_style) {
      alert('An auto mode variant can not be changed. Please select its light/dark variant directly to make changes');
      return;
    }

    var custom_style = this.findLoadedStylesheet('R-variant-styles-' + this.customvariantname, [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + this.customvariantname + '"]']);
    if (!custom_style) {
      this.saveCustomVariant();
      custom_style = this.findLoadedStylesheet('R-variant-styles-' + this.customvariantname, [':root:not([data-r-output-format="print"])[data-r-theme-variant="' + this.customvariantname + '"]']);
    }

    var e = this.findColor(c);
    var v = this.getColorProperty(c, custom_style);
    var t = c + '\n\n' + e.tooltip + '\n';
    if (e.fallback) {
      t += '\nInherits value "' + this.getColorValue(e.fallback) + '" from ' + e.fallback + ' if not set\n';
    } else if (e.default) {
      t += '\nDefaults to value "' + this.normalizeColor(e.default) + '" if not set\n';
    }
    var n = prompt(t, v);
    if (n === null) {
      // user canceld operation
      return;
    }

    if (n) {
      // value set to specific value
      n = this.normalizeColor(n).replace('--INTERNAL-', '--').replace('--', '--INTERNAL-');
      if (n != v) {
        custom_style.setProperty('--' + c, n);
      }
    } else {
      // value emptied, so delete it
      custom_style.removeProperty('--' + c);
    }

    this.saveCustomVariant();
  },

  resetVariant: function () {
    var customvariant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
    if (customvariant && confirm('You have made changes to your custom variant. Are you sure you want to reset all changes?')) {
      var variant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/variant');
      if (variant != this.customvariantname) {
        customvariant = variant;
      }
      window.relearn.removeItem(window.localStorage, window.relearn.absBaseUri + '/customvariant');
      window.relearn.removeItem(window.localStorage, window.relearn.absBaseUri + '/customvariantstylesheet');
      window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/variant', customvariant);
      this.updateCustomVariantStyles('');

      this.removeCustomVariantOption();
      window.relearn.markVariant();
      window.relearn.changeVariant(customvariant);
    }
  },

  getStylesheet: function () {
    var variant = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/variant');
    var style = this.generateStylesheet(variant);
    if (style) {
      console.log(style);
      this.download(style, 'text/css', 'theme-' + variant + '.css');
    }
  },

  generator: function (vargenerator) {
    var graphDefinition = this.generateGraph();
    var graphs = document.querySelectorAll(vargenerator);
    graphs.forEach(function (e) {
      e.innerHTML = graphDefinition;
    });

    var interval_id = setInterval(
      function () {
        if (document.querySelectorAll(vargenerator + ' .mermaid > svg').length) {
          clearInterval(interval_id);
          this.styleGraph();
        }
      }.bind(this),
      25
    );
  },

  // ------------------------------------------------------------------------
  // Mermaid graph stuff
  // ------------------------------------------------------------------------

  adjustCSSRules: function (selector, props, sheets) {
    // get stylesheet(s)
    if (!sheets) sheets = [...document.styleSheets];
    else if (sheets.sup) {
      // sheets is a string
      let absoluteURL = new URL(sheets, document.baseURI).href;
      sheets = [...document.styleSheets].filter((i) => i.href == absoluteURL);
    } else sheets = [sheets]; // sheets is a stylesheet

    // CSS (& HTML) reduce spaces in selector to one.
    selector = selector.replace(/\s+/g, ' ');
    const findRule = (s) => [...s.cssRules].reverse().find((i) => i.selectorText == selector);
    let rule = sheets
      .map(findRule)
      .filter((i) => i)
      .pop();

    const propsArr = props.sup
      ? props.split(/\s*;\s*/).map((i) => i.split(/\s*:\s*/)) // from string
      : Object.entries(props); // from Object

    if (rule)
      for (let [prop, val] of propsArr) {
        // rule.style[prop] = val; is against the spec, and does not support !important.
        rule.style.setProperty(prop, ...val.split(/ *!(?=important)/));
      }
    else {
      sheet = sheets.pop();
      if (!props.sup) props = propsArr.reduce((str, [k, v]) => `${str}; ${k}: ${v}`, '');
      sheet.insertRule(`${selector} { ${props} }`, sheet.cssRules.length);
    }
  },

  styleGraphGroup: function (selector, colorvar) {
    this.adjustCSSRules('#R-body svg ' + selector + ' > rect', 'color: var(--INTERNAL-' + colorvar + '); fill: var(--INTERNAL-' + colorvar + '); stroke: #80808080;');
    this.adjustCSSRules('#R-body svg ' + selector + ' > .label .nodeLabel', 'color: var(--INTERNAL-' + colorvar + '); fill: var(--INTERNAL-' + colorvar + '); stroke: #80808080;');
    this.adjustCSSRules('#R-body svg ' + selector + ' > .cluster-label .nodeLabel', 'color: var(--INTERNAL-' + colorvar + '); fill: var(--INTERNAL-' + colorvar + '); stroke: #80808080;');
    this.adjustCSSRules('#R-body svg ' + selector + ' .nodeLabel', 'filter: grayscale(1) invert(1) contrast(10000);');
  },

  styleGraph: function () {
    this.variantvariables.forEach(
      function (e) {
        this.styleGraphGroup('.' + e.name, e.name);
      }.bind(this)
    );

    var styleSubgraphs = function (node) {
      if (!node) return;
      if (node.id && node.color) {
        this.styleGraphGroup('#' + node.id, node.color);
      }
      if (node.children) {
        node.children.forEach((child) => styleSubgraphs.call(this, child));
      }
    }.bind(this);

    styleSubgraphs(this.structure);
  },

  generateGraphGroupedEdge: function (e) {
    var edge = '';
    if (e.fallback && e.group == this.findColor(e.fallback).group) {
      edge += e.fallback + ':::' + e.fallback + ' --> ' + e.name + ':::' + e.name;
    } else {
      edge += e.name + ':::' + e.name;
    }
    return edge;
  },

  generateGraphVarGroupedEdge: function (e) {
    var edge = '';
    if (e.fallback && e.group != this.findColor(e.fallback).group) {
      edge += '  ' + e.fallback + ':::' + e.fallback + ' --> ' + e.name + ':::' + e.name + '\n';
    }
    return edge;
  },

  generateGraph: function () {
    var g_handler = this.variantvariables.reduce((h, e) => h + '  click ' + e.name + ' variants.changeColor\n', '');

    var generateSubgraph = function (node, indent) {
      if (!node) return '';
      var content = '';
      if (node.title) {
        content += indent + 'subgraph ' + node.id + '["' + node.title + '"]\n';
        content += indent + '  direction ' + (node.direction || 'LR') + '\n';
      }
      if (node.variables) {
        content += node.variables.reduce((a, e) => a + indent + (node.title ? '  ' : '') + this.generateGraphGroupedEdge(e) + '\n', '');
      }
      if (node.children) {
        content += node.children.reduce((a, child) => a + generateSubgraph.call(this, child, indent + (node.title ? '  ' : '')), '');
      }
      if (node.title) {
        content += indent + 'end\n';
      }
      return content;
    }.bind(this);

    var graph = 'flowchart LR\n' + generateSubgraph(this.structure, '  ') + this.variantvariables.reduce((a, e) => a + this.generateGraphVarGroupedEdge(e), '') + g_handler;

    console.log(graph);
    return graph;
  },

  structure: {
    children: [
      {
        id: 'branding',
        title: 'brand colors',
        direction: 'LR',
        color: 'TOPBAR-BG-color',
        variables: [
          { name: 'PRIMARY-color', fallback: 'MENU-HEADER-BG-color', tooltip: 'brand primary color' },
          { name: 'PRIMARY-HOVER-color', fallback: 'MENU-HEADER-BORDER-color', tooltip: 'brand primary hover color' },
          { name: 'SECONDARY-color', fallback: 'MAIN-LINK-color', tooltip: 'brand secondary color' },
          { name: 'SECONDARY-HOVER-color', fallback: 'MAIN-LINK-HOVER-color', tooltip: 'brand secondary hover color' },
          { name: 'ACCENT-color', default: '#ffd700', tooltip: 'brand accent color, used for search highlights' },
          { name: 'ACCENT-HOVER-color', default: '#ffeb78', tooltip: 'brand accent hover color' },
        ],
      },
      {
        id: 'menu',
        title: 'menu',
        direction: 'TB',
        color: 'MENU-SECTIONS-BG-color',
        children: [
          {
            id: 'menuheader',
            title: 'header',
            direction: 'LR',
            color: 'MENU-HEADER-BG-color',
            variables: [
              { name: 'MENU-BORDER-color', default: 'transparent', tooltip: 'border color between menu and content' },
              { name: 'MENU-TOPBAR-BORDER-color', fallback: 'MENU-HEADER-BG-color', tooltip: 'border color of vertical line between menu and topbar' },
              { name: 'MENU-TOPBAR-SEPARATOR-color', default: 'transparent', tooltip: 'separator color of vertical line between menu and topbar' },
              { name: 'MENU-HEADER-color', fallback: 'MENU-SECTIONS-LINK-color', tooltip: 'color of menu header' },
              { name: 'MENU-HEADER-BG-color', fallback: 'PRIMARY-color', tooltip: 'background color of menu header' },
              { name: 'MENU-HEADER-BORDER-color', fallback: 'MENU-HEADER-BG-color', tooltip: 'border color between menu header and menu' },
              { name: 'MENU-SEARCH-color', default: '#e0e0e0', tooltip: 'text and icon color of search box' },
              { name: 'MENU-SEARCH-BG-color', default: '#323232', tooltip: 'background color of search box' },
              { name: 'MENU-SEARCH-BORDER-color', fallback: 'MENU-SEARCH-BG-color', tooltip: 'border color of search box' },
            ],
          },
          {
            id: 'menuhome',
            title: 'home',
            direction: 'LR',
            color: 'MENU-HEADER-BORDER-color',
            variables: [
              { name: 'MENU-HOME-LINK-color', default: '#323232', tooltip: 'home button color if configured' },
              { name: 'MENU-HOME-LINK-HOVER-color', default: '#808080', tooltip: 'hoverd home button color if configured' },
              { name: 'MENU-HOME-TOP-SEPARATOR-color', fallback: 'MENU-HOME-LINK-color', tooltip: 'separator color between menu search box and home menu' },
              { name: 'MENU-HOME-SEPARATOR-color', fallback: 'MENU-HOME-LINK-color', tooltip: 'separator color between home menus' },
              { name: 'MENU-HOME-BOTTOM-SEPARATOR-color', fallback: 'MENU-HEADER-BORDER-color', tooltip: 'separator color between home menu and menu' },
            ],
          },
          {
            id: 'menusections',
            title: 'sections',
            direction: 'LR',
            color: 'MENU-SECTIONS-ACTIVE-BG-color',
            variables: [
              { name: 'MENU-SECTIONS-BG-color', default: '#282828', tooltip: 'background of the menu; this is NOT just a color value but can be a complete CSS background definition including gradients, etc.' },
              { name: 'MENU-SECTIONS-ACTIVE-BG-color', default: 'rgba( 0, 0, 0, .166 )', tooltip: 'background color of the active menu section' },
              { name: 'MENU-SECTIONS-LINK-color', default: '#bababa', tooltip: 'link color of menu topics' },
              { name: 'MENU-SECTIONS-LINK-HOVER-color', fallback: 'MENU-SECTIONS-LINK-color', tooltip: 'hoverd link color of menu topics' },
              { name: 'MENU-SECTION-ACTIVE-CATEGORY-color', default: '#444444', tooltip: 'text color of the displayed menu topic' },
              { name: 'MENU-SECTION-ACTIVE-CATEGORY-BG-color', fallback: 'MAIN-BG-color', tooltip: 'background color of the displayed menu topic' },
              { name: 'MENU-SECTION-ACTIVE-CATEGORY-BORDER-color', default: 'transparent', tooltip: 'border color between the displayed menu topic and the content' },
              { name: 'MENU-SECTION-SEPARATOR-color', default: '#606060', tooltip: 'separator color between menus' },
              { name: 'MENU-VISITED-color', fallback: 'SECONDARY-color', tooltip: 'icon color of visited menu topics if configured' },
            ],
          },
        ],
      },
      {
        id: 'maintopbar',
        title: 'topbar',
        direction: 'LR',
        color: 'TOPBAR-BG-color',
        variables: [
          { name: 'TOPBAR-LINK-color', fallback: 'MAIN-LINK-color', tooltip: 'link color of topbar' },
          { name: 'TOPBAR-LINK-HOVER-color', fallback: 'MAIN-LINK-HOVER-color', tooltip: 'hoverd link color of topbar' },
          { name: 'TOPBAR-BUTTON-color', fallback: 'TOPBAR-LINK-color', tooltip: 'button color of topbar' },
          { name: 'TOPBAR-BUTTON-HOVER-color', fallback: 'TOPBAR-LINK-HOVER-color', tooltip: 'hoverd button color of topbar' },
          { name: 'TOPBAR-BG-color', default: 'color-mix(in srgb, var(--INTERNAL-MAIN-BG-color), rgba(134, 134, 134, 0.133))', tooltip: 'background color of topbar' },
          { name: 'TOPBAR-TEXT-color', fallback: 'MAIN-TEXT-color', tooltip: 'text color of topbar' },
          { name: 'TOPBAR-SEPARATOR-color', default: 'color-mix(in srgb, var(--INTERNAL-TOPBAR-BG-color), rgba(134, 134, 134, 0.666))', tooltip: 'separator color of vertical lines topbar buttons' },
          { name: 'TOPBAR-OVERLAY-BG-color', fallback: 'MAIN-BG-color', tooltip: 'background color of topbar popover areas' },
          { name: 'MAIN-TOPBAR-BORDER-color', default: 'transparent', tooltip: 'border color between topbar and content' },
        ],
      },
      {
        id: 'maincontent',
        title: 'content',
        direction: 'TB',
        color: 'MAIN-BG-color',
        variables: [
          { name: 'MAIN-LINK-color', fallback: 'SECONDARY-color', tooltip: 'link color of content' },
          { name: 'MAIN-LINK-HOVER-color', fallback: 'SECONDARY-HOVER-color', tooltip: 'hoverd link color of content' },
          { name: 'MAIN-BUTTON-color', fallback: 'MAIN-LINK-color', tooltip: 'button color of content' },
          { name: 'MAIN-BUTTON-HOVER-color', fallback: 'MAIN-LINK-HOVER-color', tooltip: 'hoverd button color of content' },
          { name: 'MAIN-BG-color', default: '#ffffff', tooltip: 'background color of content' },
          { name: 'TAG-BG-color', fallback: 'PRIMARY-color', tooltip: 'tag color' },
          { name: 'MAIN-TEXT-color', default: '#101010', tooltip: 'text color of content and titles' },
          { name: 'MAIN-font', default: '"Roboto Flex", "Helvetica", "Tahoma", "Geneva", "Arial", sans-serif', tooltip: 'text font of content and titles' },
        ],
        children: [
          {
            id: 'mainheadings',
            title: 'headings',
            direction: 'LR',
            color: 'MAIN-BG-color',
            variables: [
              { name: 'MAIN-TITLES-TEXT-color', fallback: 'MAIN-TEXT-color', tooltip: 'text color of titles and transparent box titles' },
              { name: 'MAIN-TITLES-H1-TEXT-color', fallback: 'MAIN-TITLES-TEXT-color', tooltip: 'text color of h1 titles' },
              { name: 'MAIN-TITLES-H2-TEXT-color', fallback: 'MAIN-TITLES-TEXT-color', tooltip: 'text color of h2-h6 titles' },
              { name: 'MAIN-TITLES-H3-TEXT-color', fallback: 'MAIN-TITLES-H2-TEXT-color', tooltip: 'text color of h3-h6 titles' },
              { name: 'MAIN-TITLES-H4-TEXT-color', fallback: 'MAIN-TITLES-H3-TEXT-color', tooltip: 'text color of h4-h6 titles' },
              { name: 'MAIN-TITLES-H5-TEXT-color', fallback: 'MAIN-TITLES-H4-TEXT-color', tooltip: 'text color of h5-h6 titles' },
              { name: 'MAIN-TITLES-H6-TEXT-color', fallback: 'MAIN-TITLES-H5-TEXT-color', tooltip: 'text color of h6 titles' },
              { name: 'MAIN-TITLES-font', fallback: 'MAIN-font', tooltip: 'text font of titles' },
              { name: 'MAIN-TITLES-H1-font', fallback: 'MAIN-TITLES-font', tooltip: 'text font of h1 titles' },
              { name: 'MAIN-TITLES-H2-font', fallback: 'MAIN-TITLES-font', tooltip: 'text font of h2-h6 titles' },
              { name: 'MAIN-TITLES-H3-font', fallback: 'MAIN-TITLES-H2-font', tooltip: 'text font of h3-h6 titles' },
              { name: 'MAIN-TITLES-H4-font', fallback: 'MAIN-TITLES-H3-font', tooltip: 'text font of h4-h6 titles' },
              { name: 'MAIN-TITLES-H5-font', fallback: 'MAIN-TITLES-H4-font', tooltip: 'text font of h5-h6 titles' },
              { name: 'MAIN-TITLES-H6-font', fallback: 'MAIN-TITLES-H5-font', tooltip: 'text font of h6 titles' },
            ],
          },
          {
            id: 'code',
            title: 'code',
            direction: 'TB',
            color: 'CODE-BLOCK-BG-color',
            variables: [
              { name: 'CODE-theme', default: 'relearn-light', tooltip: 'name of the chroma stylesheet file' },
              { name: 'CODE-font', default: '"Consolas", menlo, monospace', tooltip: 'text font of code' },
            ],
            children: [
              {
                id: 'inlinecode',
                title: 'inline code',
                direction: 'LR',
                color: 'CODE-INLINE-BG-color',
                variables: [
                  { name: 'CODE-INLINE-color', default: '#5e5e5e', tooltip: 'text color of inline code' },
                  { name: 'CODE-INLINE-BG-color', default: '#fffae9', tooltip: 'background color of inline code' },
                  { name: 'CODE-INLINE-BORDER-color', default: '#fbf0cb', tooltip: 'border color of inline code' },
                ],
              },
              {
                id: 'blockcode',
                title: 'code blocks',
                direction: 'LR',
                color: 'CODE-BLOCK-BG-color',
                variables: [
                  { name: 'CODE-BLOCK-color', default: '#000000', tooltip: 'fallback text color of block code; should be adjusted to your selected chroma style' },
                  { name: 'CODE-BLOCK-BG-color', default: '#f8f8f8', tooltip: 'fallback background color of block code; should be adjusted to your selected chroma style' },
                  { name: 'CODE-BLOCK-BORDER-color', fallback: 'CODE-BLOCK-BG-color', tooltip: 'border color of block code' },
                ],
              },
            ],
          },
          {
            id: 'thirdparty',
            title: '3rd party',
            direction: 'LR',
            color: 'MAIN-BG-color',
            variables: [
              { name: 'BROWSER-theme', default: 'light', tooltip: 'name of the theme for browser scrollbars of the main section' },
              { name: 'MERMAID-theme', default: 'default', tooltip: 'name of the default Mermaid theme for this variant, can be overridden in hugo.toml' },
              { name: 'OPENAPI-theme', default: 'light', tooltip: 'name of the default OpenAPI theme for this variant, can be overridden in hugo.toml' },
              { name: 'OPENAPI-CODE-theme', default: 'obsidian', tooltip: 'name of the default OpenAPI code theme for this variant, can be overridden in hugo.toml' },
            ],
          },
          {
            id: 'coloredboxes',
            title: 'colored boxes',
            direction: 'LR',
            color: 'BOX-BG-color',
            variables: [
              { name: 'BOX-CAPTION-color', default: 'rgba( 255, 255, 255, 1 )', tooltip: 'text color of colored box titles' },
              { name: 'BOX-BG-color', default: 'rgba( 255, 255, 255, .833 )', tooltip: 'background color of colored boxes' },
              { name: 'BOX-TEXT-color', fallback: 'MAIN-TEXT-color', tooltip: 'text color of colored box content' },
              { name: 'BOX-BLUE-color', default: 'rgba( 48, 117, 229, 1 )', tooltip: 'background color of blue boxes' },
              { name: 'BOX-INFO-color', fallback: 'BOX-BLUE-color', tooltip: 'background color of info boxes' },
              { name: 'BOX-BLUE-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of blue boxes' },
              { name: 'BOX-INFO-TEXT-color', fallback: 'BOX-BLUE-TEXT-color', tooltip: 'text color of info boxes' },
              { name: 'BOX-CYAN-color', default: 'rgba( 45, 190, 200, 1 )', tooltip: 'background color of cyan boxes' },
              { name: 'BOX-IMPORTANT-color', fallback: 'BOX-CYAN-color', tooltip: 'background color of info boxes' },
              { name: 'BOX-CYAN-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of cyan boxes' },
              { name: 'BOX-IMPORTANT-TEXT-color', fallback: 'BOX-CYAN-TEXT-color', tooltip: 'text color of info boxes' },
              { name: 'BOX-GREEN-color', default: 'rgba( 42, 178, 24, 1 )', tooltip: 'background color of green boxes' },
              { name: 'BOX-TIP-color', fallback: 'BOX-GREEN-color', tooltip: 'background color of tip boxes' },
              { name: 'BOX-GREEN-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of green boxes' },
              { name: 'BOX-TIP-TEXT-color', fallback: 'BOX-GREEN-TEXT-color', tooltip: 'text color of tip boxes' },
              { name: 'BOX-GREY-color', default: 'rgba( 128, 128, 128, 1 )', tooltip: 'background color of grey boxes' },
              { name: 'BOX-NEUTRAL-color', fallback: 'BOX-GREY-color', tooltip: 'background color of neutral boxes' },
              { name: 'BOX-GREY-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of grey boxes' },
              { name: 'BOX-NEUTRAL-TEXT-color', fallback: 'BOX-GREY-TEXT-color', tooltip: 'text color of neutral boxes' },
              { name: 'BOX-MAGENTA-color', default: 'rgba( 229, 50, 210, 1 )', tooltip: 'background color of magenta boxes' },
              { name: 'BOX-CAUTION-color', fallback: 'BOX-MAGENTA-color', tooltip: 'background color of info boxes' },
              { name: 'BOX-MAGENTA-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of magenta boxes' },
              { name: 'BOX-CAUTION-TEXT-color', fallback: 'BOX-MAGENTA-TEXT-color', tooltip: 'text color of info boxes' },
              { name: 'BOX-ORANGE-color', default: 'rgba( 237, 153, 9, 1 )', tooltip: 'background color of orange boxes' },
              { name: 'BOX-NOTE-color', fallback: 'BOX-ORANGE-color', tooltip: 'background color of note boxes' },
              { name: 'BOX-ORANGE-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of orange boxes' },
              { name: 'BOX-NOTE-TEXT-color', fallback: 'BOX-ORANGE-TEXT-color', tooltip: 'text color of note boxes' },
              { name: 'BOX-RED-color', default: 'rgba( 224, 62, 62, 1 )', tooltip: 'background color of red boxes' },
              { name: 'BOX-WARNING-color', fallback: 'BOX-RED-color', tooltip: 'background color of warning boxes' },
              { name: 'BOX-RED-TEXT-color', fallback: 'BOX-TEXT-color', tooltip: 'text color of red boxes' },
              { name: 'BOX-WARNING-TEXT-color', fallback: 'BOX-RED-TEXT-color', tooltip: 'text color of warning boxes' },
            ],
          },
        ],
      },
    ],
  },

  variantvariables: [], // Will be filled from structure in setup()
};

variants.setup();
