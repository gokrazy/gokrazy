window.relearn = window.relearn || {};

var theme = true;
var isPrint = document.querySelector('body').classList.contains('print');
var isPrintPreview = false;

var isRtl = document.querySelector('html').getAttribute('dir') == 'rtl';
var lang = document.querySelector('html').getAttribute('lang');
var dir_padding_start = 'padding-left';
var dir_padding_end = 'padding-right';
var dir_key_start = 37;
var dir_key_end = 39;
var dir_scroll = 1;
if (isRtl) {
  dir_padding_start = 'padding-right';
  dir_padding_end = 'padding-left';
  dir_key_start = 39;
  dir_key_end = 37;
  dir_scroll = -1;
}

var touchsupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

var formelements = 'button, datalist, fieldset, input, label, legend, meter, optgroup, option, output, progress, select, textarea';

// PerfectScrollbar
var psc;
var psm;
var pst = new Map();
var elc = document.querySelector('#R-body-inner');

function regexEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function documentFocus() {
  elc.focus();
  psc && psc.scrollbarY.focus();
}

function scrollbarWidth() {
  // https://davidwalsh.name/detect-scrollbar-width
  // Create the measurement node
  var scrollDiv = document.createElement('div');
  scrollDiv.className = 'scrollbar-measure';
  document.body.appendChild(scrollDiv);
  // Get the scrollbar width
  var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  // Delete the DIV
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

var scrollbarSize = scrollbarWidth();
function adjustContentWidth() {
  var start = parseFloat(getComputedStyle(elc).getPropertyValue(dir_padding_start));
  var end = start;
  if (elc.scrollHeight > elc.clientHeight) {
    // if we have a scrollbar reduce the end margin by the scrollbar width
    end = Math.max(0, start - scrollbarSize);
  }
  elc.style[dir_padding_end] = '' + end + 'px';
}

let debounceTimeout;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Toast notification system
function showToast(message) {
  if (!message) return;

  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-atomic', 'true');
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('toast-hiding');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // Match the fade-out animation duration
  }, 2000);
}

window.relearn.showToast = showToast;

function fixCodeTabs() {
  /* if only a single code block is contained in the tab and no style was selected, treat it like style=code */
  var codeTabContents = Array.from(document.querySelectorAll('.tab-content.tab-panel-style')).filter(function (tabContent) {
    return tabContent.querySelector('*:scope > .tab-content-text > div.highlight:only-child, *:scope > .tab-content-text > pre:not(.mermaid).pre-code:only-child');
  });

  codeTabContents.forEach(function (tabContent) {
    var tabId = tabContent.dataset.tabItem;
    var tabPanel = tabContent.parentNode.parentNode;
    var tabButton = tabPanel.querySelector('.tab-nav-button.tab-panel-style[data-tab-item="' + tabId + '"]');
    if (tabContent.classList.contains('initial')) {
      tabButton.classList.remove('initial');
      tabButton.classList.add('code');
      tabContent.classList.remove('initial');
      tabContent.classList.add('code');
    }
    // mark code blocks for FF without :has()
    tabContent.classList.add('codify');
  });
}

function switchTab(tabGroup, tabId) {
  var tabs = Array.from(document.querySelectorAll('.tab-panel[data-tab-group="' + tabGroup + '"]')).filter(function (e) {
    return !!e.querySelector('[data-tab-item="' + tabId + '"]');
  });
  var allTabItems =
    tabs &&
    tabs.reduce(function (a, e) {
      return a.concat(
        Array.from(e.querySelectorAll('[data-tab-item]')).filter(function (es) {
          return es.parentNode.parentNode == e;
        })
      );
    }, []);
  var targetTabItems =
    tabs &&
    tabs.reduce(function (a, e) {
      return a.concat(
        Array.from(e.querySelectorAll('[data-tab-item="' + tabId + '"]')).filter(function (es) {
          return es.parentNode.parentNode == e;
        })
      );
    }, []);

  // if event is undefined then switchTab was called from restoreTabSelection
  // so it's not a button event and we don't need to safe the selction or
  // prevent page jump
  var isButtonEvent = event && event.target && event.target.getBoundingClientRect;
  if (isButtonEvent) {
    // save button position relative to viewport
    var yposButton = event.target.getBoundingClientRect().top;
  }

  allTabItems &&
    allTabItems.forEach(function (e) {
      e.classList.remove('active');
      e.setAttribute('aria-expanded', 'false');
      e.removeAttribute('tabindex');
    });
  targetTabItems &&
    targetTabItems.forEach(function (e) {
      e.classList.add('active');
      e.setAttribute('aria-expanded', 'true');
      e.setAttribute('tabindex', '-1');
    });

  if (isButtonEvent) {
    initMermaid(true);

    // reset screen to the same position relative to clicked button to prevent page jump
    var yposButtonDiff = event.target.getBoundingClientRect().top - yposButton;
    window.scrollTo(window.scrollX, window.scrollY + yposButtonDiff);

    // Store the selection to make it persistent
    if (window.localStorage) {
      var selectionsJSON = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/tab-selections');
      if (selectionsJSON) {
        var tabSelections = JSON.parse(selectionsJSON);
      } else {
        var tabSelections = {};
      }
      tabSelections[tabGroup] = tabId;
      window.relearn.setItem(window.localStorage, window.relearn.absBaseUri + '/tab-selections', JSON.stringify(tabSelections));
    }
  }
}

function restoreTabSelections() {
  if (window.localStorage) {
    var selectionsJSON = window.relearn.getItem(window.localStorage, window.relearn.absBaseUri + '/tab-selections');
    if (selectionsJSON) {
      var tabSelections = JSON.parse(selectionsJSON);
    } else {
      var tabSelections = {};
    }
    Object.keys(tabSelections).forEach(function (tabGroup) {
      var tabItem = tabSelections[tabGroup];
      switchTab(tabGroup, tabItem);
    });
  }
}

