import { create, search as oramaSearch, insertMultiple } from './orama/orama.js';
import { pluginQPS } from './orama/plugin-qps.js';
import { pluginPT15 } from './orama/plugin-pt15.js';
//import { pluginEmbeddings } from 'https://cdn.jsdelivr.net/npm/@orama/plugin-embeddings@3.0.8.js'
//import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core';
//import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl';

//import { createTokenizer } from '@orama/tokenizers/japanese'
//import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";

let searchEngine = null;

async function init() {
  async function initIndex(index) {
    /*
		const embeddings = await pluginEmbeddings({
			embeddings: {
				// Property used to store generated embeddings. Must be defined in the schema.
				defaultProperty: 'embeddings',
				onInsert: {
					// Generate embeddings at insert-time.
					// Turn off if you're inserting documents with embeddings already generated.
					generate: true,
					// Properties to use for generating embeddings at insert time.
					// These properties will be concatenated and used to generate embeddings.
					properties: ['description'],
					verbose: true,
				}
			}
		});
*/
    searchEngine = await create({
      schema: {
        title: 'string',
        content: 'string',
        uri: 'string',
        breadcrumb: 'string',
        description: 'string',
        tags: 'string[]',
        //				embeddings: 'vector[1]'
      },
      plugins: [
        //				embeddings,
        //				pluginQPS()
        pluginPT15(),
      ],
      /*
			defaultLanguage: 'french',
			components: {
				tokenizer: {
					stemmingFn: stemmer,
				},
			},
	*/
    });
    await insertMultiple(searchEngine, index);

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

async function search(term) {
  const searchResponse = await oramaSearch(searchEngine, {
    //		mode: 'hybrid', // vector search seems not to work
    term: term,
    properties: '*',
    threshold: 0, // only show results where all keywords were found
    limit: 99,
    boost: {
      // doesn't seem to make a difference in score
      tags: 1.8,
      title: 1.5,
      description: 1.3,
      breadcrumb: 1.2,
    },
    //		distinctOn: 'title', // just to filter out changelog/releasenotes if having the same title
    //		exact: true, // not for PT15
    //		tolerance: 1, // not for PT15
  });
  console.log('new term', term);
  searchResponse.hits.forEach((hit) => console.log(hit.score, hit.document.uri));
  return searchResponse.hits.map((hit) => ({ matches: [term, ...term.split(' ')], page: hit.document }));
}

window.relearn = window.relearn ?? {};
window.relearn.search = window.relearn.search ?? {};
window.relearn.search.adapter = { init, search };
