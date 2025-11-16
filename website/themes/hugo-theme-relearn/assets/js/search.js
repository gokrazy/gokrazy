(function () {
  function ready(fn) {
    if (document.readyState == 'complete') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.relearn = window.relearn || {};

  window.relearn.executeInitialSearch = function executeInitialSearch() {
    if (window.relearn.isSearchInterfaceReady && window.relearn.isSearchEngineReady) {
      var input = document.querySelector('#R-search-by-detail');
      if (!input) {
        return;
      }
      var value = input.value;
      executeSearch(value);
    }
  };

  window.relearn.executeTriggeredSearch = function executeTriggeredSearch() {
    var input = document.querySelector('#R-search-by-detail');
    if (!input) {
      return;
    }
    var value = input.value;
    executeSearch(value);

    // add a new entry to the history after the user
    // changed the term; this does not reload the page
    // but will add to the history and update the address bar URL
    var url = new URL(window.location);
    var oldValue = url.searchParams.get('search-by');
    if (value != oldValue) {
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      url.searchParams.set('search-by', value);
      state.search = url.toString();
      // with normal pages, this is handled by the 'pagehide' event, but this
      // doesn't fire in case of pushState, so we have to do the same thing
      // here, too
      state.contentScrollTop = +elc.scrollTop;
      window.history.pushState(state, '', url);
    }
  };

  function executeHistorySearch(event) {
    // restart search if browsed through history
    if (event.state) {
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      if (state.search) {
        var url = new URL(state.search);
        if (url.searchParams.has('search-by')) {
          var search = url.searchParams.get('search-by');

          // we have to insert the old search term into the inputs
          var inputs = document.querySelectorAll('input.search-by');
          inputs.forEach(function (e) {
            e.value = search;
            var event = document.createEvent('Event');
            event.initEvent('input', false, false);
            e.dispatchEvent(event);
          });

          // recreate the last search results and eventually
          // restore the previous scrolling position
          executeSearch(search);
        }
      }
    }
  }

  function renderItem(item) {
    var page = item.page;
    var context = [];
    if (item.matches && item.matches.length) {
      var numContextWords = 2;
      var contextPattern = '(?:\\S+ +){0,' + numContextWords + '}\\S*\\b(?:' + escapeRegex(item.matches[0]) + ')\\b\\S*(?: +\\S+){0,' + numContextWords + '}';
      context = page.content.match(new RegExp(contextPattern, 'i'));
      if (!context) {
        item.matches.shift();
        var contextPattern = '(?:\\S+ +){0,' + numContextWords + '}\\S*\\b(?:' + item.matches.map(escapeRegex).join('|') + ')\\b\\S*(?: +\\S+){0,' + numContextWords + '}';
        context = page.content.match(new RegExp(contextPattern, 'i'));
      }
    }
    var divsuggestion = document.createElement('a');
    divsuggestion.className = 'autocomplete-suggestion';
    divsuggestion.setAttribute('href', window.relearn.relBaseUri + page.uri);
    var divtitle = document.createElement('div');
    divtitle.className = 'title';
    divtitle.innerText = '» ' + page.title;
    divsuggestion.appendChild(divtitle);
    var divbreadcrumb = document.createElement('div');
    divbreadcrumb.className = 'breadcrumbs';
    divbreadcrumb.innerText = page.breadcrumb || '';
    divsuggestion.appendChild(divbreadcrumb);
    if (context) {
      var divcontext = document.createElement('div');
      divcontext.className = 'context';
      divcontext.innerText = context || '';
      divsuggestion.appendChild(divcontext);
    }
    return divsuggestion;
  }

  function executeSearch(value) {
    var input = document.querySelector('#R-search-by-detail');
    function resolvePlaceholders(s, args) {
      var args = args || [];
      // use replace to iterate over the string
      // select the match and check if the related argument is present
      // if yes, replace the match with the argument
      return s.replace(/{([0-9]+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == 'undefined' ? match : args[index];
      });
    }

    var results = document.querySelector('#R-searchresults');
    var hint = document.querySelector('.searchhint');
    hint.innerText = '';
    results.textContent = '';
    (async function () {
      var a = await window.relearn.search.adapter.search(value);
      if (a.length) {
        hint.innerText = resolvePlaceholders(window.T_N_results_found, [value, a.length]);
        a.forEach(function (item) {
          results.appendChild(renderItem(item));
        });
        window.relearn.markSearch();
      } else if (value.length) {
        hint.innerText = resolvePlaceholders(window.T_No_results_found, [value]);
      }
      input.focus();
      setTimeout(adjustContentWidth, 0);

      // if we are initiating search because of a browser history
      // operation, we have to restore the scrolling postion the
      // user previously has used; if this search isn't initiated
      // by a browser history operation, it simply does nothing
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      if (state.hasOwnProperty('contentScrollTop')) {
        window.setTimeout(function () {
          elc.scrollTop = +state.contentScrollTop;
        }, 10);
        return;
      }
    })();
  }

  function initSearchAfterLoad() {
    if (!window.relearn.search || !window.relearn.search.adapter) {
      return;
    }
    window.relearn.search.adapter.init();

    var input = document.querySelector('#R-search-by-detail');
    if (input) {
      var state = window.history.state || {};
      state = Object.assign({}, typeof state === 'object' ? state : {});
      state.search = window.location.toString();
      window.history.replaceState(state, '');
    }

    new autoComplete({
      /* selector for the search box element */
      selectorToInsert: 'search:has(.searchbox)',
      selector: '#R-search-by',
      /* source is the callback to perform the search */
      source: async function (term, response) {
        let a = await window.relearn.search.adapter.search(term);
        response(a);
      },
      /* renderItem displays individual search results */
      renderItem: function (item, _term) {
        return renderItem(item).outerHTML;
      },
      /* onSelect callback fires when a search suggestion is chosen */
      onSelect: function (e, term, item) {
        location.href = item.getAttribute('href');
        e.preventDefault();
      },
    });
  }

  function initSearch() {
    window.addEventListener('popstate', executeHistorySearch);

    var input = document.querySelector('#R-search-by-detail');
    if (input) {
      input.addEventListener('keydown', function (event) {
        // if we are pressing ESC in the searchdetail our focus will
        // be stolen by the other event handlers, so we have to refocus
        // here after a short while
        if (event.key == 'Escape') {
          setTimeout(function () {
            input.focus();
          }, 0);
        }
      });
    }
    ready(initSearchAfterLoad);
  }

  initSearch();
})();
