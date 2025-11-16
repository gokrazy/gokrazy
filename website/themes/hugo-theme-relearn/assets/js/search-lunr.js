/*

# Adapter Interface

The search adapter needs to provide the following functions that are called from search.js

## init()

Initialize the search engine and the search index

### Parameters

none

### Returns

none

### Remarks

Once successfully completed, needs to call

	````
    window.relearn.isSearchEngineReady = true;
    window.relearn.executeInitialSearch();
	````

## search()

Performs the search and returs found results.

### Parameters

term: string // the search term that was typed in by the user

### Returns

Must return an array of found pages, sorted with the most relevant page first.

Each array item needs the following layout:

````
{
    index: string, // optional, id of the page in the search index
    matches: string[], // optional, array of found terms; will be used to show an excerpt of the content positioned at the term
    page: {
        breadcrumb: string,
        title: string,
        uri: string,
        content: string,
        tags: string[]
    }
}
````
*/

(function () {
  let lunrIndex, pagesIndex;

  function init() {
    function initIndex(index) {
      if (!window.lunr) {
        return;
      }
      pagesIndex = index;
      // Set up Lunr by declaring the fields we use
      // Also provide their boost level for the ranking
      lunrIndex = lunr(function () {
        this.use(lunr.multiLanguage.apply(null, window.relearn.contentLangs));
        this.ref('index');
        this.field('title', {
          boost: 15,
        });
        this.field('tags', {
          boost: 10,
        });
        this.field('content', {
          boost: 5,
        });

        this.pipeline.remove(lunr.stemmer);
        this.searchPipeline.remove(lunr.stemmer);

        // Feed Lunr with each file and let index them
        pagesIndex.forEach(function (page, idx) {
          page.index = idx;
          this.add(page);
        }, this);
      });

      window.relearn.isSearchEngineReady = true;
      window.relearn.executeInitialSearch();
    }

    if (window.relearn.index_js_url) {
      var js = document.createElement('script');
      js.src = window.relearn.index_js_url;
      js.setAttribute('async', '');
      js.onload = function () {
        initIndex(relearn_searchindex);
      };
      js.onerror = function (e) {
        console.error('Error getting Hugo index file');
      };
      document.head.appendChild(js);
    }
  }

  function search(term) {
    function searchPatterns(word) {
      // for short words high amounts of typos doesn't make sense
      // for long words we allow less typos because this largely increases search time
      var typos = [
        { len: -1, typos: 1 },
        { len: 60, typos: 2 },
        { len: 40, typos: 3 },
        { len: 20, typos: 4 },
        { len: 16, typos: 3 },
        { len: 12, typos: 2 },
        { len: 8, typos: 1 },
        { len: 4, typos: 0 },
      ];
      return [
        word + '^100',
        word + '*^10',
        '*' + word + '^10',
        word +
          '~' +
          typos.reduce(function (a, c, i) {
            return word.length < c.len ? c : a;
          }).typos +
          '^1',
      ];
    }

    // Find the item in our index corresponding to the Lunr one to have more info
    // Remove Lunr special search characters: https://lunrjs.com/guides/searching.html
    if (!window.lunr) {
      return [];
    }
    term = term.replace(/[*:^~+-]/g, ' ');
    var searchTerm = lunr
      .tokenizer(term)
      .reduce(function (a, token) {
        return a.concat(searchPatterns(token.str));
      }, [])
      .join(' ');
    return !searchTerm || !lunrIndex
      ? []
      : lunrIndex.search(searchTerm).map(function (result) {
          return { index: result.ref, matches: [term, ...Object.keys(result.matchData.metadata)], page: pagesIndex[result.ref] };
        });
  }

  window.relearn = window.relearn ?? {};
  window.relearn.search = window.relearn.search ?? {};
  window.relearn.search.adapter = { init, search };
})();