function initMermaid(update, attrs) {
  if (!window.relearn.themeUseMermaid) {
    return;
  }
  var doBeside = true;
  var isImageRtl = isRtl;

  // we are either in update or initialization mode;
  // during initialization, we want to edit the DOM;
  // during update we only want to execute if something changed
  var decodeHTML = function (html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };
  var encodeHTML = function (text) {
    var html = document.createElement('textarea');
    html.textContent = text;
    return html.innerHTML;
  };

  var parseGraph = function (graph) {
    // See https://github.com/mermaid-js/mermaid/blob/9a080bb975b03b2b1d4ef6b7927d09e6b6b62760/packages/mermaid/src/diagram-api/frontmatter.ts#L10
    // for reference on the regex originally taken from jekyll
    var YAML = 1;
    var INIT = 2;
    var GRAPH = 3;
    var d = /^(?:\s*[\n\r])*(?:-{3}(\s*[\n\r](?:.*?)[\n\r])-{3}(?:\s*[\n\r]+)+)?(?:\s*(?:%%\s*\{\s*\w+\s*:([^%]*?)%%\s*[\n\r]?))?(.*)$/s;
    var m = d.exec(graph);
    var yaml = {};
    var dir = {};
    var content = graph;
    if (m && m.length == 4) {
      yaml = m[YAML] ? jsyaml.load(m[YAML]) : yaml;
      dir = m[INIT] ? JSON.parse('{ "init": ' + m[INIT]).init : dir;
      content = m[GRAPH] ? m[GRAPH] : content;
    }
    var ret = { yaml: yaml, dir: dir, content: content.trim() };
    return ret;
  };

  var serializeGraph = function (graph) {
    var yamlPart = '';
    if (Object.keys(graph.yaml).length) {
      yamlPart = '---\n' + jsyaml.dump(graph.yaml) + '---\n';
    }
    var dirPart = '';
    if (Object.keys(graph.dir).length) {
      dirPart = '%%{init: ' + JSON.stringify(graph.dir) + '}%%\n';
    }
    return yamlPart + dirPart + graph.content;
  };

  var init_func = function (attrs) {
    var is_initialized = false;
    var theme = attrs.theme;
    document.querySelectorAll('.mermaid').forEach(function (element) {
      var parse = parseGraph(decodeHTML(element.innerHTML));

      if (parse.yaml.theme) {
        parse.yaml.relearn_user_theme = true;
      }
      if (parse.dir.theme) {
        parse.dir.relearn_user_theme = true;
      }
      if (!parse.yaml.relearn_user_theme && !parse.dir.relearn_user_theme) {
        parse.yaml.theme = theme;
      }
      is_initialized = true;

      var graph = encodeHTML(serializeGraph(parse));
      var new_element = document.createElement('div');
      var hasActionbarWrapper = element.classList.contains('actionbar-wrapper');
      Array.from(element.attributes).forEach(function (attr) {
        new_element.setAttribute(attr.name, attr.value);
        element.removeAttribute(attr.name);
      });
      new_element.classList.add('mermaid-container');
      new_element.classList.remove('mermaid');
      new_element.classList.remove('actionbar-wrapper');
      element.classList.add('mermaid');
      if (hasActionbarWrapper) {
        element.classList.add('actionbar-wrapper');
      }

      element.innerHTML = graph;
      if (element.offsetParent !== null) {
        element.classList.add('mermaid-render');
      }
      new_element.innerHTML = '<div class="mermaid-code">' + graph + '</div>' + element.outerHTML;
      element.parentNode.replaceChild(new_element, element);
    });
    return is_initialized;
  };

  var update_func = function (attrs) {
    var is_initialized = false;
    var theme = attrs.theme;
    document.querySelectorAll('.mermaid-container').forEach(function (e) {
      var element = e.querySelector('.mermaid');
      var code = e.querySelector('.mermaid-code');
      var parse = parseGraph(decodeHTML(code.innerHTML));

      if (element.classList.contains('mermaid-render')) {
        if (parse.yaml.relearn_user_theme || parse.dir.relearn_user_theme) {
          return;
        }
        if (parse.yaml.theme == theme || parse.dir.theme == theme) {
          return;
        }
      }
      if (element.offsetParent !== null) {
        element.classList.add('mermaid-render');
      } else {
        element.classList.remove('mermaid-render');
        return;
      }
      is_initialized = true;

      parse.yaml.theme = theme;
      var graph = encodeHTML(serializeGraph(parse));
      element.removeAttribute('data-processed');
      element.innerHTML = graph;
      code.innerHTML = graph;
    });
    return is_initialized;
  };

  var state = this;
  if (update && !state.is_initialized) {
    return;
  }
  if (typeof mermaid == 'undefined' || typeof mermaid.mermaidAPI == 'undefined') {
    return;
  }

  if (!state.is_initialized) {
    state.is_initialized = true;
    window.addEventListener(
      'beforeprint',
      function () {
        isPrintPreview = true;
        initMermaid(true, {
          theme: getColorValue('PRINT-MERMAID-theme'),
        });
      }.bind(this)
    );
    window.addEventListener(
      'afterprint',
      function () {
        isPrintPreview = false;
        initMermaid(true);
      }.bind(this)
    );
  }

  attrs = attrs || {
    theme: getColorValue('MERMAID-theme'),
  };

  if (update) {
    unmark();
  }
  var is_initialized = update ? update_func(attrs) : init_func(attrs);
  if (is_initialized) {
    mermaid.initialize(Object.assign({ securityLevel: 'antiscript', startOnLoad: false }, window.relearn.mermaidConfig, { theme: attrs.theme }));
    mermaid.run({
      postRenderCallback: function (id) {
        // zoom for Mermaid
        // https://github.com/mermaid-js/mermaid/issues/1860#issuecomment-1345440607
        var svgs = d3.selectAll('body:not(.print) .mermaid-container.zoomable > .mermaid > #' + id);
        svgs.each(function () {
          var parent = this.parentElement;
          // we need to copy the maxWidth, otherwise our reset button will not align in the upper right
          parent.style.maxWidth = this.style.maxWidth || this.getAttribute('width');
          // if no unit is given for the width
          parent.style.maxWidth = parent.style.maxWidth || 'calc( ' + this.getAttribute('width') + 'px + 1rem )';
          var svg = d3.select(this);
          svg.html('<g>' + svg.html() + '</g>');
          var inner = svg.select('*:scope > g');
          parent.insertAdjacentHTML('beforeend', '<div class="actionbar"><span class="btn cstyle svg-reset-button action noborder notitle interactive"><button type="button" title="' + window.T_Reset_view + '"><i class="fa-fw fas fa-undo-alt"></i></button></span></div>');
          var wrapper = parent.querySelector('.svg-reset-button');
          var button = wrapper.querySelector('button');
          var zoom = d3.zoom().on('zoom', function (e) {
            inner.attr('transform', e.transform);
            if (e.transform.k == 1 && e.transform.x == 0 && e.transform.y == 0) {
              wrapper.classList.remove('zoomed');
            } else {
              wrapper.classList.add('zoomed');
            }
          });
          button.addEventListener('click', function () {
            this.blur();
            svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
            showToast(window.T_View_reset);
          });
          svg.call(zoom);
        });
        // we need to mark again once the SVGs were drawn
        // to mark terms inside an SVG;
        // as we can not determine when all graphs are done,
        // we debounce the call
        debounce(mark, 200)();
      },
      querySelector: '.mermaid.mermaid-render',
      suppressErrors: true,
    });
  }
  if (update) {
    // if the page loads Mermaid but does not contain any
    // graphs, we will not call the above debounced mark()
    // and have to do it at least once here to redo our unmark()
    // call from the beginning of this function
    debounce(mark, 200)();
  }
}

function initOpenapi(update, attrs) {
  if (!window.relearn.themeUseOpenapi) {
    return;
  }
  var state = this;
  if (update && !state.is_initialized) {
    return;
  }

  if (!state.is_initialized) {
    state.is_initialized = true;
    window.addEventListener(
      'beforeprint',
      function () {
        isPrintPreview = true;
        initOpenapi(true);
      }.bind(this)
    );
    window.addEventListener(
      'afterprint',
      function () {
        isPrintPreview = false;
        initOpenapi(true);
      }.bind(this)
    );
  }

  attrs = attrs || {};

  function addFunctionToResizeEvent() {}
  function getFirstAncestorByClass() {}
  function renderOpenAPI(oc) {
    var relBasePath = window.relearn.relBasePath;
    var assetBuster = window.relearn.themeUseOpenapi.assetsBuster;
    var print = isPrint || isPrintPreview ? 'PRINT-' : '';
    var format = print ? `print` : `html`;
    var min = window.relearn.min;
    var theme = `${relBasePath}/css/format-${format}${min}.css${assetBuster}`;
    var variant = document.documentElement.dataset.rThemeVariant;
    var swagger_theme = getColorValue(print + 'OPENAPI-theme');
    var swagger_code_theme = getColorValue(print + 'OPENAPI-CODE-theme');

    const openapiId = 'relearn-swagger-ui';
    const openapiIframeId = openapiId + '-iframe';
    const openapiIframe = document.getElementById(openapiIframeId);
    if (openapiIframe) {
      openapiIframe.remove();
    }
    const openapiErrorId = openapiId + '-error';
    const openapiError = document.getElementById(openapiErrorId);
    if (openapiError) {
      openapiError.remove();
    }
    const oi = document.createElement('iframe');
    oi.id = openapiIframeId;
    oi.classList.toggle('sc-openapi-iframe', true);
    oi.srcdoc = `<!doctype html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}" data-r-output-format="${format}" data-r-theme-variant="${variant}">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="${window.relearn.themeUseOpenapi.css}${assetBuster}">
    <link rel="stylesheet" href="${relBasePath}/css/swagger${min}.css${assetBuster}">
    <link rel="stylesheet" href="${relBasePath}/css/swagger-${swagger_theme}${min}.css${assetBuster}">
    <link rel="stylesheet" href="${theme}">
    <script>
      function relearn_expand_all() {
        document.querySelectorAll(".expand-operation[aria-expanded=false]").forEach(btn => btn.click());
        document.querySelectorAll(".models-control[aria-expanded=false]").forEach(btn => btn.click());
        document.querySelectorAll(".opblock-summary-control[aria-expanded=false]").forEach(btn => btn.click());
        document.querySelectorAll(".model-container > .model-box > button[aria-expanded=false]").forEach(btn => btn.click());
        return false;
      }
      function relearn_collapse_all() {
        document.querySelectorAll(".expand-operation[aria-expanded=true]").forEach(btn => btn.click());
        document.querySelectorAll(".models-control[aria-expanded=true]").forEach(btn => btn.click());
        document.querySelectorAll(".opblock-summary-control[aria-expanded=true]").forEach(btn => btn.click());
        document.querySelectorAll(".model-container > .model-box > .model-box > .model > span > button[aria-expanded=true]").forEach(btn => btn.click());
        return false;
      }
    </script>
  </head>
  <body>
    <a class="relearn-expander" href="" onclick="return relearn_collapse_all()">Collapse all</a>
    <a class="relearn-expander" href="" onclick="return relearn_expand_all()">Expand all</a>
    <div id="relearn-swagger-ui"></div>
  </body>
</html>`;
    oi.height = '100%';
    oi.width = '100%';
    oi.onload = function () {
      const openapiWrapper = getFirstAncestorByClass(oc, 'sc-openapi-wrapper');
      const openapiPromise = new Promise(function (resolve) {
        resolve();
      });
      openapiPromise
        .then(function () {
          var options = {
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: isPrint || isPrintPreview ? 'full' : 'list',
            domNode: oi.contentWindow.document.getElementById(openapiId),
            filter: !(isPrint || isPrintPreview),
            layout: 'BaseLayout',
            onComplete: function () {
              if (isPrint || isPrintPreview) {
                oi.contentWindow.document.querySelectorAll('.model-container > .model-box > button[aria-expanded=false]').forEach(function (btn) {
                  btn.click();
                });
                setOpenAPIHeight(oi);
              }
            },
            plugins: [SwaggerUIBundle.plugins.DownloadUrl],
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
            syntaxHighlight: {
              activated: true,
              theme: swagger_code_theme,
            },
            validatorUrl: 'none',
          };
          if (oc.dataset.openapiSpec) {
            try {
              Object.assign(options, { spec: JSON.parse(oc.dataset.openapiSpec) });
            } catch (err) {
              try {
                Object.assign(options, { spec: jsyaml.load(oc.dataset.openapiSpec) });
              } catch (err) {
                console.error('OpenAPI: file "' + oc.dataset.openapiUrl + '" could not be parsed as JSON or YAML');
              }
            }
          } else {
            Object.assign(options, { url: oc.dataset.openapiUrl });
          }
          SwaggerUIBundle(options);
        })
        .then(function () {
          let observerCallback = function () {
            setOpenAPIHeight(oi);
          };
          let observer = new MutationObserver(observerCallback);
          observer.observe(oi.contentWindow.document.documentElement, {
            childList: true,
            subtree: true,
          });
        })
        .then(function () {
          if (openapiWrapper) {
            openapiWrapper.classList.toggle('is-loading', false);
          }
          setOpenAPIHeight(oi);
        })
        .catch(function (error) {
          const ed = document.createElement('div');
          ed.classList.add('sc-alert', 'sc-alert-error');
          ed.innerHTML = error;
          ed.id = openapiErrorId;
          while (oc.lastChild) {
            oc.removeChild(oc.lastChild);
          }
          if (openapiWrapper) {
            openapiWrapper.classList.toggle('is-loading', false);
            openapiWrapper.insertAdjacentElement('afterbegin', ed);
          }
        });
    };
    oc.appendChild(oi);
  }
  function setOpenAPIHeight(oi) {
    // add empirical offset if in print preview (GC 103)
    oi.style.height = oi.contentWindow.document.documentElement.getBoundingClientRect().height + (isPrintPreview ? 200 : 0) + 'px';
  }
  function resizeOpenAPI() {
    let divi = document.getElementsByClassName('sc-openapi-iframe');
    for (let i = 0; i < divi.length; i++) {
      setOpenAPIHeight(divi[i]);
    }
  }
  let divo = document.getElementsByClassName('sc-openapi-container');
  for (let i = 0; i < divo.length; i++) {
    renderOpenAPI(divo[i]);
  }
  if (divo.length) {
    addFunctionToResizeEvent(resizeOpenAPI);
  }
}

function initAnchorClipboard() {
  const url = document.location.origin == 'null' ? `${document.location.protocol}//${document.location.host}${document.location.pathname}` : `${document.location.origin}${document.location.pathname}`;

  const anchors = Array.from(document.querySelectorAll('.anchor'));
  for (const anchor of anchors) {
    const id = encodeURIComponent(anchor.parentElement.id);
    anchor.setAttribute('data-clipboard-text', `${url}#${id}`);

    if (anchor.classList.contains('copyanchor')) {
      anchor.addEventListener('click', function () {
        this.blur();
        if (!navigator.clipboard?.writeText) {
          showToast(window.T_Browser_unsupported_feature);
          return;
        }
        const text = this.getAttribute('data-clipboard-text');
        navigator.clipboard.writeText(text);
        showToast(window.T_Link_copied_to_clipboard);
      });
    }
    if (anchor.classList.contains('scrollanchor')) {
      anchor.addEventListener('click', function () {
        this.parentElement.scrollIntoView({ behavior: 'smooth' });
        let state = window.history.state || {};
        state = Object.assign({}, typeof state === 'object' ? state : {});
        history.pushState({}, '', this.dataset.clipboardText);
      });
    }
  }
}

function initCodeClipboard() {
  function getCodeText(node) {
    // if highlight shortcode is used in inline lineno mode, remove lineno nodes before generating text, otherwise it doesn't hurt
    var code = node.cloneNode(true);
    Array.from(code.querySelectorAll('*:scope > span > span:first-child:not(:last-child)')).forEach(function (lineno) {
      lineno.remove();
    });
    var text = code.textContent;
    // remove a trailing line break, this may most likely
    // come from the browser / Hugo transformation
    text = text.replace(/\n$/, '');
    return text;
  }

  document.addEventListener('copy', function (ev) {
    // shabby FF generates empty lines on cursor selection that we need to filter out; see #925
    var selection = document.getSelection();
    var node = selection.anchorNode;

    // in case of GC, it works without this handler;
    // instead GC fails if this handler is active, because it still contains
    // the line number nodes with class 'ln' in the selection, although
    // they are flagged with 'user-select: none;' see https://issues.chromium.org/issues/41393366;
    // so in case of GC we don't want to do anything and bail out early in below code
    function selectionContainsLnClass(selection) {
      for (var i = 0; i < selection.rangeCount; i++) {
        var range = selection.getRangeAt(i);
        var fragment = range.cloneContents();
        if (fragment.querySelector('.ln') || fragment.querySelector('[id]')) {
          return true;
        }
      }
      return false;
    }

    if (!selectionContainsLnClass(selection)) {
      while (node) {
        // selection could start in a text node, so account for this as it
        // obviously does not support `classList`
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('highlight')) {
          // only do this if we are inside of a code highlight node;
          // now fix FFs selection by calculating the text ourself
          var text = selection.toString();
          ev.clipboardData.setData('text/plain', text);
          ev.preventDefault();
          break;
        }
        node = node.parentNode;
      }
    }
  });

  var preOnlyElements = document.querySelectorAll('pre:not(.mermaid) > :not(code), pre:not(.mermaid):not(:has(>*))');
  for (var i = 0; i < preOnlyElements.length; i++) {
    // move everything down one level so that it fits to the next selector
    // and we also get copy-to-clipboard for pre-only elements
    var pre = preOnlyElements[i];
    var div = document.createElement('div');
    div.classList.add('pre-only');
    while (pre.firstChild) {
      div.appendChild(pre.firstChild);
    }
    pre.appendChild(div, pre);
  }

  var codeElements = document.querySelectorAll('code, .pre-only');
  for (var i = 0; i < codeElements.length; i++) {
    var code = codeElements[i];
    var text = getCodeText(code);
    var inPre = code.parentNode.tagName.toLowerCase() == 'pre';
    var inTable = inPre && code.parentNode.parentNode.tagName.toLowerCase() == 'td' && code.parentNode.parentNode.classList.contains('lntd');
    // avoid copy-to-clipboard for highlight shortcode in table lineno mode
    var isFirstLineCell = inTable && code.parentNode.parentNode.parentNode.querySelector('td:first-child > pre > code') == code;
    var isBlock = inTable || inPre;
    var inHeading = false;
    var parent = code.parentNode;
    while (parent && parent !== document) {
      if (/^h[1-6]$/i.test(parent.tagName)) {
        inHeading = true;
        break;
      }
      parent = parent.parentNode;
    }

    if (!isFirstLineCell && (inPre || text.length > 5)) {
      code.classList.add('copy-to-clipboard-code');
      if (inPre) {
        code.classList.add('copy-to-clipboard');
        code.parentNode.classList.add('pre-code');
      } else {
        var clone = code.cloneNode(true);
        var span = document.createElement('span');
        span.classList.add('copy-to-clipboard');
        span.setAttribute('dir', 'auto');
        span.appendChild(clone);
        code.parentNode.replaceChild(span, code);
        code = clone;
      }
      var button = null;
      var insertElement = null;
      var wrapper = null;
      var actionbar = null;
      if (isBlock || (!window.relearn.disableInlineCopyToClipboard && !inHeading)) {
        button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('title', window.T_Copy_to_clipboard);

        if (isBlock) {
          // Wrap in actionbar structure for block buttons
          button.innerHTML = '<i class="fa-fw far fa-copy"></i>';
          wrapper = document.createElement('span');
          wrapper.classList.add('btn', 'cstyle', 'block-copy-to-clipboard-button', 'action', 'noborder', 'notitle', 'interactive');
          wrapper.appendChild(button);
          actionbar = document.createElement('div');
          actionbar.className = 'actionbar';
          actionbar.appendChild(wrapper);
          insertElement = actionbar;
        } else {
          // Simple button for inline buttons (unchanged)
          button.innerHTML = '<i class="far fa-copy"></i>';
          button.classList.add('inline-copy-to-clipboard-button');
          insertElement = button;
        }
      }
      if (inTable) {
        var table = code.parentNode.parentNode.parentNode.parentNode.parentNode;
        table.dataset.code = text;
        table.parentNode.insertBefore(insertElement, table.nextSibling);
      } else if (inPre) {
        var pre = code.parentNode;
        pre.dataset.code = text;
        var p = pre.parentNode;
        // html <pre><code> constructs and indented code blocks are missing the div
        while (p != document && (p.tagName.toLowerCase() != 'div' || !p.classList.contains('highlight'))) {
          p = p.parentNode;
        }
        if (p == document) {
          var clone = pre.cloneNode(true);
          var div = document.createElement('div');
          div.classList.add('highlight', 'actionbar-wrapper');
          if (window.relearn.enableBlockCodeWrap) {
            div.classList.add('wrap-code');
          }
          div.setAttribute('dir', 'auto');
          div.appendChild(clone);
          pre.parentNode.replaceChild(div, pre);
          pre = clone;
        }
        pre.parentNode.insertBefore(insertElement, pre.nextSibling);
      } else {
        code.classList.add('highlight');
        code.dataset.code = text;
        if (insertElement) {
          code.parentNode.insertBefore(insertElement, code.nextSibling);
        }
      }
    }
  }

  var buttons = document.querySelectorAll('.block-copy-to-clipboard-button button, .inline-copy-to-clipboard-button');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      this.blur();
      if (!navigator.clipboard?.writeText) {
        showToast(window.T_Browser_unsupported_feature);
        return;
      }
      // For block buttons, get the actionbar's previous sibling; for inline, use trigger's previous sibling
      var codeElement = this.closest('.actionbar') ? this.closest('.actionbar').previousElementSibling : this.previousElementSibling;
      if (!codeElement) {
        return;
      }
      var text = codeElement.dataset.code || '';
      navigator.clipboard.writeText(text);
      showToast(window.T_Copied_to_clipboard);
    });
  });
}

function initArrowVerticalNav() {
  var topMain = 0;
  if (!isPrint) {
    topMain = document.querySelector('main').getClientRects()[0].top;
  }

  document.addEventListener('keydown', function (event) {
    var elems = Array.from(
      document.querySelectorAll(`main :not(.include.hide-first-heading) > :where(
                .article-subheading,
                :not(.article-subheading) + h1:not(.a11y-only),
                h1:not(.a11y-only):first-child,
                h2, h3, h4, h5, h6
            ),
            main .include.hide-first-heading > :where( h1, h2, h3, h4, h5, h6 ) ~ :where( h1, h2, h3, h4, h5, h6 )
        `)
    );
    if (!event.shiftKey && !event.ctrlKey && event.altKey && !event.metaKey) {
      if (event.which == 38) {
        // up
        var target = isPrint ? document.querySelector('#R-body') : document.querySelector('.flex-block-wrapper');
        elems.some(function (elem, i) {
          var top = elem.getBoundingClientRect().top;
          var topBoundary = top - topMain;
          if (topBoundary > -1) {
            target.scrollIntoView();
            return true;
          }
          target = elem;
        });
      } else if (event.which == 40) {
        // down
        elems.some(function (elem, i) {
          var top = elem.getBoundingClientRect().top;
          var topBoundary = top - topMain;
          if (topBoundary > -1 && topBoundary < 1) {
            if (i + 1 < elems.length) {
              var target = elems[i + 1];
              target.scrollIntoView();
            }
            return true;
          }
          if (topBoundary >= 1) {
            var target = elem;
            target.scrollIntoView();
            return true;
          }
        });
      }
    }
  });
}

function initArrowHorizontalNav() {
  if (isPrint) {
    return;
  }

  // button navigation
  var prev = document.querySelector('.topbar-button-prev a');
  var next = document.querySelector('.topbar-button-next a');

  // keyboard navigation
  // avoid prev/next navigation if we are not at the start/end of the
  // horizontal area
  var el = document.querySelector('#R-body-inner');
  var scrollStart = 0;
  var scrollEnd = 0;
  document.addEventListener('keydown', function (event) {
    if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      var f = event.target.matches(formelements);
      if (f) {
        return;
      }
      if (event.which == dir_key_start) {
        if (!scrollStart && +el.scrollLeft.toFixed() * dir_scroll <= 0) {
          prev && prev.click();
        } else if (scrollStart != -1) {
          clearTimeout(scrollStart);
        }
        scrollStart = -1;
      }
      if (event.which == dir_key_end) {
        if (!scrollEnd && +el.scrollLeft.toFixed() * dir_scroll + +el.clientWidth.toFixed() >= +el.scrollWidth.toFixed()) {
          next && next.click();
        } else if (scrollEnd != -1) {
          clearTimeout(scrollEnd);
        }
        scrollEnd = -1;
      }
    }
  });
  document.addEventListener('keyup', function (event) {
    if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      var f = event.target.matches(formelements);
      if (f) {
        return;
      }
      if (event.which == dir_key_start) {
        // check for false indication if keyup is delayed after navigation
        if (scrollStart == -1) {
          scrollStart = setTimeout(function () {
            scrollStart = 0;
          }, 300);
        }
      }
      if (event.which == dir_key_end) {
        if (scrollEnd == -1) {
          scrollEnd = setTimeout(function () {
            scrollEnd = 0;
          }, 300);
        }
      }
    }
  });
}

function initMenuScrollbar() {
  if (isPrint) {
    return;
  }

  var elm = document.querySelector('#R-content-wrapper');
  var elt = document.querySelector('.topbar-button.topbar-flyout .topbar-content-wrapper');

  var autofocus = true;
  document.addEventListener('keydown', function (event) {
    // for initial keyboard scrolling support, no element
    // may be hovered, but we still want to react on
    // cursor/page up/down. because we can't hack
    // the scrollbars implementation, we try to trick
    // it and give focus to the scrollbar - only
    // to just remove the focus right after scrolling
    // happend
    autofocus = false;
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.which < 32 || event.which > 40) {
      // if tab key was pressed, we are ended with our initial
      // focus job
      return;
    }

    var c = elc && elc.matches(':hover');
    var m = elm && elm.matches(':hover');
    var t = elt && elt.matches(':hover');
    var f = event.target.matches(formelements);
    if (!c && !m && !t && !f) {
      // only do this hack if none of our scrollbars
      // is hovered
      // if we are showing the sidebar as a flyout we
      // want to scroll the content-wrapper, otherwise we want
      // to scroll the body
      var nt = document.querySelector('body').matches('.topbar-flyout');
      var nm = document.querySelector('body').matches('.sidebar-flyout');
      if (nt) {
        var psb = pst.get(document.querySelector('.topbar-button.topbar-flyout'));
        psb && psb.scrollbarY.focus();
      } else if (nm) {
        psm && psm.scrollbarY.focus();
      } else {
        document.querySelector('#R-body-inner').focus();
        psc && psc.scrollbarY.focus();
      }
    }
  });
  // scrollbars will install their own keyboard handlers
  // that need to be executed inbetween our own handlers
  // PSC removed for #242 #243 #244
  // psc = elc && new PerfectScrollbar('#R-body-inner');
  psm = elm && new PerfectScrollbar('#R-content-wrapper', { scrollingThreshold: 2000, swipeEasing: false, wheelPropagation: false });
  document.querySelectorAll('.topbar-button .topbar-content-wrapper').forEach(function (e) {
    var button = getTopbarButtonParent(e);
    if (!button) {
      return;
    }
    pst.set(button, new PerfectScrollbar(e, { scrollingThreshold: 2000, swipeEasing: false, wheelPropagation: false }));
    e.addEventListener('click', toggleTopbarFlyoutEvent);
  });

  document.addEventListener('keydown', function () {
    // if we facked initial scrolling, we want to
    // remove the focus to not leave visual markers on
    // the scrollbar
    if (autofocus) {
      psc && psc.scrollbarY.blur();
      psm && psm.scrollbarY.blur();
      pst.forEach(function (psb) {
        psb.scrollbarY.blur();
      });
      autofocus = false;
    }
  });
  // on resize, we have to redraw the scrollbars to let new height
  // affect their size
  window.addEventListener('resize', function () {
    pst.forEach(function (psb) {
      setTimeout(function () {
        psb.update();
      }, 10);
    });
    psm &&
      setTimeout(function () {
        psm.update();
      }, 10);
    psc &&
      setTimeout(function () {
        psc.update();
      }, 10);
  });
  // now that we may have collapsible menus, we need to call a resize
  // for the menu scrollbar if sections are expanded/collapsed
  document.querySelectorAll('#R-sidebar .collapsible-menu input').forEach(function (e) {
    e.addEventListener('change', function () {
      psm &&
        setTimeout(function () {
          psm.update();
        }, 10);
    });
  });
  // bugfix for PS in RTL mode: the initial scrollbar position is off;
  // calling update() once, fixes this
  pst.forEach(function (psb) {
    setTimeout(function () {
      psb.update();
    }, 10);
  });
  psm &&
    setTimeout(function () {
      psm.update();
    }, 10);
  psc &&
    setTimeout(function () {
      psc.update();
    }, 10);

  // finally, we want to adjust the contents end padding if there is a scrollbar visible
  window.addEventListener('resize', adjustContentWidth);
  adjustContentWidth();
}

function imageEscapeHandler(event) {
  if (event.key == 'Escape') {
    var image = event.target;
    image.click();
  }
}

function navShortcutHandler(event) {
  if (!event.shiftKey && event.altKey && event.ctrlKey && !event.metaKey && event.which == 78 /* n */) {
    toggleNav();
  }
}

function searchShortcutHandler(event) {
  if (!event.shiftKey && event.altKey && event.ctrlKey && !event.metaKey && event.which == 70 /* f */) {
    showSearch();
  }
}

function tocShortcutHandler(event) {
  if (!event.shiftKey && event.altKey && event.ctrlKey && !event.metaKey && event.which == 84 /* t */) {
    toggleToc();
  }
}

function editShortcutHandler(event) {
  if (!event.shiftKey && event.altKey && event.ctrlKey && !event.metaKey && event.which == 87 /* w */) {
    showEdit();
  }
}

function printShortcutHandler(event) {
  if (!event.shiftKey && event.altKey && event.ctrlKey && !event.metaKey && event.which == 80 /* p */) {
    showPrint();
  }
}

function showSearch() {
  var s = document.querySelector('#R-search-by');
  if (!s) {
    return;
  }
  var b = document.querySelector('body');
  if (s == document.activeElement) {
    if (b.classList.contains('sidebar-flyout')) {
      closeNav();
    }
    documentFocus();
  } else {
    if (!b.classList.contains('sidebar-flyout')) {
      openNav();
    }
    s.focus();
  }
}

function openNav() {
  closeSomeTopbarButtonFlyout();
  var b = document.querySelector('body');
  b.classList.add('sidebar-flyout');
  psm &&
    setTimeout(function () {
      psm.update();
    }, 10);
  psm && psm.scrollbarY.focus();
  var a = document.querySelector('#R-sidebar a');
  if (a) {
    a.focus();
  }
}

function closeNav() {
  var b = document.querySelector('body');
  b.classList.remove('sidebar-flyout');
  documentFocus();
}

function toggleNav() {
  var b = document.querySelector('body');
  if (b.classList.contains('sidebar-flyout')) {
    closeNav();
  } else {
    openNav();
  }
}

function navEscapeHandler(event) {
  if (event.key == 'Escape') {
    closeNav();
  }
}

function getTopbarButtonParent(e) {
  var button = e;
  while (button && !button.classList.contains('topbar-button')) {
    button = button.parentElement;
  }
  return button;
}

function openTopbarButtonFlyout(button) {
  closeNav();
  var body = document.querySelector('body');
  button.classList.add('topbar-flyout');
  body.classList.add('topbar-flyout');
  var psb = pst.get(button);
  psb &&
    setTimeout(function () {
      psb.update();
    }, 10);
  psb && psb.scrollbarY.focus();
  var a = button.querySelector('.topbar-content-wrapper a');
  if (a) {
    a.focus();
  }
}

function closeTopbarButtonFlyout(button) {
  var body = document.querySelector('body');
  button.classList.remove('topbar-flyout');
  body.classList.remove('topbar-flyout');
  documentFocus();
}

function closeSomeTopbarButtonFlyout() {
  var someButton = document.querySelector('.topbar-button.topbar-flyout');
  if (someButton) {
    closeTopbarButtonFlyout(someButton);
  }
  return someButton;
}

function toggleTopbarButtonFlyout(button) {
  var someButton = closeSomeTopbarButtonFlyout();
  if (button && button != someButton) {
    openTopbarButtonFlyout(button);
  }
}

function toggleTopbarFlyout(e) {
  var button = getTopbarButtonParent(e);
  if (!button) {
    return;
  }
  toggleTopbarButtonFlyout(button);
}

function toggleTopbarFlyoutEvent(event) {
  if (event.target.classList.contains('topbar-content') || event.target.classList.contains('topbar-content-wrapper') || event.target.classList.contains('ps__rail-x') || event.target.classList.contains('ps__rail-y') || event.target.classList.contains('ps__thumb-x') || event.target.classList.contains('ps__thumb-y')) {
    // the scrollbar was used, don't close flyout
    return;
  }
  toggleTopbarFlyout(event.target);
}

function topbarFlyoutEscapeHandler(event) {
  if (event.key == 'Escape') {
    closeSomeTopbarButtonFlyout();
  }
}

function toggleToc() {
  toggleTopbarButtonFlyout(document.querySelector('.topbar-button-toc'));
}

function showEdit() {
  var l = document.querySelector('.topbar-button-edit a');
  if (l) {
    l.click();
  }
}

function showPrint() {
  var l = document.querySelector('.topbar-button-print a');
  if (l) {
    l.click();
  }
}

function initToc() {
  if (isPrint) {
    return;
  }

  document.addEventListener('keydown', editShortcutHandler);
  document.addEventListener('keydown', navShortcutHandler);
  document.addEventListener('keydown', printShortcutHandler);
  document.addEventListener('keydown', searchShortcutHandler);
  document.addEventListener('keydown', tocShortcutHandler);
  document.addEventListener('keydown', navEscapeHandler);
  document.addEventListener('keydown', topbarFlyoutEscapeHandler);

  var b = document.querySelector('#R-body-overlay');
  if (b) {
    b.addEventListener('click', closeNav);
  }
  var m = document.querySelector('#R-main-overlay');
  if (m) {
    m.addEventListener('click', closeSomeTopbarButtonFlyout);
  }

  // finally give initial focus to allow keyboard scrolling in FF
  documentFocus();
}

function initSwipeHandler() {
  if (!touchsupport) {
    return;
  }

  var startx = null;
  var starty = null;
  var handleStartX = function (evt) {
    startx = evt.touches[0].clientX;
    starty = evt.touches[0].clientY;
  };
  var handleMoveX = function (evt) {
    if (startx !== null) {
      var diffx = startx - evt.touches[0].clientX;
      var diffy = starty - evt.touches[0].clientY || 0.1;
      if (diffx / Math.abs(diffy) < 2) {
        // detect mostly vertical swipes and reset our starting pos
        // to not detect a horizontal move if vertical swipe is unprecise
        startx = evt.touches[0].clientX;
      } else if (diffx > 30) {
        startx = null;
        starty = null;
        closeNav();
      }
    }
  };
  var handleEndX = function (evt) {
    startx = null;
    starty = null;
  };

  var s = document.querySelector('#R-body-overlay');
  s && s.addEventListener('touchstart', handleStartX, { capture: false, passive: true });
  document.querySelector('#R-sidebar').addEventListener('touchstart', handleStartX, { capture: false, passive: true });
  document.querySelectorAll('#R-sidebar *').forEach(function (e) {
    e.addEventListener('touchstart', handleStartX, { capture: false, passive: true });
  });
  s && s.addEventListener('touchmove', handleMoveX, { capture: false, passive: true });
  document.querySelector('#R-sidebar').addEventListener('touchmove', handleMoveX, { capture: false, passive: true });
  document.querySelectorAll('#R-sidebar *').forEach(function (e) {
    e.addEventListener('touchmove', handleMoveX, { capture: false, passive: true });
  });
  s && s.addEventListener('touchend', handleEndX, { capture: false, passive: true });
  document.querySelector('#R-sidebar').addEventListener('touchend', handleEndX, { capture: false, passive: true });
  document.querySelectorAll('#R-sidebar *').forEach(function (e) {
    e.addEventListener('touchend', handleEndX, { capture: false, passive: true });
  });
}

function initImage() {
  document.querySelectorAll('.lightbox-back').forEach(function (e) {
    e.addEventListener('keydown', imageEscapeHandler);
  });
}

function initExpand() {
  document.querySelectorAll('.expand > input').forEach(function (e) {
    e.addEventListener('change', initMermaid.bind(null, true, null));
  });
}

function clearHistory() {
  var visitedItem = window.relearn.absBaseUri + '/visited-url/';
  for (var item in window.sessionStorage) {
    if (item.substring(0, visitedItem.length) === visitedItem) {
      window.relearn.removeItem(window.sessionStorage, item);
      var url = item.substring(visitedItem.length);
      // in case we have `relativeURLs=true` we have to strip the
      // relative path to root
      url = url.replace(/\.\.\//g, '/').replace(/^\/+\//, '/');
      document.querySelectorAll('[data-nav-url="' + url + '"]').forEach(function (e) {
        e.classList.remove('visited');
      });
    }
  }
}

function initHistory() {
  var visitedItem = window.relearn.absBaseUri + '/visited-url/';
  window.relearn.setItem(window.sessionStorage, visitedItem + document.querySelector('body').dataset.url, 1);

  // loop through the sessionStorage and see if something should be marked as visited
  for (var item in window.sessionStorage) {
    if (item.substring(0, visitedItem.length) === visitedItem && window.relearn.getItem(window.sessionStorage, item) == 1) {
      var url = item.substring(visitedItem.length);
      // in case we have `relativeURLs=true` we have to strip the
      // relative path to root
      url = url.replace(/\.\.\//g, '/').replace(/^\/+\//, '/');
      document.querySelectorAll('[data-nav-url="' + url + '"]').forEach(function (e) {
        e.classList.add('visited');
      });
    }
  }
}

function initScrollPositionSaver() {
  function savePosition(event) {
    // #959 if we fiddle around with the history during print preview
    // GC will close the preview immediatley
    if (isPrintPreview) {
      return;
    }
    var state = window.history.state || {};
    state = Object.assign({}, typeof state === 'object' ? state : {});
    state.contentScrollTop = +elc.scrollTop;
    window.history.replaceState(state, '');
  }

  var ticking = false;
  elc.addEventListener('scroll', function (event) {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        // #996 GC is so damn slow that we need further throttling
        debounce(savePosition, 200)();
        ticking = false;
      });
      ticking = true;
    }
  });

  document.addEventListener('click', savePosition);
}

function scrollToPositions() {
  // show active menu entry
  window.setTimeout(function () {
    var e = document.querySelector('#R-sidebar li.active a');
    if (e && e.scrollIntoView) {
      e.scrollIntoView({
        block: 'center',
      });
    }
  }, 10);

  // scroll the content to point of interest;
  // if we have a scroll position saved, the user was here
  // before in his history stack and we want to reposition
  // to the position he was when he left the page;
  // otherwise if he used page search before, we want to position
  // to its last outcome;
  // otherwise he may want to see a specific fragment

  var state = window.history.state || {};
  state = typeof state === 'object' ? state : {};
  if (state.hasOwnProperty('contentScrollTop')) {
    window.setTimeout(function () {
      elc.scrollTop = +state.contentScrollTop;
    }, 10);
    return;
  }

  var search = window.relearn.getItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
  var words = (search ?? '').split(' ').filter((word) => word.trim() != '');
  if (words && words.length) {
    var found = elementContains(words, elc);
    var searchedElem = found.length && found[0];
    if (searchedElem) {
      searchedElem.scrollIntoView();
      var scrolledY = window.scrollY;
      if (scrolledY) {
        window.scroll(0, scrolledY - 125);
      }
    }
    return;
  }

  if (window.location.hash && window.location.hash.length > 1) {
    window.setTimeout(function () {
      try {
        var e = document.querySelector(window.location.hash);
        if (e && e.scrollIntoView) {
          e.scrollIntoView();
        }
      } catch (e) {}
    }, 10);
    return;
  }
}

function handleHistoryClearer() {
  document.querySelectorAll('.R-historyclearer button').forEach(function (select) {
    select.addEventListener('click', function (event) {
      clearHistory();
    });
  });
}

function handleLanguageSwitcher() {
  document.querySelectorAll('.R-languageswitcher select').forEach(function (select) {
    select.addEventListener('change', function (event) {
      const url = this.options[`R-select-language-${this.value}`].dataset.url;
      this.value = this.querySelector('[data-selected]')?.value ?? select.value;
      window.location = url;
    });
  });
}

function handleVariantSwitcher() {
  document.querySelectorAll('.R-variantswitcher select').forEach(function (select) {
    select.addEventListener('change', function (event) {
      window.relearn.changeVariant(this.value);
    });
  });
}

function handleVersionSwitcher() {
  document.querySelectorAll('.R-versionswitcher select').forEach(function (select) {
    select.addEventListener('change', function (event) {
      const url = (this.options[`R-select-version-${this.value}`].dataset.abs == 'true' ? '' : window.relearn.relBaseUri) + this.options[`R-select-version-${this.value}`].dataset.uri + window.relearn.path;
      this.value = this.querySelector('[data-selected]')?.value ?? select.value;
      window.location = url;
    });
  });
}

window.addEventListener('popstate', function (event) {
  scrollToPositions();
});

const observer = new PerformanceObserver(function () {
  scrollToPositions();
});
observer.observe({ type: 'navigation' });

function mark() {
  var search = window.relearn.getItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
  var words = (search ?? '').split(' ').filter((word) => word.trim() != '');
  if (!words || !words.length) {
    return;
  }

  // mark some additional stuff as searchable
  var bodyInnerLinks = document.querySelectorAll('#R-body-inner a:not(.lightbox-link):not(.btn):not(.lightbox-back)');
  for (var i = 0; i < bodyInnerLinks.length; i++) {
    bodyInnerLinks[i].classList.add('highlight');
  }

  var highlightableElements = document.querySelectorAll('.highlightable');
  highlight(highlightableElements, words, { element: 'mark', className: 'search' });

  var markedElements = document.querySelectorAll('mark.search');
  for (var i = 0; i < markedElements.length; i++) {
    var parent = markedElements[i].parentNode;
    while (parent && parent.classList) {
      if (parent.classList.contains('expand')) {
        var expandInputs = parent.querySelectorAll('input:not(.expand-marked)');
        if (expandInputs.length) {
          expandInputs[0].classList.add('expand-marked');
          expandInputs[0].dataset.checked = expandInputs[0].checked ? 'true' : 'false';
          expandInputs[0].checked = true;
        }
      }
      if (parent.tagName.toLowerCase() === 'li' && parent.parentNode && parent.parentNode.tagName.toLowerCase() === 'ul' && parent.parentNode.classList.contains('collapsible-menu')) {
        var toggleInputs = parent.querySelectorAll('input:not(.menu-marked)');
        if (toggleInputs.length) {
          toggleInputs[0].classList.add('menu-marked');
          toggleInputs[0].dataset.checked = toggleInputs[0].checked ? 'true' : 'false';
          toggleInputs[0].checked = true;
        }
      }
      parent = parent.parentNode;
    }
  }
  psm &&
    setTimeout(function () {
      psm.update();
    }, 10);
}
window.relearn.markSearch = mark;

function highlight(es, words, options) {
  var settings = {
    className: 'highlight',
    element: 'span',
    caseSensitive: false,
    wordsOnly: false,
  };
  Object.assign(settings, options);

  if (!words.length) {
    return;
  }
  words = words.map(function (word, i) {
    return regexEscape(word);
  });

  var flag = settings.caseSensitive ? '' : 'i';
  var pattern = '(' + words.join('|') + ')';
  if (settings.wordsOnly) {
    pattern = '\\b' + pattern + '\\b';
  }
  var re = new RegExp(pattern, flag);

  for (var i = 0; i < es.length; i++) {
    highlightNode(es[i], re, settings.element, settings.className);
  }
}

function highlightNode(node, re, nodeName, className) {
  if (node.nodeType === 3 && node.parentElement && node.parentElement.namespaceURI == 'http://www.w3.org/1999/xhtml') {
    // text nodes
    var match = node.data.match(re);
    if (match) {
      var highlight = document.createElement(nodeName || 'span');
      highlight.className = className || 'highlight';
      var wordNode = node.splitText(match.index);
      wordNode.splitText(match[0].length);
      var wordClone = wordNode.cloneNode(true);
      highlight.appendChild(wordClone);
      wordNode.parentNode.replaceChild(highlight, wordNode);
      return 1; //skip added node in parent
    }
  } else if (
    node.nodeType === 1 &&
    node.childNodes && // only element nodes that have children
    !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
    !(node.tagName === nodeName.toUpperCase() && node.className === className)
  ) {
    // skip if already highlighted
    for (var i = 0; i < node.childNodes.length; i++) {
      i += highlightNode(node.childNodes[i], re, nodeName, className);
    }
  }
  return 0;
}

function unmark() {
  var markedElements = document.querySelectorAll('mark.search');
  for (var i = 0; i < markedElements.length; i++) {
    var parent = markedElements[i].parentNode;
    while (parent && parent.classList) {
      if (parent.tagName.toLowerCase() === 'li' && parent.parentNode && parent.parentNode.tagName.toLowerCase() === 'ul' && parent.parentNode.classList.contains('collapsible-menu')) {
        var toggleInputs = parent.querySelectorAll('input.menu-marked');
        if (toggleInputs.length) {
          toggleInputs[0].checked = toggleInputs[0].dataset.checked === 'true';
          toggleInputs[0].dataset.checked = null;
          toggleInputs[0].classList.remove('menu-marked');
        }
      }
      if (parent.classList.contains('expand')) {
        var expandInputs = parent.querySelectorAll('input.expand-marked');
        if (expandInputs.length) {
          expandInputs[0].checked = expandInputs[0].dataset.checked === 'true';
          expandInputs[0].dataset.checked = null;
          expandInputs[0].classList.remove('expand-marked');
        }
      }
      parent = parent.parentNode;
    }
  }

  var highlighted = document.querySelectorAll('.highlightable');
  unhighlight(highlighted, { element: 'mark', className: 'search' });
  psm &&
    setTimeout(function () {
      psm.update();
    }, 10);
}

function unhighlight(es, options) {
  var settings = {
    className: 'highlight',
    element: 'span',
  };
  Object.assign(settings, options);

  for (var i = 0; i < es.length; i++) {
    var highlightedElements = es[i].querySelectorAll(settings.element + '.' + settings.className);
    for (var j = 0; j < highlightedElements.length; j++) {
      var parent = highlightedElements[j].parentNode;
      parent.replaceChild(highlightedElements[j].firstChild, highlightedElements[j]);
      parent.normalize();
    }
  }
}

// replace jQuery.createPseudo with https://stackoverflow.com/a/66318392
function elementContains(words, e) {
  var settings = {
    caseSensitive: false,
    wordsOnly: false,
  };

  if (!words.length) {
    return [];
  }
  if (!e) {
    return [];
  }
  words = words.map(function (word, i) {
    return regexEscape(word);
  });
  var flag = settings.caseSensitive ? '' : 'i';
  var nodes = [];

  var pattern = '(' + words.join('|') + ')';
  if (settings.wordsOnly) {
    pattern = '\\b' + pattern + '\\b';
  }
  var regex = new RegExp(pattern, flag);

  var tree = document.createTreeWalker(
    e,
    4, // NodeFilter.SHOW_TEXT
    function (node) {
      return regex.test(node.data);
    },
    false
  );
  var node = null;
  while ((node = tree.nextNode())) {
    nodes.push(node.parentElement);
  }

  return nodes;
}

function searchInputHandler(value) {
  window.relearn.removeItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
  unmark();
  if (value.length) {
    window.relearn.setItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value', value);
    mark();
  }
}

function initSearch() {
  // sync input/escape between searchbox and searchdetail
  var inputs = document.querySelectorAll('input.search-by');
  inputs.forEach(function (e) {
    e.addEventListener('keydown', function (event) {
      if (event.key == 'Escape') {
        var input = event.target;
        var search = window.relearn.getItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
        var words = (search ?? '').split(' ').filter((word) => word.trim() != '');
        if (!words || !words.length) {
          input.blur();
        }
        searchInputHandler('');
        inputs.forEach(function (e) {
          e.value = '';
        });
        if (!words || !words.length) {
          documentFocus();
        }
      }
    });
    e.addEventListener('input', function (event) {
      var input = event.target;
      var value = input.value;
      searchInputHandler(value);
      inputs.forEach(function (e) {
        if (e != input) {
          e.value = value;
        }
      });
    });
  });

  document.querySelectorAll('[data-search-clear]').forEach(function (e) {
    e.addEventListener('click', function () {
      inputs.forEach(function (e) {
        e.value = '';
        var event = document.createEvent('Event');
        event.initEvent('input', false, false);
        e.dispatchEvent(event);
      });
      window.relearn.removeItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
      unmark();
    });
  });

  var urlParams = new URLSearchParams(window.location.search);
  var value = urlParams.get('search-by');
  if (value) {
    window.relearn.setItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value', value);
    mark();
  }

  // set initial search value for inputs on page load
  var search = window.relearn.getItem(window.sessionStorage, window.relearn.absBaseUri + '/search-value');
  if (search) {
    inputs.forEach(function (e) {
      e.value = search;
      var event = document.createEvent('Event');
      event.initEvent('input', false, false);
      e.dispatchEvent(event);
    });
  }

  window.relearn.isSearchInterfaceReady = true;
  window.relearn.executeInitialSearch && window.relearn.executeInitialSearch();
}

document.addEventListener('themeVariantLoaded', function (ev) {
  updateTheme(ev);
});

function updateTheme(ev) {
  if (window.relearn.lastVariant == ev.detail.variant) {
    return;
  }
  window.relearn.lastVariant = ev.detail.variant;

  initMermaid(true);
  initOpenapi(true);
}

(function () {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    initMermaid(true);
    initOpenapi(true);
  });
})();

function useMermaid(config) {
  delete config.theme;
  window.relearn.mermaidConfig = config;
  if (typeof mermaid != 'undefined' && typeof mermaid.mermaidAPI != 'undefined') {
    mermaid.initialize(Object.assign({ securityLevel: 'antiscript', startOnLoad: false }, config));
  }
}
if (window.relearn.themeUseMermaid) {
  useMermaid(window.relearn.themeUseMermaid);
}

function useOpenapi(config) {
  if (config.css && config.cssInProject) {
    config.css = window.relearn.relBasePath + config.css;
  }
}
if (window.relearn.themeUseOpenapi) {
  useOpenapi(window.relearn.themeUseOpenapi);
}

function ready(fn) {
  if (document.readyState == 'complete') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  initArrowVerticalNav();
  initArrowHorizontalNav();
  handleHistoryClearer();
  handleLanguageSwitcher();
  handleVariantSwitcher();
  handleVersionSwitcher();
  initMermaid();
  initOpenapi();
  initMenuScrollbar();
  initToc();
  initAnchorClipboard();
  initCodeClipboard();
  fixCodeTabs();
  restoreTabSelections();
  initSwipeHandler();
  initHistory();
  initSearch();
  initImage();
  initExpand();
  initScrollPositionSaver();
});

(function () {
  var body = document.querySelector('body');
  var topbar = document.querySelector('#R-topbar');
  function addTopbarButtonInfos() {
    // initially add some management infos to buttons and areas
    var areas = body.querySelectorAll('.topbar-area');
    areas.forEach(function (area) {
      area.dataset.area = 'area-' + area.dataset.area;
      var buttons = area.querySelectorAll(':scope > .topbar-button');
      buttons.forEach(function (button) {
        button.dataset.origin = area.dataset.area;
        button.dataset.action = 'show';
        var placeholder = document.createElement('div');
        placeholder.classList.add('topbar-placeholder');
        placeholder.dataset.action = 'show';
        button.insertAdjacentElement('afterend', placeholder);
      });
      var placeholder = document.createElement('div');
      area.insertAdjacentElement('beforeend', placeholder);
      var hidden = document.createElement('div');
      hidden.classList.add('topbar-hidden');
      hidden.dataset.area = area.dataset.area;
      var hplaceholder = document.createElement('div');
      hidden.insertAdjacentElement('beforeend', hplaceholder);
      area.insertAdjacentElement('afterend', hidden);
    });
  }
  function moveAreaTopbarButtons(width) {
    topbar.querySelectorAll('.topbar-hidden .topbar-button').forEach(function (button) {
      // move hidden to origins area
      var placeholder = button.parentNode.parentNode.querySelector(':scope > .topbar-area .topbar-placeholder[data-action="hide"]');
      placeholder.dataset.action = 'show';
      button.dataset.action = 'show';
      placeholder.insertAdjacentElement('beforebegin', button);
    });
    topbar.querySelectorAll('.topbar-area .topbar-button').forEach(function (button) {
      var current_area = button.dataset.action;
      var origin_area = button.dataset.origin;
      if (current_area != 'show' && origin_area != current_area) {
        // move moved to origins area
        var placeholder = topbar.querySelector('.topbar-area[data-area="' + origin_area + '"] > .topbar-placeholder[data-action="' + current_area + '"]');
        placeholder.dataset.action = 'show';
        button.dataset.action = 'show';
        placeholder.insertAdjacentElement('beforebegin', button);
      }
    });
    Array.from(topbar.querySelectorAll('.topbar-area .topbar-button'))
      .reverse()
      .forEach(function (button) {
        var parent = button.parentElement;
        var current_area = parent.dataset.area;
        var action = button.dataset['width' + width.toUpperCase()];
        if (action == 'show') {
        } else if (action == 'hide') {
          // move to origins hidden
          var hidden = button.parentNode.parentNode.querySelector(':scope > .topbar-hidden > *');
          var placeholder = button.nextSibling;
          placeholder.dataset.action = action;
          button.dataset.action = action;
          hidden.insertAdjacentElement('beforebegin', button);
        } else if (action != current_area) {
          // move to action area
          var dest = button.parentNode.parentNode.querySelector('.topbar-area[data-area="' + action + '"] > *');
          if (dest) {
            var placeholder = button.nextSibling;
            placeholder.dataset.action = action;
            button.dataset.action = action;
            dest.insertAdjacentElement('beforebegin', button);
          }
        }
      });
  }
  function moveTopbarButtons() {
    var isS = body.classList.contains('menu-width-s');
    var isM = body.classList.contains('menu-width-m');
    var isL = body.classList.contains('menu-width-l');
    // move buttons once, width has a distinct value
    if (isS && !isM && !isL) {
      moveAreaTopbarButtons('s');
    } else if (!isS && isM && !isL) {
      moveAreaTopbarButtons('m');
    } else if (!isS && !isM && isL) {
      moveAreaTopbarButtons('l');
    }
  }
  function adjustEmptyTopbarContents() {
    var buttons = Array.from(document.querySelectorAll('.topbar-button > .topbar-content > .topbar-content-wrapper'));
    // we have to reverse order to make sure to handle innermost areas first
    buttons.reverse().forEach(function (wrapper) {
      var button = getTopbarButtonParent(wrapper);
      if (button) {
        var isEmpty = true;
        var area = wrapper.querySelector(':scope > .topbar-area');
        if (area) {
          // if it's an area, we have to check each contained button
          // manually for its display property
          var areabuttons = area.querySelectorAll(':scope > .topbar-button');
          isEmpty = true;
          areabuttons.forEach(function (ab) {
            if (ab.style.display != 'none') {
              isEmpty = false;
            }
          });
        } else {
          var clone = wrapper.cloneNode(true);
          var irrelevant = clone.querySelectorAll('div.ps__rail-x, div.ps__rail-y');
          irrelevant.forEach(function (e) {
            e.parentNode.removeChild(e);
          });
          isEmpty = !clone.innerHTML.trim();
        }
        button.querySelector('button').disabled = isEmpty;
        button.querySelector('.btn').classList.toggle('interactive', !isEmpty);
        button.style.display = isEmpty && button.dataset.contentEmpty == 'hide' ? 'none' : 'inline-block';
      }
    });
  }
  function setWidthS(e) {
    body.classList[e.matches ? 'add' : 'remove']('menu-width-s');
  }
  function setWidthM(e) {
    body.classList[e.matches ? 'add' : 'remove']('menu-width-m');
  }
  function setWidthL(e) {
    body.classList[e.matches ? 'add' : 'remove']('menu-width-l');
  }
  function onWidthChange(setWidth, e) {
    setWidth(e);
    moveTopbarButtons();
    adjustEmptyTopbarContents();
  }
  if (topbar) {
    var mqs = window.matchMedia('only screen and (max-width: 47.999rem)');
    mqs.addEventListener('change', onWidthChange.bind(null, setWidthS));
    var mqm = window.matchMedia('only screen and (min-width: 48rem) and (max-width: 59.999rem)');
    mqm.addEventListener('change', onWidthChange.bind(null, setWidthM));
    var mql = window.matchMedia('only screen and (min-width: 60rem)');
    mql.addEventListener('change', onWidthChange.bind(null, setWidthL));

    addTopbarButtonInfos();
    setWidthS(mqs);
    setWidthM(mqm);
    setWidthL(mql);
    moveTopbarButtons();
    adjustEmptyTopbarContents();
  }
})();

(function () {
  var body = document.querySelector('body');
  function setWidth(e) {
    body.classList[e.matches ? 'add' : 'remove']('main-width-max');
  }
  function onWidthChange(setWidth, e) {
    setWidth(e);
  }
  var width = getColorValue('MAIN-WIDTH-MAX');
  var mqm = window.matchMedia('screen and ( min-width: ' + width + ')');
  mqm.addEventListener('change', onWidthChange.bind(null, setWidth));
  setWidth(mqm);
})();

function getColorValue(c) {
  return this.normalizeColor(getComputedStyle(document.documentElement).getPropertyValue('--INTERNAL-' + c));
}

function normalizeColor(c) {
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
}

function initVersionIndex(index) {
  if (!index || !index.length) {
    return;
  }

  document.querySelectorAll('.R-versionswitcher select').forEach(function (select) {
    var preSelectedOption = select.querySelector('[data-selected]')?.cloneNode(true);

    var selectedOption = null;
    if (select.selectedIndex >= 0) {
      selectedOption = select.options[select.selectedIndex].cloneNode(true);
    }

    // Remove all existing options
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }

    // Add all options from the index
    index.forEach(function (version) {
      // Create new option element
      var option = document.createElement('option');
      option.id = 'R-select-version-' + version.value;
      option.value = version.value;
      option.dataset.abs = version.isAbs;
      option.dataset.uri = version.baseURL;
      option.dataset.identifier = version.identifier;
      option.textContent = version.title;

      // Add the option to the select
      select.appendChild(option);
    });

    if (preSelectedOption) {
      const option = select.querySelector(`option[value="${preSelectedOption.value}"]`);
      if (!option) {
        select.appendChild(preSelectedOption);
      } else {
        option.dataset.selected = '';
      }
    }
    if (selectedOption) {
      // Re-select the previously selected option if it exists
      const option = select.querySelector(`option[value="${selectedOption.value}"]`);
      if (!option) {
        select.appendChild(selectedOption);
      }
      select.value = selectedOption.value;
    } else if (select.options.length > 0) {
      // If there was no selection before, select the first option
      select.selectedIndex = 0;
      return;
    }
  });
}

function initVersionJs() {
  if (window.relearn.version_js_url) {
    var js = document.createElement('script');
    // we need to add a random number on each call to read this file fresh from the server;
    // it may reside in a different Hugo instance and therefore we do not know when it changes
    var url = new URL(window.relearn.version_js_url, window.location.href);
    var randomNum = Math.floor(Math.random() * 1000000);
    url.searchParams.set('v', randomNum.toString());
    js.src = url.toString();
    js.setAttribute('async', '');
    js.onload = function () {
      initVersionIndex(relearn_versionindex);
    };
    js.onerror = function (e) {
      console.error('Error getting version index file');
    };
    document.head.appendChild(js);
  }
}

initVersionJs();
