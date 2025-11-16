/*!
 * Hugo Relearn theme search adapter, bundling Orama 3.0.8
 * https://github.com/McShelby/hugo-theme-relearn-search-orama
 * MIT license
 */ (() => {
  'use strict';
  var e = {
      d: (t, n) => {
        for (var r in n) e.o(n, r) && !e.o(t, r) && Object.defineProperty(t, r, { enumerable: !0, get: n[r] });
      },
      o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
      r: (e) => {
        'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }), Object.defineProperty(e, '__esModule', { value: !0 });
      },
    },
    t = {};
  e.r(t), e.d(t, { init: () => on, search: () => an });
  const n = { arabic: 'ar', armenian: 'am', bulgarian: 'bg', danish: 'dk', dutch: 'nl', english: 'en', finnish: 'fi', french: 'fr', german: 'de', greek: 'gr', hungarian: 'hu', indian: 'in', indonesian: 'id', irish: 'ie', italian: 'it', lithuanian: 'lt', nepali: 'np', norwegian: 'no', portuguese: 'pt', romanian: 'ro', russian: 'ru', serbian: 'rs', slovenian: 'ru', spanish: 'es', swedish: 'se', tamil: 'ta', turkish: 'tr', ukrainian: 'uk', sanskrit: 'sk' },
    r = { dutch: /[^A-Za-zàèéìòóù0-9_'-]+/gim, english: /[^A-Za-zàèéìòóù0-9_'-]+/gim, french: /[^a-z0-9äâàéèëêïîöôùüûœç-]+/gim, italian: /[^A-Za-zàèéìòóù0-9_'-]+/gim, norwegian: /[^a-z0-9_æøåÆØÅäÄöÖüÜ]+/gim, portuguese: /[^a-z0-9à-úÀ-Ú]/gim, russian: /[^a-z0-9а-яА-ЯёЁ]+/gim, spanish: /[^a-z0-9A-Zá-úÁ-ÚñÑüÜ]+/gim, swedish: /[^a-z0-9_åÅäÄöÖüÜ-]+/gim, german: /[^a-z0-9A-ZäöüÄÖÜß]+/gim, finnish: /[^a-z0-9äöÄÖ]+/gim, danish: /[^a-z0-9æøåÆØÅ]+/gim, hungarian: /[^a-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+/gim, romanian: /[^a-z0-9ăâîșțĂÂÎȘȚ]+/gim, serbian: /[^a-z0-9čćžšđČĆŽŠĐ]+/gim, turkish: /[^a-z0-9çÇğĞıİöÖşŞüÜ]+/gim, lithuanian: /[^a-z0-9ąčęėįšųūžĄČĘĖĮŠŲŪŽ]+/gim, arabic: /[^a-z0-9أ-ي]+/gim, nepali: /[^a-z0-9अ-ह]+/gim, irish: /[^a-z0-9áéíóúÁÉÍÓÚ]+/gim, indian: /[^a-z0-9अ-ह]+/gim, armenian: /[^a-z0-9ա-ֆ]+/gim, greek: /[^a-z0-9α-ωά-ώ]+/gim, indonesian: /[^a-z0-9]+/gim, ukrainian: /[^a-z0-9а-яА-ЯіїєІЇЄ]+/gim, slovenian: /[^a-z0-9čžšČŽŠ]+/gim, bulgarian: /[^a-z0-9а-яА-Я]+/gim, tamil: /[^a-z0-9அ-ஹ]+/gim, sanskrit: /[^a-z0-9A-Zāīūṛḷṃṁḥśṣṭḍṇṅñḻḹṝ]+/gim },
    o = Object.keys(n);
  const s = Date.now().toString().slice(5);
  let i = 0;
  const a = BigInt(1e3),
    c = BigInt(1e6),
    l = BigInt(1e9),
    u = 65535;
  function f(e, t) {
    if (t.length < u) Array.prototype.push.apply(e, t);
    else {
      const n = t.length;
      for (let r = 0; r < n; r += u) Array.prototype.push.apply(e, t.slice(r, r + u));
    }
  }
  function d() {
    return BigInt(Math.floor(1e6 * performance.now()));
  }
  function h(e) {
    return 'number' == typeof e && (e = BigInt(e)), e < a ? `${e}ns` : e < c ? e / a + 'μs' : e < l ? e / c + 'ms' : e / l + 's';
  }
  function p() {
    return 'undefined' != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? d() : ('undefined' != typeof process && process.release && 'node' === process.release.name) || ('undefined' != typeof process && 'function' == typeof process?.hrtime?.bigint) ? process.hrtime.bigint() : 'undefined' != typeof performance ? d() : BigInt(0);
  }
  function g() {
    return `${s}-${i++}`;
  }
  function m(e, t) {
    return void 0 === Object.hasOwn ? (Object.prototype.hasOwnProperty.call(e, t) ? e[t] : void 0) : Object.hasOwn(e, t) ? e[t] : void 0;
  }
  function y(e, t) {
    return t[1] === e[1] ? e[0] - t[0] : t[1] - e[1];
  }
  function b(e) {
    if (0 === e.length) return [];
    if (1 === e.length) return e[0];
    for (let t = 1; t < e.length; t++)
      if (e[t].length < e[0].length) {
        const n = e[0];
        (e[0] = e[t]), (e[t] = n);
      }
    const t = new Map();
    for (const n of e[0]) t.set(n, 1);
    for (let n = 1; n < e.length; n++) {
      let r = 0;
      for (const o of e[n]) {
        const e = t.get(o);
        e === n && (t.set(o, e + 1), r++);
      }
      if (0 === r) return [];
    }
    return e[0].filter((n) => {
      const r = t.get(n);
      return void 0 !== r && t.set(n, 0), r === e.length;
    });
  }
  function S(e, t) {
    const n = {},
      r = t.length;
    for (let o = 0; o < r; o++) {
      const r = t[o],
        s = r.split('.');
      let i = e;
      const a = s.length;
      for (let e = 0; e < a; e++)
        if (((i = i[s[e]]), 'object' == typeof i)) {
          if (null !== i && 'lat' in i && 'lon' in i && 'number' == typeof i.lat && 'number' == typeof i.lon) {
            i = n[r] = i;
            break;
          }
          if (!Array.isArray(i) && null !== i && e === a - 1) {
            i = void 0;
            break;
          }
        } else if ((null === i || 'object' != typeof i) && e < a - 1) {
          i = void 0;
          break;
        }
      void 0 !== i && (n[r] = i);
    }
    return n;
  }
  function w(e, t) {
    return S(e, [t])[t];
  }
  const v = { cm: 0.01, m: 1, km: 1e3, ft: 0.3048, yd: 0.9144, mi: 1609.344 };
  function I(e, t) {
    const n = v[t];
    if (void 0 === n) throw new Error(x('INVALID_DISTANCE_SUFFIX', e).message);
    return e * n;
  }
  function O(e, t) {
    e.hits = e.hits.map((e) => ({
      ...e,
      document: {
        ...e.document,
        ...t.reduce((e, t) => {
          const n = t.split('.'),
            r = n.pop();
          let o = e;
          for (const e of n) (o[e] = o[e] ?? {}), (o = o[e]);
          return (o[r] = null), e;
        }, e.document),
      },
    }));
  }
  function T(e) {
    return Array.isArray(e) ? e.some((e) => T(e)) : 'AsyncFunction' === e?.constructor?.name;
  }
  const N = 'intersection' in new Set();
  const A = 'union' in new Set();
  function _(e, t) {
    return A ? (e ? e.union(t) : t) : e ? new Set([...e, ...t]) : new Set(t);
  }
  function D(e) {
    if ('undefined' != typeof SharedArrayBuffer && 'undefined' != typeof Atomics) {
      const t = new Int32Array(new SharedArrayBuffer(4));
      if (!1 === (e > 0 && e < 1 / 0)) {
        if ('number' != typeof e && 'bigint' != typeof e) throw TypeError('sleep: ms must be a number');
        throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
      }
      Atomics.wait(t, 0, 0, Number(e));
    } else {
      if (!1 === (e > 0 && e < 1 / 0)) {
        if ('number' != typeof e && 'bigint' != typeof e) throw TypeError('sleep: ms must be a number');
        throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity');
      }
      const t = Date.now() + Number(e);
      for (; t > Date.now(); );
    }
  }
  const E = { NO_LANGUAGE_WITH_CUSTOM_TOKENIZER: 'Do not pass the language option to create when using a custom tokenizer.', LANGUAGE_NOT_SUPPORTED: `Language "%s" is not supported.\nSupported languages are:\n - ${o.join('\n - ')}`, INVALID_STEMMER_FUNCTION_TYPE: 'config.stemmer property must be a function.', MISSING_STEMMER: 'As of version 1.0.0 @orama/orama does not ship non English stemmers by default. To solve this, please explicitly import and specify the "%s" stemmer from the package @orama/stemmers. See https://docs.orama.com/open-source/text-analysis/stemming for more information.', CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY: 'Custom stop words array must only contain strings.', UNSUPPORTED_COMPONENT: 'Unsupported component "%s".', COMPONENT_MUST_BE_FUNCTION: 'The component "%s" must be a function.', COMPONENT_MUST_BE_FUNCTION_OR_ARRAY_FUNCTIONS: 'The component "%s" must be a function or an array of functions.', INVALID_SCHEMA_TYPE: 'Unsupported schema type "%s" at "%s". Expected "string", "boolean" or "number" or array of them.', DOCUMENT_ID_MUST_BE_STRING: 'Document id must be of type "string". Got "%s" instead.', DOCUMENT_ALREADY_EXISTS: 'A document with id "%s" already exists.', DOCUMENT_DOES_NOT_EXIST: 'A document with id "%s" does not exists.', MISSING_DOCUMENT_PROPERTY: 'Missing searchable property "%s".', INVALID_DOCUMENT_PROPERTY: 'Invalid document property "%s": expected "%s", got "%s"', UNKNOWN_INDEX: 'Invalid property name "%s". Expected a wildcard string ("*") or array containing one of the following properties: %s', INVALID_BOOST_VALUE: 'Boost value must be a number greater than, or less than 0.', INVALID_FILTER_OPERATION: 'You can only use one operation per filter, you requested %d.', SCHEMA_VALIDATION_FAILURE: 'Cannot insert document due schema validation failure on "%s" property.', INVALID_SORT_SCHEMA_TYPE: 'Unsupported sort schema type "%s" at "%s". Expected "string" or "number".', CANNOT_SORT_BY_ARRAY: 'Cannot configure sort for "%s" because it is an array (%s).', UNABLE_TO_SORT_ON_UNKNOWN_FIELD: 'Unable to sort on unknown field "%s". Allowed fields: %s', SORT_DISABLED: 'Sort is disabled. Please read the documentation at https://docs.oramasearch for more information.', UNKNOWN_GROUP_BY_PROPERTY: 'Unknown groupBy property "%s".', INVALID_GROUP_BY_PROPERTY: 'Invalid groupBy property "%s". Allowed types: "%s", but given "%s".', UNKNOWN_FILTER_PROPERTY: 'Unknown filter property "%s".', INVALID_VECTOR_SIZE: 'Vector size must be a number greater than 0. Got "%s" instead.', INVALID_VECTOR_VALUE: 'Vector value must be a number greater than 0. Got "%s" instead.', INVALID_INPUT_VECTOR: 'Property "%s" was declared as a %s-dimensional vector, but got a %s-dimensional vector instead.\nInput vectors must be of the size declared in the schema, as calculating similarity between vectors of different sizes can lead to unexpected results.', WRONG_SEARCH_PROPERTY_TYPE: 'Property "%s" is not searchable. Only "string" properties are searchable.', FACET_NOT_SUPPORTED: 'Facet doens\'t support the type "%s".', INVALID_DISTANCE_SUFFIX: 'Invalid distance suffix "%s". Valid suffixes are: cm, m, km, mi, yd, ft.', INVALID_SEARCH_MODE: 'Invalid search mode "%s". Valid modes are: "fulltext", "vector", "hybrid".', MISSING_VECTOR_AND_SECURE_PROXY: 'No vector was provided and no secure proxy was configured. Please provide a vector or configure an Orama Secure Proxy to perform hybrid search.', MISSING_TERM: '"term" is a required parameter when performing hybrid search. Please provide a search term.', INVALID_VECTOR_INPUT: 'Invalid "vector" property. Expected an object with "value" and "property" properties, but got "%s" instead.', PLUGIN_CRASHED: 'A plugin crashed during initialization. Please check the error message for more information:', PLUGIN_SECURE_PROXY_NOT_FOUND: "Could not find '@orama/secure-proxy-plugin' installed in your Orama instance.\nPlease install it before proceeding with creating an answer session.\nRead more at https://docs.orama.com/open-source/plugins/plugin-secure-proxy#plugin-secure-proxy\n", PLUGIN_SECURE_PROXY_MISSING_CHAT_MODEL: 'Could not find a chat model defined in the secure proxy plugin configuration.\nPlease provide a chat model before proceeding with creating an answer session.\nRead more at https://docs.orama.com/open-source/plugins/plugin-secure-proxy#plugin-secure-proxy\n', ANSWER_SESSION_LAST_MESSAGE_IS_NOT_ASSISTANT: 'The last message in the session is not an assistant message. Cannot regenerate non-assistant messages.', PLUGIN_COMPONENT_CONFLICT: 'The component "%s" is already defined. The plugin "%s" is trying to redefine it.' };
  function x(e, ...t) {
    const n = new Error(
      (function (e, ...t) {
        return e.replace(/%(?:(?<position>\d+)\$)?(?<width>-?\d*\.?\d*)(?<type>[dfs])/g, function (...e) {
          const n = e[e.length - 1],
            { width: r, type: o, position: s } = n,
            i = s ? t[Number.parseInt(s) - 1] : t.shift(),
            a = '' === r ? 0 : Number.parseInt(r);
          switch (o) {
            case 'd':
              return i.toString().padStart(a, '0');
            case 'f': {
              let e = i;
              const [t, n] = r.split('.').map((e) => Number.parseFloat(e));
              return 'number' == typeof n && n >= 0 && (e = e.toFixed(n)), 'number' == typeof t && t >= 0 ? e.toString().padStart(a, '0') : e.toString();
            }
            case 's':
              return a < 0 ? i.toString().padEnd(-a, ' ') : i.toString().padStart(a, ' ');
            default:
              return i;
          }
        });
      })(E[e] ?? `Unsupported Orama Error code: ${e}`, ...t)
    );
    return (n.code = e), 'captureStackTrace' in Error.prototype && Error.captureStackTrace(n), n;
  }
  function P(e) {
    return { raw: Number(e), formatted: h(e) };
  }
  function k(e) {
    if (e.id) {
      if ('string' != typeof e.id) throw x('DOCUMENT_ID_MUST_BE_STRING', typeof e.id);
      return e.id;
    }
    return g();
  }
  function R(e, t) {
    for (const [n, r] of Object.entries(t)) {
      const t = e[n];
      if (void 0 !== t && ('geopoint' !== r || 'object' != typeof t || 'number' != typeof t.lon || 'number' != typeof t.lat) && ('enum' !== r || ('string' != typeof t && 'number' != typeof t)))
        if ('enum[]' === r && Array.isArray(t)) {
          const e = t.length;
          for (let r = 0; r < e; r++) if ('string' != typeof t[r] && 'number' != typeof t[r]) return n + '.' + r;
        } else if (C(r)) {
          const e = B(r);
          if (!Array.isArray(t) || t.length !== e) throw x('INVALID_INPUT_VECTOR', n, e, t.length);
        } else if (z(r)) {
          if (!Array.isArray(t)) return n;
          const e = U(r),
            o = t.length;
          for (let r = 0; r < o; r++) if (typeof t[r] !== e) return n + '.' + r;
        } else if ('object' != typeof r) {
          if (typeof t !== r) return n;
        } else {
          if (!t || 'object' != typeof t) return n;
          const e = R(t, r);
          if (e) return n + '.' + e;
        }
    }
  }
  const M = { 'string': !1, 'number': !1, 'boolean': !1, 'enum': !1, 'geopoint': !1, 'string[]': !0, 'number[]': !0, 'boolean[]': !0, 'enum[]': !0 },
    L = { 'string[]': 'string', 'number[]': 'number', 'boolean[]': 'boolean', 'enum[]': 'enum' };
  function C(e) {
    return 'string' == typeof e && /^vector\[\d+\]$/.test(e);
  }
  function z(e) {
    return 'string' == typeof e && M[e];
  }
  function U(e) {
    return L[e];
  }
  function B(e) {
    const t = Number(e.slice(7, -1));
    switch (!0) {
      case isNaN(t):
        throw x('INVALID_VECTOR_VALUE', e);
      case t <= 0:
        throw x('INVALID_VECTOR_SIZE', e);
      default:
        return t;
    }
  }
  function j(e) {
    return { internalIdToId: e.internalIdToId };
  }
  function W(e, t) {
    const { internalIdToId: n } = t;
    e.internalDocumentIDStore.idToInternalId.clear(), (e.internalDocumentIDStore.internalIdToId = []);
    const r = n.length;
    for (let t = 0; t < r; t++) {
      const r = n[t];
      e.internalDocumentIDStore.idToInternalId.set(r, t + 1), e.internalDocumentIDStore.internalIdToId.push(r);
    }
  }
  function V(e, t) {
    if ('string' == typeof t) {
      const n = e.idToInternalId.get(t);
      if (n) return n;
      const r = e.idToInternalId.size + 1;
      return e.idToInternalId.set(t, r), e.internalIdToId.push(t), r;
    }
    return t > e.internalIdToId.length ? V(e, t.toString()) : t;
  }
  function F(e, t) {
    if (e.internalIdToId.length < t) throw new Error(`Invalid internalId ${t}`);
    return e.internalIdToId[t - 1];
  }
  function $(e, t) {
    return { sharedInternalDocumentStore: t, docs: {}, count: 0 };
  }
  function G(e, t) {
    const n = V(e.sharedInternalDocumentStore, t);
    return e.docs[n];
  }
  function J(e, t) {
    const n = t.length,
      r = Array.from({ length: n });
    for (let o = 0; o < n; o++) {
      const n = V(e.sharedInternalDocumentStore, t[o]);
      r[o] = e.docs[n];
    }
    return r;
  }
  function Y(e) {
    return e.docs;
  }
  function H(e, t, n, r) {
    return void 0 === e.docs[n] && ((e.docs[n] = r), e.count++, !0);
  }
  function K(e, t) {
    const n = V(e.sharedInternalDocumentStore, t);
    return void 0 !== e.docs[n] && (delete e.docs[n], e.count--, !0);
  }
  function q(e) {
    return e.count;
  }
  function X(e, t) {
    const n = t;
    return { docs: n.docs, count: n.count, sharedInternalDocumentStore: e };
  }
  function Z(e) {
    return { docs: e.docs, count: e.count };
  }
  const Q = ['beforeInsert', 'afterInsert', 'beforeRemove', 'afterRemove', 'beforeUpdate', 'afterUpdate', 'beforeSearch', 'afterSearch', 'beforeInsertMultiple', 'afterInsertMultiple', 'beforeRemoveMultiple', 'afterRemoveMultiple', 'beforeUpdateMultiple', 'afterUpdateMultiple', 'beforeLoad', 'afterLoad', 'afterCreate'];
  function ee(e, t) {
    const n = [],
      r = e.plugins?.length;
    if (!r) return n;
    for (let o = 0; o < r; o++)
      try {
        const r = e.plugins[o];
        'function' == typeof r[t] && n.push(r[t]);
      } catch (e) {
        throw (console.error('Caught error in getAllPluginsByHook:', e), x('PLUGIN_CRASHED'));
      }
    return n;
  }
  const te = ['tokenizer', 'index', 'documentsStore', 'sorter'],
    ne = ['validateSchema', 'getDocumentIndexId', 'getDocumentProperties', 'formatElapsedTime'];
  function re(e, t, n, r) {
    if (e.some(T))
      return (async () => {
        for (const o of e) await o(t, n, r);
      })();
    for (const o of e) o(t, n, r);
  }
  function oe(e, t, n) {
    if (e.some(T))
      return (async () => {
        for (const r of e) await r(t, n);
      })();
    for (const r of e) r(t, n);
  }
  function se(e, t, n, r, o) {
    if (e.some(T))
      return (async () => {
        for (const s of e) await s(t, n, r, o);
      })();
    for (const s of e) s(t, n, r, o);
  }
  function ie(e, t, n, r) {
    if (e.some(T))
      return (async () => {
        for (const o of e) await o(t, n, r);
      })();
    for (const o of e) o(t, n, r);
  }
  class ae {
    k;
    v;
    l = null;
    r = null;
    h = 1;
    constructor(e, t) {
      (this.k = e), (this.v = new Set(t));
    }
    updateHeight() {
      this.h = Math.max(ae.getHeight(this.l), ae.getHeight(this.r)) + 1;
    }
    static getHeight(e) {
      return e ? e.h : 0;
    }
    getBalanceFactor() {
      return ae.getHeight(this.l) - ae.getHeight(this.r);
    }
    rotateLeft() {
      const e = this.r;
      return (this.r = e.l), (e.l = this), this.updateHeight(), e.updateHeight(), e;
    }
    rotateRight() {
      const e = this.l;
      return (this.l = e.r), (e.r = this), this.updateHeight(), e.updateHeight(), e;
    }
    toJSON() {
      return { k: this.k, v: Array.from(this.v), l: this.l ? this.l.toJSON() : null, r: this.r ? this.r.toJSON() : null, h: this.h };
    }
    static fromJSON(e) {
      const t = new ae(e.k, e.v);
      return (t.l = e.l ? ae.fromJSON(e.l) : null), (t.r = e.r ? ae.fromJSON(e.r) : null), (t.h = e.h), t;
    }
  }
  class ce {
    root = null;
    insertCount = 0;
    constructor(e, t) {
      void 0 !== e && void 0 !== t && (this.root = new ae(e, t));
    }
    insert(e, t, n = 1e3) {
      this.root = this.insertNode(this.root, e, t, n);
    }
    insertMultiple(e, t, n = 1e3) {
      for (const r of t) this.insert(e, r, n);
    }
    rebalance() {
      this.root && (this.root = this.rebalanceNode(this.root));
    }
    toJSON() {
      return { root: this.root ? this.root.toJSON() : null, insertCount: this.insertCount };
    }
    static fromJSON(e) {
      const t = new ce();
      return (t.root = e.root ? ae.fromJSON(e.root) : null), (t.insertCount = e.insertCount || 0), t;
    }
    insertNode(e, t, n, r) {
      if (null === e) return new ae(t, [n]);
      const o = [];
      let s = e,
        i = null;
      for (; null !== s; )
        if ((o.push({ parent: i, node: s }), t < s.k)) {
          if (null === s.l) {
            (s.l = new ae(t, [n])), o.push({ parent: s, node: s.l });
            break;
          }
          (i = s), (s = s.l);
        } else {
          if (!(t > s.k)) return s.v.add(n), e;
          if (null === s.r) {
            (s.r = new ae(t, [n])), o.push({ parent: s, node: s.r });
            break;
          }
          (i = s), (s = s.r);
        }
      let a = !1;
      this.insertCount++ % r == 0 && (a = !0);
      for (let t = o.length - 1; t >= 0; t--) {
        const { parent: n, node: r } = o[t];
        if ((r.updateHeight(), a)) {
          const t = this.rebalanceNode(r);
          n ? (n.l === r ? (n.l = t) : n.r === r && (n.r = t)) : (e = t);
        }
      }
      return e;
    }
    rebalanceNode(e) {
      const t = e.getBalanceFactor();
      if (t > 1) {
        if (e.l && e.l.getBalanceFactor() >= 0) return e.rotateRight();
        if (e.l) return (e.l = e.l.rotateLeft()), e.rotateRight();
      }
      if (t < -1) {
        if (e.r && e.r.getBalanceFactor() <= 0) return e.rotateLeft();
        if (e.r) return (e.r = e.r.rotateRight()), e.rotateLeft();
      }
      return e;
    }
    find(e) {
      const t = this.findNodeByKey(e);
      return t ? t.v : null;
    }
    contains(e) {
      return null !== this.find(e);
    }
    getSize() {
      let e = 0;
      const t = [];
      let n = this.root;
      for (; n || t.length > 0; ) {
        for (; n; ) t.push(n), (n = n.l);
        (n = t.pop()), e++, (n = n.r);
      }
      return e;
    }
    isBalanced() {
      if (!this.root) return !0;
      const e = [this.root];
      for (; e.length > 0; ) {
        const t = e.pop(),
          n = t.getBalanceFactor();
        if (Math.abs(n) > 1) return !1;
        t.l && e.push(t.l), t.r && e.push(t.r);
      }
      return !0;
    }
    remove(e) {
      this.root = this.removeNode(this.root, e);
    }
    removeDocument(e, t) {
      const n = this.findNodeByKey(e);
      n && (1 === n.v.size ? (this.root = this.removeNode(this.root, e)) : (n.v = new Set([...n.v.values()].filter((e) => e !== t))));
    }
    findNodeByKey(e) {
      let t = this.root;
      for (; t; )
        if (e < t.k) t = t.l;
        else {
          if (!(e > t.k)) return t;
          t = t.r;
        }
      return null;
    }
    removeNode(e, t) {
      if (null === e) return null;
      const n = [];
      let r = e;
      for (; null !== r && r.k !== t; ) n.push(r), (r = t < r.k ? r.l : r.r);
      if (null === r) return e;
      if (null === r.l || null === r.r) {
        const t = r.l ? r.l : r.r;
        if (0 === n.length) e = t;
        else {
          const e = n[n.length - 1];
          e.l === r ? (e.l = t) : (e.r = t);
        }
      } else {
        let e = r,
          t = r.r;
        for (; null !== t.l; ) (e = t), (t = t.l);
        (r.k = t.k), (r.v = t.v), e.l === t ? (e.l = t.r) : (e.r = t.r), (r = e);
      }
      n.push(r);
      for (let t = n.length - 1; t >= 0; t--) {
        const r = n[t];
        r.updateHeight();
        const o = this.rebalanceNode(r);
        if (t > 0) {
          const e = n[t - 1];
          e.l === r ? (e.l = o) : e.r === r && (e.r = o);
        } else e = o;
      }
      return e;
    }
    rangeSearch(e, t) {
      let n = new Set();
      const r = [];
      let o = this.root;
      for (; o || r.length > 0; ) {
        for (; o; ) r.push(o), (o = o.l);
        if (((o = r.pop()), o.k >= e && o.k <= t && (n = _(n, o.v)), o.k > t)) break;
        o = o.r;
      }
      return n;
    }
    greaterThan(e, t = !1) {
      let n = new Set();
      const r = [];
      let o = this.root;
      for (; o || r.length > 0; ) {
        for (; o; ) r.push(o), (o = o.r);
        if (((o = r.pop()), (t && o.k >= e) || (!t && o.k > e))) n = _(n, o.v);
        else if (o.k <= e) break;
        o = o.l;
      }
      return n;
    }
    lessThan(e, t = !1) {
      let n = new Set();
      const r = [];
      let o = this.root;
      for (; o || r.length > 0; ) {
        for (; o; ) r.push(o), (o = o.l);
        if (((o = r.pop()), (t && o.k <= e) || (!t && o.k < e))) n = _(n, o.v);
        else if (o.k > e) break;
        o = o.r;
      }
      return n;
    }
  }
  class le {
    numberToDocumentId;
    constructor() {
      this.numberToDocumentId = new Map();
    }
    insert(e, t) {
      this.numberToDocumentId.has(e) ? this.numberToDocumentId.get(e).add(t) : this.numberToDocumentId.set(e, new Set([t]));
    }
    find(e) {
      const t = this.numberToDocumentId.get(e);
      return t ? Array.from(t) : null;
    }
    remove(e) {
      this.numberToDocumentId.delete(e);
    }
    removeDocument(e, t) {
      const n = this.numberToDocumentId.get(t);
      n && (n.delete(e), 0 === n.size && this.numberToDocumentId.delete(t));
    }
    contains(e) {
      return this.numberToDocumentId.has(e);
    }
    getSize() {
      let e = 0;
      for (const t of this.numberToDocumentId.values()) e += t.size;
      return e;
    }
    filter(e) {
      const t = Object.keys(e);
      if (1 !== t.length) throw new Error('Invalid operation');
      const n = t[0];
      switch (n) {
        case 'eq': {
          const t = e[n],
            r = this.numberToDocumentId.get(t);
          return r ? Array.from(r) : [];
        }
        case 'in': {
          const t = e[n],
            r = new Set();
          for (const e of t) {
            const t = this.numberToDocumentId.get(e);
            if (t) for (const e of t) r.add(e);
          }
          return Array.from(r);
        }
        case 'nin': {
          const t = new Set(e[n]),
            r = new Set();
          for (const [e, n] of this.numberToDocumentId.entries()) if (!t.has(e)) for (const e of n) r.add(e);
          return Array.from(r);
        }
        default:
          throw new Error('Invalid operation');
      }
    }
    filterArr(e) {
      const t = Object.keys(e);
      if (1 !== t.length) throw new Error('Invalid operation');
      const n = t[0];
      switch (n) {
        case 'containsAll': {
          const t = e[n].map((e) => this.numberToDocumentId.get(e) ?? new Set());
          if (0 === t.length) return [];
          const r = t.reduce((e, t) => new Set([...e].filter((e) => t.has(e))));
          return Array.from(r);
        }
        case 'containsAny': {
          const t = e[n].map((e) => this.numberToDocumentId.get(e) ?? new Set());
          if (0 === t.length) return [];
          const r = t.reduce((e, t) => new Set([...e, ...t]));
          return Array.from(r);
        }
        default:
          throw new Error('Invalid operation');
      }
    }
    static fromJSON(e) {
      if (!e.numberToDocumentId) throw new Error('Invalid Flat Tree JSON');
      const t = new le();
      for (const [n, r] of e.numberToDocumentId) t.numberToDocumentId.set(n, new Set(r));
      return t;
    }
    toJSON() {
      return { numberToDocumentId: Array.from(this.numberToDocumentId.entries()).map(([e, t]) => [e, Array.from(t)]) };
    }
  }
  function ue(e, t, n) {
    if (n < 0) return -1;
    if (e === t) return 0;
    const r = e.length,
      o = t.length;
    if (0 === r) return o <= n ? o : -1;
    if (0 === o) return r <= n ? r : -1;
    const s = Math.abs(r - o);
    if (e.startsWith(t)) return s <= n ? s : -1;
    if (t.startsWith(e)) return 0;
    if (s > n) return -1;
    const i = [];
    for (let e = 0; e <= r; e++) {
      i[e] = [e];
      for (let t = 1; t <= o; t++) i[e][t] = 0 === e ? t : 0;
    }
    for (let s = 1; s <= r; s++) {
      let r = 1 / 0;
      for (let n = 1; n <= o; n++) e[s - 1] === t[n - 1] ? (i[s][n] = i[s - 1][n - 1]) : (i[s][n] = Math.min(i[s - 1][n] + 1, i[s][n - 1] + 1, i[s - 1][n - 1] + 1)), (r = Math.min(r, i[s][n]));
      if (r > n) return -1;
    }
    return i[r][o] <= n ? i[r][o] : -1;
  }
  function fe(e, t, n) {
    const r = ue(e, t, n);
    return { distance: r, isBounded: r >= 0 };
  }
  class de {
    k;
    s;
    c = new Map();
    d = new Set();
    e;
    w = '';
    constructor(e, t, n) {
      (this.k = e), (this.s = t), (this.e = n);
    }
    updateParent(e) {
      this.w = e.w + this.s;
    }
    addDocument(e) {
      this.d.add(e);
    }
    removeDocument(e) {
      return this.d.delete(e);
    }
    findAllWords(e, t, n, r) {
      const o = [this];
      for (; o.length > 0; ) {
        const s = o.pop();
        if (s.e) {
          const { w: o, d: i } = s;
          if (n && o !== t) continue;
          if (null !== m(e, o))
            if (r) {
              if (!(Math.abs(t.length - o.length) <= r && fe(t, o, r).isBounded)) continue;
              e[o] = [];
            } else e[o] = [];
          if (null != m(e, o) && i.size > 0) {
            const t = e[o];
            for (const e of i) t.includes(e) || t.push(e);
          }
        }
        s.c.size > 0 && o.push(...s.c.values());
      }
      return e;
    }
    insert(e, t) {
      let n = this,
        r = 0;
      const o = e.length;
      for (; r < o; ) {
        const s = e[r],
          i = n.c.get(s);
        if (i) {
          const s = i.s,
            a = s.length;
          let c = 0;
          for (; c < a && r + c < o && s[c] === e[r + c]; ) c++;
          if (c === a) {
            if (((n = i), (r += c), r === o)) return i.e || (i.e = !0), void i.addDocument(t);
            continue;
          }
          const l = s.slice(0, c),
            u = s.slice(c),
            f = e.slice(r + c),
            d = new de(l[0], l, !1);
          if ((n.c.set(l[0], d), d.updateParent(n), (i.s = u), (i.k = u[0]), d.c.set(u[0], i), i.updateParent(d), f)) {
            const e = new de(f[0], f, !0);
            e.addDocument(t), d.c.set(f[0], e), e.updateParent(d);
          } else (d.e = !0), d.addDocument(t);
          return;
        }
        {
          const o = new de(s, e.slice(r), !0);
          return o.addDocument(t), n.c.set(s, o), void o.updateParent(n);
        }
      }
      n.e || (n.e = !0), n.addDocument(t);
    }
    _findLevenshtein(e, t, n, r, o) {
      const s = [{ node: this, index: t, tolerance: n }];
      for (; s.length > 0; ) {
        const { node: t, index: n, tolerance: i } = s.pop();
        if (t.w.startsWith(e)) {
          t.findAllWords(o, e, !1, 0);
          continue;
        }
        if (i < 0) continue;
        if (t.e) {
          const { w: n, d: s } = t;
          if (n && (fe(e, n, r).isBounded && (o[n] = []), void 0 !== m(o, n) && s.size > 0)) {
            const e = new Set(o[n]);
            for (const t of s) e.add(t);
            o[n] = Array.from(e);
          }
        }
        if (n >= e.length) continue;
        const a = e[n];
        if (t.c.has(a)) {
          const e = t.c.get(a);
          s.push({ node: e, index: n + 1, tolerance: i });
        }
        s.push({ node: t, index: n + 1, tolerance: i - 1 });
        for (const [e, r] of t.c) s.push({ node: r, index: n, tolerance: i - 1 }), e !== a && s.push({ node: r, index: n + 1, tolerance: i - 1 });
      }
    }
    find(e) {
      const { term: t, exact: n, tolerance: r } = e;
      if (r && !n) {
        const e = {};
        return this._findLevenshtein(t, 0, r, r, e), e;
      }
      {
        let e = this,
          o = 0;
        const s = t.length;
        for (; o < s; ) {
          const i = t[o],
            a = e.c.get(i);
          if (!a) return {};
          {
            const i = a.s,
              c = i.length;
            let l = 0;
            for (; l < c && o + l < s && i[l] === t[o + l]; ) l++;
            if (l !== c) {
              if (o + l === s) {
                if (n) return {};
                {
                  const e = {};
                  return a.findAllWords(e, t, n, r), e;
                }
              }
              return {};
            }
            (e = a), (o += l);
          }
        }
        const i = {};
        return e.findAllWords(i, t, n, r), i;
      }
    }
    contains(e) {
      let t = this,
        n = 0;
      const r = e.length;
      for (; n < r; ) {
        const o = e[n],
          s = t.c.get(o);
        if (!s) return !1;
        {
          const o = s.s,
            i = o.length;
          let a = 0;
          for (; a < i && n + a < r && o[a] === e[n + a]; ) a++;
          if (a < i) return !1;
          (n += i), (t = s);
        }
      }
      return !0;
    }
    removeWord(e) {
      if (!e) return !1;
      let t = this;
      const n = e.length,
        r = [];
      for (let o = 0; o < n; o++) {
        const n = e[o];
        if (!t.c.has(n)) return !1;
        {
          const e = t.c.get(n);
          r.push({ parent: t, character: n }), (o += e.s.length - 1), (t = e);
        }
      }
      for (t.d.clear(), t.e = !1; r.length > 0 && 0 === t.c.size && !t.e && 0 === t.d.size; ) {
        const { parent: e, character: n } = r.pop();
        e.c.delete(n), (t = e);
      }
      return !0;
    }
    removeDocumentByWord(e, t, n = !0) {
      if (!e) return !0;
      let r = this;
      const o = e.length;
      for (let s = 0; s < o; s++) {
        const o = e[s];
        if (!r.c.has(o)) return !1;
        {
          const i = r.c.get(o);
          (s += i.s.length - 1), (r = i), (n && r.w !== e) || r.removeDocument(t);
        }
      }
      return !0;
    }
    static getCommonPrefix(e, t) {
      const n = Math.min(e.length, t.length);
      let r = 0;
      for (; r < n && e.charCodeAt(r) === t.charCodeAt(r); ) r++;
      return e.slice(0, r);
    }
    toJSON() {
      return { w: this.w, s: this.s, e: this.e, k: this.k, d: Array.from(this.d), c: Array.from(this.c?.entries())?.map(([e, t]) => [e, t.toJSON()]) };
    }
    static fromJSON(e) {
      const t = new de(e.k, e.s, e.e);
      return (t.w = e.w), (t.d = new Set(e.d)), (t.c = new Map(e?.c?.map(([e, t]) => [e, de.fromJSON(t)]))), t;
    }
  }
  class he extends de {
    constructor() {
      super('', '', !1);
    }
    static fromJSON(e) {
      const t = new he();
      return (t.w = e.w), (t.s = e.s), (t.e = e.e), (t.k = e.k), (t.d = new Set(e.d)), (t.c = new Map(e.c?.map(([e, t]) => [e, de.fromJSON(t)]))), t;
    }
    toJSON() {
      return super.toJSON();
    }
  }
  class pe {
    point;
    docIDs;
    left;
    right;
    parent;
    constructor(e, t) {
      (this.point = e), (this.docIDs = new Set(t)), (this.left = null), (this.right = null), (this.parent = null);
    }
    toJSON() {
      return { point: this.point, docIDs: Array.from(this.docIDs), left: this.left ? this.left.toJSON() : null, right: this.right ? this.right.toJSON() : null };
    }
    static fromJSON(e, t = null) {
      const n = new pe(e.point, e.docIDs);
      return (n.parent = t), e.left && (n.left = pe.fromJSON(e.left, n)), e.right && (n.right = pe.fromJSON(e.right, n)), n;
    }
  }
  class ge {
    root;
    nodeMap;
    constructor() {
      (this.root = null), (this.nodeMap = new Map());
    }
    getPointKey(e) {
      return `${e.lon},${e.lat}`;
    }
    insert(e, t) {
      const n = this.getPointKey(e),
        r = this.nodeMap.get(n);
      if (r) return void t.forEach((e) => r.docIDs.add(e));
      const o = new pe(e, t);
      if ((this.nodeMap.set(n, o), null == this.root)) return void (this.root = o);
      let s = this.root,
        i = 0;
      for (;;) {
        if (0 === i % 2)
          if (e.lon < s.point.lon) {
            if (null == s.left) return (s.left = o), void (o.parent = s);
            s = s.left;
          } else {
            if (null == s.right) return (s.right = o), void (o.parent = s);
            s = s.right;
          }
        else if (e.lat < s.point.lat) {
          if (null == s.left) return (s.left = o), void (o.parent = s);
          s = s.left;
        } else {
          if (null == s.right) return (s.right = o), void (o.parent = s);
          s = s.right;
        }
        i++;
      }
    }
    contains(e) {
      const t = this.getPointKey(e);
      return this.nodeMap.has(t);
    }
    getDocIDsByCoordinates(e) {
      const t = this.getPointKey(e),
        n = this.nodeMap.get(t);
      return n ? Array.from(n.docIDs) : null;
    }
    removeDocByID(e, t) {
      const n = this.getPointKey(e),
        r = this.nodeMap.get(n);
      r && (r.docIDs.delete(t), 0 === r.docIDs.size && (this.nodeMap.delete(n), this.deleteNode(r)));
    }
    deleteNode(e) {
      const t = e.parent,
        n = e.left ? e.left : e.right;
      n && (n.parent = t), t ? (t.left === e ? (t.left = n) : t.right === e && (t.right = n)) : ((this.root = n), this.root && (this.root.parent = null));
    }
    searchByRadius(e, t, n = !0, r = 'asc', o = !1) {
      const s = o ? ge.vincentyDistance : ge.haversineDistance,
        i = [{ node: this.root, depth: 0 }],
        a = [];
      for (; i.length > 0; ) {
        const { node: r, depth: o } = i.pop();
        if (null == r) continue;
        const c = s(e, r.point);
        (n ? c <= t : c > t) && a.push({ point: r.point, docIDs: Array.from(r.docIDs) }), null != r.left && i.push({ node: r.left, depth: o + 1 }), null != r.right && i.push({ node: r.right, depth: o + 1 });
      }
      return (
        r &&
          a.sort((t, n) => {
            const o = s(e, t.point),
              i = s(e, n.point);
            return 'asc' === r.toLowerCase() ? o - i : i - o;
          }),
        a
      );
    }
    searchByPolygon(e, t = !0, n = null, r = !1) {
      const o = [{ node: this.root, depth: 0 }],
        s = [];
      for (; o.length > 0; ) {
        const { node: n, depth: r } = o.pop();
        if (null == n) continue;
        null != n.left && o.push({ node: n.left, depth: r + 1 }), null != n.right && o.push({ node: n.right, depth: r + 1 });
        const i = ge.isPointInPolygon(e, n.point);
        ((i && t) || (!i && !t)) && s.push({ point: n.point, docIDs: Array.from(n.docIDs) });
      }
      const i = ge.calculatePolygonCentroid(e);
      if (n) {
        const e = r ? ge.vincentyDistance : ge.haversineDistance;
        s.sort((t, r) => {
          const o = e(i, t.point),
            s = e(i, r.point);
          return 'asc' === n.toLowerCase() ? o - s : s - o;
        });
      }
      return s;
    }
    toJSON() {
      return { root: this.root ? this.root.toJSON() : null };
    }
    static fromJSON(e) {
      const t = new ge();
      return e.root && ((t.root = pe.fromJSON(e.root)), t.buildNodeMap(t.root)), t;
    }
    buildNodeMap(e) {
      if (null == e) return;
      const t = this.getPointKey(e.point);
      this.nodeMap.set(t, e), e.left && this.buildNodeMap(e.left), e.right && this.buildNodeMap(e.right);
    }
    static calculatePolygonCentroid(e) {
      let t = 0,
        n = 0,
        r = 0;
      const o = e.length;
      for (let s = 0, i = o - 1; s < o; i = s++) {
        const o = e[s].lon,
          a = e[s].lat,
          c = e[i].lon,
          l = e[i].lat,
          u = o * l - c * a;
        (t += u), (n += (o + c) * u), (r += (a + l) * u);
      }
      t /= 2;
      const s = 6 * t;
      return (n /= s), (r /= s), { lon: n, lat: r };
    }
    static isPointInPolygon(e, t) {
      let n = !1;
      const r = t.lon,
        o = t.lat,
        s = e.length;
      for (let t = 0, i = s - 1; t < s; i = t++) {
        const s = e[t].lon,
          a = e[t].lat,
          c = e[i].lon,
          l = e[i].lat;
        a > o != l > o && r < ((c - s) * (o - a)) / (l - a) + s && (n = !n);
      }
      return n;
    }
    static haversineDistance(e, t) {
      const n = Math.PI / 180,
        r = e.lat * n,
        o = t.lat * n,
        s = (t.lat - e.lat) * n,
        i = (t.lon - e.lon) * n,
        a = Math.sin(s / 2) * Math.sin(s / 2) + Math.cos(r) * Math.cos(o) * Math.sin(i / 2) * Math.sin(i / 2);
      return 6371e3 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    static vincentyDistance(e, t) {
      const n = 6378137,
        r = 1 / 298.257223563,
        o = (1 - r) * n,
        s = Math.PI / 180,
        i = e.lat * s,
        a = t.lat * s,
        c = (t.lon - e.lon) * s,
        l = Math.atan((1 - r) * Math.tan(i)),
        u = Math.atan((1 - r) * Math.tan(a)),
        f = Math.sin(l),
        d = Math.cos(l),
        h = Math.sin(u),
        p = Math.cos(u);
      let g,
        m,
        y,
        b,
        S,
        w,
        v,
        I = c,
        O = 1e3;
      do {
        const e = Math.sin(I),
          t = Math.cos(I);
        if (((m = Math.sqrt(p * e * (p * e) + (d * h - f * p * t) * (d * h - f * p * t))), 0 === m)) return 0;
        (y = f * h + d * p * t), (b = Math.atan2(m, y)), (S = (d * p * e) / m), (w = 1 - S * S), (v = y - (2 * f * h) / w), isNaN(v) && (v = 0);
        const n = (r / 16) * w * (4 + r * (4 - 3 * w));
        (g = I), (I = c + (1 - n) * r * S * (b + n * m * (v + n * y * (2 * v * v - 1))));
      } while (Math.abs(I - g) > 1e-12 && --O > 0);
      if (0 === O) return NaN;
      const T = (w * (n * n - o * o)) / (o * o),
        N = (T / 1024) * (256 + T * (T * (74 - 47 * T) - 128));
      return o * (1 + (T / 16384) * (4096 + T * (T * (320 - 175 * T) - 768))) * (b - N * m * (v + (N / 4) * (y * (2 * v * v - 1) - (N / 6) * v * (4 * m * m - 3) * (4 * v * v - 3))));
    }
  }
  class me {
    true;
    false;
    constructor() {
      (this.true = new Set()), (this.false = new Set());
    }
    insert(e, t) {
      t ? this.true.add(e) : this.false.add(e);
    }
    delete(e, t) {
      t ? this.true.delete(e) : this.false.delete(e);
    }
    getSize() {
      return this.true.size + this.false.size;
    }
    toJSON() {
      return { true: Array.from(this.true), false: Array.from(this.false) };
    }
    static fromJSON(e) {
      const t = new me();
      return (t.true = new Set(e.true)), (t.false = new Set(e.false)), t;
    }
  }
  function ye(e, t, n, r, o, { k: s, b: i, d: a }) {
    return (Math.log(1 + (n - t + 0.5) / (t + 0.5)) * (a + e * (s + 1))) / (e + s * (1 - i + (i * r) / o));
  }
  class be {
    size;
    vectors = new Map();
    constructor(e) {
      this.size = e;
    }
    add(e, t) {
      t instanceof Float32Array || (t = new Float32Array(t));
      const n = Se(t, this.size);
      this.vectors.set(e, [n, t]);
    }
    remove(e) {
      this.vectors.delete(e);
    }
    find(e, t, n) {
      e instanceof Float32Array || (e = new Float32Array(e));
      const r = (function (e, t, n, r, o) {
        const s = Se(e, r),
          i = [],
          a = t || n.keys();
        for (const t of a) {
          const a = n.get(t);
          if (!a) continue;
          const c = a[0],
            l = a[1];
          let u = 0;
          for (let t = 0; t < r; t++) u += e[t] * l[t];
          const f = u / (s * c);
          f >= o && i.push([t, f]);
        }
        return i;
      })(e, n, this.vectors, this.size, t);
      return r;
    }
    toJSON() {
      const e = [];
      for (const [t, [n, r]] of this.vectors) e.push([t, [n, Array.from(r)]]);
      return { size: this.size, vectors: e };
    }
    static fromJSON(e) {
      const t = e,
        n = new be(t.size);
      for (const [e, [r, o]] of t.vectors) n.vectors.set(e, [r, new Float32Array(o)]);
      return n;
    }
  }
  function Se(e, t) {
    let n = 0;
    for (let r = 0; r < t; r++) n += e[r] * e[r];
    return Math.sqrt(n);
  }
  function we(e, t, n, r, o) {
    const s = V(e.sharedInternalDocumentStore, n);
    (e.avgFieldLength[t] = ((e.avgFieldLength[t] ?? 0) * (o - 1) + r.length) / o), (e.fieldLengths[t][s] = r.length), (e.frequencies[t][s] = {});
  }
  function ve(e, t, n, r, o) {
    let s = 0;
    for (const e of r) e === o && s++;
    const i = V(e.sharedInternalDocumentStore, n),
      a = s / r.length;
    (e.frequencies[t][i][o] = a), o in e.tokenOccurrences[t] || (e.tokenOccurrences[t][o] = 0), (e.tokenOccurrences[t][o] = (e.tokenOccurrences[t][o] ?? 0) + 1);
  }
  function Ie(e, t, n, r) {
    const o = V(e.sharedInternalDocumentStore, n);
    (e.avgFieldLength[t] = r > 1 ? (e.avgFieldLength[t] * r - e.fieldLengths[t][o]) / (r - 1) : void 0), (e.fieldLengths[t][o] = void 0), (e.frequencies[t][o] = void 0);
  }
  function Oe(e, t, n) {
    e.tokenOccurrences[t][n]--;
  }
  function Te(e, t, n, r, o = '') {
    r || (r = { sharedInternalDocumentStore: t, indexes: {}, vectorIndexes: {}, searchableProperties: [], searchablePropertiesWithTypes: {}, frequencies: {}, tokenOccurrences: {}, avgFieldLength: {}, fieldLengths: {} });
    for (const [s, i] of Object.entries(n)) {
      const n = `${o}${o ? '.' : ''}${s}`;
      if ('object' != typeof i || Array.isArray(i))
        if (C(i)) r.searchableProperties.push(n), (r.searchablePropertiesWithTypes[n] = i), (r.vectorIndexes[n] = { type: 'Vector', node: new be(B(i)), isArray: !1 });
        else {
          const e = /\[/.test(i);
          switch (i) {
            case 'boolean':
            case 'boolean[]':
              r.indexes[n] = { type: 'Bool', node: new me(), isArray: e };
              break;
            case 'number':
            case 'number[]':
              r.indexes[n] = { type: 'AVL', node: new ce(0, []), isArray: e };
              break;
            case 'string':
            case 'string[]':
              (r.indexes[n] = { type: 'Radix', node: new he(), isArray: e }), (r.avgFieldLength[n] = 0), (r.frequencies[n] = {}), (r.tokenOccurrences[n] = {}), (r.fieldLengths[n] = {});
              break;
            case 'enum':
            case 'enum[]':
              r.indexes[n] = { type: 'Flat', node: new le(), isArray: e };
              break;
            case 'geopoint':
              r.indexes[n] = { type: 'BKD', node: new ge(), isArray: e };
              break;
            default:
              throw x('INVALID_SCHEMA_TYPE', Array.isArray(i) ? 'array' : i, n);
          }
          r.searchableProperties.push(n), (r.searchablePropertiesWithTypes[n] = i);
        }
      else Te(e, t, i, r, n);
    }
    return r;
  }
  function Ne(e, t, n, r, o, s, i, a, c, l, u) {
    if (C(i))
      return (function (e, t, n, r, o) {
        e.vectorIndexes[t].node.add(o, n);
      })(t, n, s, 0, o);
    const f = (function (e, t, n, r, o, s, i, a) {
      return (c) => {
        const { type: l, node: u } = t.indexes[n];
        switch (l) {
          case 'Bool':
            u[c ? 'true' : 'false'].add(r);
            break;
          case 'AVL': {
            const e = a?.avlRebalanceThreshold ?? 1;
            u.insert(c, r, e);
            break;
          }
          case 'Radix': {
            const a = s.tokenize(c, o, n, !1);
            e.insertDocumentScoreParameters(t, n, r, a, i);
            for (const o of a) e.insertTokenScoreParameters(t, n, r, a, o), u.insert(o, r);
            break;
          }
          case 'Flat':
            u.insert(c, r);
            break;
          case 'BKD':
            u.insert(c, [r]);
        }
      };
    })(e, t, n, o, a, c, l, u);
    if (!z(i)) return f(s);
    const d = s,
      h = d.length;
    for (let e = 0; e < h; e++) f(d[e]);
  }
  function Ae(e, t, n, r, o, s, i, a, c, l) {
    if (C(i)) return t.vectorIndexes[n].node.remove(o), !0;
    const { type: u, node: f } = t.indexes[n];
    switch (u) {
      case 'AVL':
        return f.removeDocument(s, o), !0;
      case 'Bool':
        return f[s ? 'true' : 'false'].delete(o), !0;
      case 'Radix': {
        const i = c.tokenize(s, a, n);
        e.removeDocumentScoreParameters(t, n, r, l);
        for (const r of i) e.removeTokenScoreParameters(t, n, r), f.removeDocumentByWord(r, o);
        return !0;
      }
      case 'Flat':
        return f.removeDocument(o, s), !0;
      case 'BKD':
        return f.removeDocByID(s, o), !1;
    }
  }
  function _e(e, t, n, r, o, s, i, a, c, l) {
    if (!z(i)) return Ae(e, t, n, r, o, s, i, a, c, l);
    const u = U(i),
      f = s,
      d = f.length;
    for (let s = 0; s < d; s++) Ae(e, t, n, r, o, f[s], u, a, c, l);
    return !0;
  }
  function De(e, t, n, r, o, s, i, a, c, l) {
    const u = Array.from(r),
      f = e.avgFieldLength[t],
      d = e.fieldLengths[t],
      h = e.tokenOccurrences[t],
      p = e.frequencies[t],
      g = 'number' == typeof h[n] ? h[n] ?? 0 : 0,
      m = u.length;
    for (let e = 0; e < m; e++) {
      const r = u[e];
      if (c && !c.has(r)) continue;
      l.has(r) || l.set(r, new Map());
      const h = l.get(r);
      h.set(t, (h.get(t) || 0) + 1);
      const m = ye(p?.[r]?.[n] ?? 0, g, o, d[r], f, s);
      i.has(r) ? i.set(r, i.get(r) + m * a) : i.set(r, m * a);
    }
  }
  function Ee(e, t, n, r, o, s, i, a, c, l, u, f) {
    const d = r.length;
    for (let h = 0; h < d; h++) {
      const d = r[h],
        p = t.find({ term: d, exact: o, tolerance: s }),
        g = Object.keys(p),
        m = g.length;
      for (let t = 0; t < m; t++) {
        const r = g[t];
        De(e, n, r, p[r], l, c, i, a, u, f);
      }
    }
  }
  function xe(e, t, n, r, o, s, i, a, c, l, u, f = 0) {
    const d = n.tokenize(t, r),
      h = d.length || 1,
      p = new Map(),
      g = new Map();
    for (const n of o) {
      if (!(n in e.indexes)) continue;
      const r = e.indexes[n],
        { type: o } = r;
      if ('Radix' !== o) throw x('WRONG_SEARCH_PROPERTY_TYPE', n);
      const f = a[n] ?? 1;
      if (f <= 0) throw x('INVALID_BOOST_VALUE', f);
      0 !== d.length || t || d.push(''), Ee(e, r.node, n, d, s, i, g, f, c, l, u, p);
    }
    const m = Array.from(g.entries())
      .map(([e, t]) => [e, t])
      .sort((e, t) => t[1] - e[1]);
    if (0 === m.length) return [];
    if (1 === f) return m;
    const y = m.filter(([e]) => {
      const t = p.get(e);
      return !!t && Array.from(t.values()).some((e) => e === h);
    });
    if (0 === f) return y;
    if (y.length > 0) {
      const e = m.filter(([e]) => !y.some(([t]) => t === e)),
        t = Math.ceil(e.length * f);
      return [...y, ...e.slice(0, t)];
    }
    return m;
  }
  function Pe(e, t, n, r) {
    const o = Object.keys(n),
      s = o.reduce((e, t) => ({ [t]: new Set(), ...e }), {});
    for (const i of o) {
      const o = n[i];
      if (void 0 === e.indexes[i]) throw x('UNKNOWN_FILTER_PROPERTY', i);
      const { node: a, type: c, isArray: l } = e.indexes[i];
      if ('Bool' === c) {
        const e = a,
          t = o ? e.true : e.false;
        s[i] = _(s[i], t);
        continue;
      }
      if ('BKD' === c) {
        let e;
        if ('radius' in o) e = 'radius';
        else {
          if (!('polygon' in o)) throw new Error(`Invalid operation ${o}`);
          e = 'polygon';
        }
        if ('radius' === e) {
          const { value: t, coordinates: n, unit: r = 'm', inside: c = !0, highPrecision: l = !1 } = o[e],
            u = I(t, r),
            f = a.searchByRadius(n, u, c, void 0, l);
          s[i] = Ce(s[i], f);
        } else {
          const { coordinates: t, inside: n = !0, highPrecision: r = !1 } = o[e],
            c = a.searchByPolygon(t, n, void 0, r);
          s[i] = Ce(s[i], c);
        }
        continue;
      }
      if ('Radix' === c && ('string' == typeof o || Array.isArray(o))) {
        for (const e of [o].flat()) {
          const n = t.tokenize(e, r, i);
          for (const e of n) {
            const t = a.find({ term: e, exact: !0 });
            s[i] = ze(s[i], t);
          }
        }
        continue;
      }
      const u = Object.keys(o);
      if (u.length > 1) throw x('INVALID_FILTER_OPERATION', u.length);
      if ('Flat' !== c) {
        if ('AVL' === c) {
          const e = u[0],
            t = o[e];
          let n;
          switch (e) {
            case 'gt':
              n = a.greaterThan(t, !1);
              break;
            case 'gte':
              n = a.greaterThan(t, !0);
              break;
            case 'lt':
              n = a.lessThan(t, !1);
              break;
            case 'lte':
              n = a.lessThan(t, !0);
              break;
            case 'eq':
              n = a.find(t) ?? new Set();
              break;
            case 'between': {
              const [e, r] = t;
              n = a.rangeSearch(e, r);
              break;
            }
            default:
              throw x('INVALID_FILTER_OPERATION', e);
          }
          s[i] = _(s[i], n);
        }
      } else {
        const e = new Set(l ? a.filterArr(o) : a.filter(o));
        s[i] = _(s[i], e);
      }
    }
    return (function (...e) {
      if (0 === e.length) return new Set();
      if (1 === e.length) return e[0];
      if (2 === e.length) {
        const t = e[0],
          n = e[1];
        if (N) return t.intersection(n);
        const r = new Set(),
          o = t.size < n.size ? t : n,
          s = o === t ? n : t;
        for (const e of o) s.has(e) && r.add(e);
        return r;
      }
      const t = { index: 0, size: e[0].size };
      for (let n = 1; n < e.length; n++) e[n].size < t.size && ((t.index = n), (t.size = e[n].size));
      if (N) {
        let n = e[t.index];
        for (let r = 0; r < e.length; r++) r !== t.index && (n = n.intersection(e[r]));
        return n;
      }
      const n = e[t.index];
      for (let r = 0; r < e.length; r++) {
        if (r === t.index) continue;
        const o = e[r];
        for (const e of n) o.has(e) || n.delete(e);
      }
      return n;
    })(...Object.values(s));
  }
  function ke(e) {
    return e.searchableProperties;
  }
  function Re(e) {
    return e.searchablePropertiesWithTypes;
  }
  function Me(e, t) {
    const { indexes: n, vectorIndexes: r, searchableProperties: o, searchablePropertiesWithTypes: s, frequencies: i, tokenOccurrences: a, avgFieldLength: c, fieldLengths: l } = t,
      u = {},
      f = {};
    for (const e of Object.keys(n)) {
      const { node: t, type: r, isArray: o } = n[e];
      switch (r) {
        case 'Radix':
          u[e] = { type: 'Radix', node: he.fromJSON(t), isArray: o };
          break;
        case 'Flat':
          u[e] = { type: 'Flat', node: le.fromJSON(t), isArray: o };
          break;
        case 'AVL':
          u[e] = { type: 'AVL', node: ce.fromJSON(t), isArray: o };
          break;
        case 'BKD':
          u[e] = { type: 'BKD', node: ge.fromJSON(t), isArray: o };
          break;
        case 'Bool':
          u[e] = { type: 'Bool', node: me.fromJSON(t), isArray: o };
          break;
        default:
          u[e] = n[e];
      }
    }
    for (const e of Object.keys(r)) f[e] = { type: 'Vector', isArray: !1, node: be.fromJSON(r[e]) };
    return { sharedInternalDocumentStore: e, indexes: u, vectorIndexes: f, searchableProperties: o, searchablePropertiesWithTypes: s, frequencies: i, tokenOccurrences: a, avgFieldLength: c, fieldLengths: l };
  }
  function Le(e) {
    const { indexes: t, vectorIndexes: n, searchableProperties: r, searchablePropertiesWithTypes: o, frequencies: s, tokenOccurrences: i, avgFieldLength: a, fieldLengths: c } = e,
      l = {};
    for (const e of Object.keys(n)) l[e] = n[e].node.toJSON();
    const u = {};
    for (const e of Object.keys(t)) {
      const { type: n, node: r, isArray: o } = t[e];
      'Flat' === n || 'Radix' === n || 'AVL' === n || 'BKD' === n || 'Bool' === n ? (u[e] = { type: n, node: r.toJSON(), isArray: o }) : ((u[e] = t[e]), (u[e].node = u[e].node.toJSON()));
    }
    return { indexes: u, vectorIndexes: l, searchableProperties: r, searchablePropertiesWithTypes: o, frequencies: s, tokenOccurrences: i, avgFieldLength: a, fieldLengths: c };
  }
  function Ce(e, t) {
    e || (e = new Set());
    const n = t.length;
    for (let r = 0; r < n; r++) {
      const n = t[r].docIDs,
        o = n.length;
      for (let t = 0; t < o; t++) e.add(n[t]);
    }
    return e;
  }
  function ze(e, t) {
    e || (e = new Set());
    const n = Object.keys(t),
      r = n.length;
    for (let o = 0; o < r; o++) {
      const r = t[n[o]],
        s = r.length;
      for (let t = 0; t < s; t++) e.add(r[t]);
    }
    return e;
  }
  function Ue(e, t, n, r, o) {
    const s = { language: e.tokenizer.language, sharedInternalDocumentStore: t, enabled: !0, isSorted: !0, sortableProperties: [], sortablePropertiesWithTypes: {}, sorts: {} };
    for (const [i, a] of Object.entries(n)) {
      const n = `${o}${o ? '.' : ''}${i}`;
      if (!r.includes(n))
        if ('object' != typeof a || Array.isArray(a)) {
          if (!C(a))
            switch (a) {
              case 'boolean':
              case 'number':
              case 'string':
                s.sortableProperties.push(n), (s.sortablePropertiesWithTypes[n] = a), (s.sorts[n] = { docs: new Map(), orderedDocsToRemove: new Map(), orderedDocs: [], type: a });
                break;
              case 'geopoint':
              case 'enum':
              case 'enum[]':
              case 'boolean[]':
              case 'number[]':
              case 'string[]':
                continue;
              default:
                throw x('INVALID_SORT_SCHEMA_TYPE', Array.isArray(a) ? 'array' : a, n);
            }
        } else {
          const o = Ue(e, t, a, r, n);
          f(s.sortableProperties, o.sortableProperties), (s.sorts = { ...s.sorts, ...o.sorts }), (s.sortablePropertiesWithTypes = { ...s.sortablePropertiesWithTypes, ...o.sortablePropertiesWithTypes });
        }
    }
    return s;
  }
  function Be(e, t, n, r) {
    return !1 !== r?.enabled ? Ue(e, t, n, (r || {}).unsortableProperties || [], '') : { disabled: !0 };
  }
  function je(e, t, n, r) {
    if (!e.enabled) return;
    e.isSorted = !1;
    const o = V(e.sharedInternalDocumentStore, n),
      s = e.sorts[t];
    s.orderedDocsToRemove.has(o) && Je(e, t), s.docs.set(o, s.orderedDocs.length), s.orderedDocs.push([o, r]);
  }
  function We(e) {
    if (e.isSorted || !e.enabled) return;
    const t = Object.keys(e.sorts);
    for (const n of t) Ge(e, n);
    e.isSorted = !0;
  }
  function Ve(e, t, r) {
    return t[1].localeCompare(
      r[1],
      (function (e) {
        return void 0 !== e && o.includes(e) ? n[e] : void 0;
      })(e)
    );
  }
  function Fe(e, t) {
    return e[1] - t[1];
  }
  function $e(e, t) {
    return t[1] ? -1 : 1;
  }
  function Ge(e, t) {
    const n = e.sorts[t];
    let r;
    switch (n.type) {
      case 'string':
        r = Ve.bind(null, e.language);
        break;
      case 'number':
        r = Fe.bind(null);
        break;
      case 'boolean':
        r = $e.bind(null);
    }
    n.orderedDocs.sort(r);
    const o = n.orderedDocs.length;
    for (let e = 0; e < o; e++) {
      const t = n.orderedDocs[e][0];
      n.docs.set(t, e);
    }
  }
  function Je(e, t) {
    const n = e.sorts[t];
    n.orderedDocsToRemove.size && ((n.orderedDocs = n.orderedDocs.filter((e) => !n.orderedDocsToRemove.has(e[0]))), n.orderedDocsToRemove.clear());
  }
  function Ye(e, t, n) {
    if (!e.enabled) return;
    const r = e.sorts[t],
      o = V(e.sharedInternalDocumentStore, n);
    r.docs.get(o) && (r.docs.delete(o), r.orderedDocsToRemove.set(o, !0));
  }
  function He(e, t, n) {
    if (!e.enabled) throw x('SORT_DISABLED');
    const r = n.property,
      o = 'DESC' === n.order,
      s = e.sorts[r];
    if (!s) throw x('UNABLE_TO_SORT_ON_UNKNOWN_FIELD', r, e.sortableProperties.join(', '));
    return (
      Je(e, r),
      We(e),
      t.sort((t, n) => {
        const r = s.docs.get(V(e.sharedInternalDocumentStore, t[0])),
          i = s.docs.get(V(e.sharedInternalDocumentStore, n[0])),
          a = void 0 !== r,
          c = void 0 !== i;
        return a || c ? (a ? (c ? (o ? i - r : r - i) : -1) : 1) : 0;
      }),
      t
    );
  }
  function Ke(e) {
    return e.enabled ? e.sortableProperties : [];
  }
  function qe(e) {
    return e.enabled ? e.sortablePropertiesWithTypes : {};
  }
  function Xe(e, t) {
    const n = t;
    if (!n.enabled) return { enabled: !1 };
    const r = Object.keys(n.sorts).reduce((e, t) => {
      const { docs: r, orderedDocs: o, type: s } = n.sorts[t];
      return (e[t] = { docs: new Map(Object.entries(r).map(([e, t]) => [+e, t])), orderedDocsToRemove: new Map(), orderedDocs: o, type: s }), e;
    }, {});
    return { sharedInternalDocumentStore: e, language: n.language, sortableProperties: n.sortableProperties, sortablePropertiesWithTypes: n.sortablePropertiesWithTypes, sorts: r, enabled: !0, isSorted: n.isSorted };
  }
  function Ze(e) {
    if (!e.enabled) return { enabled: !1 };
    !(function (e) {
      const t = Object.keys(e.sorts);
      for (const n of t) Je(e, n);
    })(e),
      We(e);
    const t = Object.keys(e.sorts).reduce((t, n) => {
      const { docs: r, orderedDocs: o, type: s } = e.sorts[n];
      return (t[n] = { docs: Object.fromEntries(r.entries()), orderedDocs: o, type: s }), t;
    }, {});
    return { language: e.language, sortableProperties: e.sortableProperties, sortablePropertiesWithTypes: e.sortablePropertiesWithTypes, sorts: t, enabled: e.enabled, isSorted: e.isSorted };
  }
  const Qe = [65, 65, 65, 65, 65, 65, 65, 67, 69, 69, 69, 69, 73, 73, 73, 73, 69, 78, 79, 79, 79, 79, 79, null, 79, 85, 85, 85, 85, 89, 80, 115, 97, 97, 97, 97, 97, 97, 97, 99, 101, 101, 101, 101, 105, 105, 105, 105, 101, 110, 111, 111, 111, 111, 111, null, 111, 117, 117, 117, 117, 121, 112, 121, 65, 97, 65, 97, 65, 97, 67, 99, 67, 99, 67, 99, 67, 99, 68, 100, 68, 100, 69, 101, 69, 101, 69, 101, 69, 101, 69, 101, 71, 103, 71, 103, 71, 103, 71, 103, 72, 104, 72, 104, 73, 105, 73, 105, 73, 105, 73, 105, 73, 105, 73, 105, 74, 106, 75, 107, 107, 76, 108, 76, 108, 76, 108, 76, 108, 76, 108, 78, 110, 78, 110, 78, 110, 110, 78, 110, 79, 111, 79, 111, 79, 111, 79, 111, 82, 114, 82, 114, 82, 114, 83, 115, 83, 115, 83, 115, 83, 115, 84, 116, 84, 116, 84, 116, 85, 117, 85, 117, 85, 117, 85, 117, 85, 117, 85, 117, 87, 119, 89, 121, 89, 90, 122, 90, 122, 90, 122, 115];
  const et = { ational: 'ate', tional: 'tion', enci: 'ence', anci: 'ance', izer: 'ize', bli: 'ble', alli: 'al', entli: 'ent', eli: 'e', ousli: 'ous', ization: 'ize', ation: 'ate', ator: 'ate', alism: 'al', iveness: 'ive', fulness: 'ful', ousness: 'ous', aliti: 'al', iviti: 'ive', biliti: 'ble', logi: 'log' },
    tt = { icate: 'ic', ative: '', alize: 'al', iciti: 'ic', ical: 'ic', ful: '', ness: '' },
    nt = '[aeiouy]',
    rt = '[^aeiou][^aeiouy]*',
    ot = nt + '[aeiou]*',
    st = '^(' + rt + ')?' + ot + rt,
    it = '^(' + rt + ')?' + ot + rt + '(' + ot + ')?$',
    at = '^(' + rt + ')?' + ot + rt + ot + rt,
    ct = '^(' + rt + ')?' + nt;
  function lt(e) {
    let t, n, r, o, s, i;
    if (e.length < 3) return e;
    const a = e.substring(0, 1);
    if (('y' == a && (e = a.toUpperCase() + e.substring(1)), (r = /^(.+?)(ss|i)es$/), (o = /^(.+?)([^s])s$/), r.test(e) ? (e = e.replace(r, '$1$2')) : o.test(e) && (e = e.replace(o, '$1$2')), (r = /^(.+?)eed$/), (o = /^(.+?)(ed|ing)$/), r.test(e))) {
      const t = r.exec(e);
      (r = new RegExp(st)), r.test(t[1]) && ((r = /.$/), (e = e.replace(r, '')));
    } else if (o.test(e)) {
      (t = o.exec(e)[1]), (o = new RegExp(ct)), o.test(t) && ((e = t), (o = /(at|bl|iz)$/), (s = new RegExp('([^aeiouylsz])\\1$')), (i = new RegExp('^' + rt + nt + '[^aeiouwxy]$')), o.test(e) ? (e += 'e') : s.test(e) ? ((r = /.$/), (e = e.replace(r, ''))) : i.test(e) && (e += 'e'));
    }
    if (((r = /^(.+?)y$/), r.test(e))) {
      const n = r.exec(e);
      (t = n?.[1]), (r = new RegExp(ct)), t && r.test(t) && (e = t + 'i');
    }
    if (((r = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/), r.test(e))) {
      const o = r.exec(e);
      (t = o?.[1]), (n = o?.[2]), (r = new RegExp(st)), t && r.test(t) && (e = t + et[n]);
    }
    if (((r = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/), r.test(e))) {
      const o = r.exec(e);
      (t = o?.[1]), (n = o?.[2]), (r = new RegExp(st)), t && r.test(t) && (e = t + tt[n]);
    }
    if (((r = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/), (o = /^(.+?)(s|t)(ion)$/), r.test(e))) {
      const n = r.exec(e);
      (t = n?.[1]), (r = new RegExp(at)), t && r.test(t) && (e = t);
    } else if (o.test(e)) {
      const n = o.exec(e);
      (t = n?.[1] ?? '' + n?.[2] ?? ''), (o = new RegExp(at)), o.test(t) && (e = t);
    }
    if (((r = /^(.+?)e$/), r.test(e))) {
      const n = r.exec(e);
      (t = n?.[1]), (r = new RegExp(at)), (o = new RegExp(it)), (s = new RegExp('^' + rt + nt + '[^aeiouwxy]$')), t && (r.test(t) || (o.test(t) && !s.test(t))) && (e = t);
    }
    return (r = /ll$/), (o = new RegExp(at)), r.test(e) && o.test(e) && ((r = /.$/), (e = e.replace(r, ''))), 'y' == a && (e = a.toLowerCase() + e.substring(1)), e;
  }
  function ut(e, t, n = !0) {
    const r = `${this.language}:${e}:${t}`;
    return n && this.normalizationCache.has(r)
      ? this.normalizationCache.get(r)
      : this.stopWords?.includes(t)
      ? (n && this.normalizationCache.set(r, ''), '')
      : (this.stemmer && !this.stemmerSkipProperties.has(e) && (t = this.stemmer(t)),
        (t = (function (e) {
          const t = [];
          for (let r = 0; r < e.length; r++) t[r] = (n = e.charCodeAt(r)) < 192 || n > 383 ? n : Qe[n - 192] || n;
          var n;
          return String.fromCharCode(...t);
        })(t)),
        n && this.normalizationCache.set(r, t),
        t);
  }
  function ft(e, t, n, o = !0) {
    if (t && t !== this.language) throw x('LANGUAGE_NOT_SUPPORTED', t);
    if ('string' != typeof e) return [e];
    const s = this.normalizeToken.bind(this, n ?? '');
    let i;
    if (n && this.tokenizeSkipProperties.has(n)) i = [s(e, o)];
    else {
      const t = r[this.language];
      i = e
        .toLowerCase()
        .split(t)
        .map((e) => s(e, o))
        .filter(Boolean);
    }
    const a = (function (e) {
      for (; '' === e[e.length - 1]; ) e.pop();
      for (; '' === e[0]; ) e.shift();
      return e;
    })(i);
    return this.allowDuplicates ? a : Array.from(new Set(a));
  }
  function dt(e = {}) {
    if (e.language) {
      if (!o.includes(e.language)) throw x('LANGUAGE_NOT_SUPPORTED', e.language);
    } else e.language = 'english';
    let t, n;
    if (e.stemming || (e.stemmer && !('stemming' in e)))
      if (e.stemmer) {
        if ('function' != typeof e.stemmer) throw x('INVALID_STEMMER_FUNCTION_TYPE');
        t = e.stemmer;
      } else {
        if ('english' !== e.language) throw x('MISSING_STEMMER', e.language);
        t = lt;
      }
    if (!1 !== e.stopWords) {
      if (((n = []), Array.isArray(e.stopWords))) n = e.stopWords;
      else if ('function' == typeof e.stopWords) n = e.stopWords(n);
      else if (e.stopWords) throw x('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
      if (!Array.isArray(n)) throw x('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
      for (const e of n) if ('string' != typeof e) throw x('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
    }
    const r = { tokenize: ft, language: e.language, stemmer: t, stemmerSkipProperties: new Set(e.stemmerSkipProperties ? [e.stemmerSkipProperties].flat() : []), tokenizeSkipProperties: new Set(e.tokenizeSkipProperties ? [e.tokenizeSkipProperties].flat() : []), stopWords: n, allowDuplicates: Boolean(e.allowDuplicates), normalizeToken: ut, normalizationCache: new Map() };
    return (r.tokenize = ft.bind(r)), (r.normalizeToken = ut), r;
  }
  function ht(e) {
    const t = { formatElapsedTime: P, getDocumentIndexId: k, getDocumentProperties: S, validateSchema: R };
    for (const n of ne) {
      const r = n;
      if (e[r]) {
        if ('function' != typeof e[r]) throw x('COMPONENT_MUST_BE_FUNCTION', r);
      } else e[r] = t[r];
    }
    for (const t of Object.keys(e)) if (!te.includes(t) && !ne.includes(t)) throw x('UNSUPPORTED_COMPONENT', t);
  }
  function pt({ schema: e, sort: t, language: n, components: r, id: o, plugins: s }) {
    r || (r = {});
    for (const t of s ?? []) {
      if (!('getComponents' in t)) continue;
      if ('function' != typeof t.getComponents) continue;
      const n = t.getComponents(e),
        o = Object.keys(n);
      for (const e of o) if (r[e]) throw x('PLUGIN_COMPONENT_CONFLICT', e, t.name);
      r = { ...r, ...n };
    }
    o || (o = g());
    let i = r.tokenizer,
      a = r.index,
      c = r.documentsStore,
      l = r.sorter;
    if (i)
      if (i.tokenize) {
        i = i;
      } else i = dt(i);
    else i = dt({ language: n ?? 'english' });
    if (r.tokenizer && n) throw x('NO_LANGUAGE_WITH_CUSTOM_TOKENIZER');
    const u = { idToInternalId: new Map(), internalIdToId: [], save: j, load: W };
    (a ||= { create: Te, insert: Ne, remove: _e, insertDocumentScoreParameters: we, insertTokenScoreParameters: ve, removeDocumentScoreParameters: Ie, removeTokenScoreParameters: Oe, calculateResultScores: De, search: xe, searchByWhereClause: Pe, getSearchableProperties: ke, getSearchablePropertiesWithTypes: Re, load: Me, save: Le }), (l ||= { create: Be, insert: je, remove: Ye, save: Ze, load: Xe, sortBy: He, getSortableProperties: Ke, getSortablePropertiesWithTypes: qe }), (c ||= { create: $, get: G, getMultiple: J, getAll: Y, store: H, remove: K, count: q, load: X, save: Z }), ht(r);
    const { getDocumentProperties: f, getDocumentIndexId: d, validateSchema: h, formatElapsedTime: p } = r,
      m = { data: {}, caches: {}, schema: e, tokenizer: i, index: a, sorter: l, documentsStore: c, internalDocumentIDStore: u, getDocumentProperties: f, getDocumentIndexId: d, validateSchema: h, beforeInsert: [], afterInsert: [], beforeRemove: [], afterRemove: [], beforeUpdate: [], afterUpdate: [], beforeSearch: [], afterSearch: [], beforeInsertMultiple: [], afterInsertMultiple: [], beforeRemoveMultiple: [], afterRemoveMultiple: [], afterUpdateMultiple: [], beforeUpdateMultiple: [], afterCreate: [], formatElapsedTime: p, id: o, plugins: s, version: '{{VERSION}}' };
    m.data = { index: m.index.create(m, u, e), docs: m.documentsStore.create(m, u), sorting: m.sorter.create(m, u, e, t) };
    for (const e of Q) m[e] = (m[e] ?? []).concat(ee(m, e));
    const y = m.afterCreate;
    return (
      y &&
        (function (e, t) {
          if (e.some(T))
            return (async () => {
              for (const n of e) await n(t);
            })();
          for (const n of e) n(t);
        })(y, m),
      m
    );
  }
  const gt = Symbol('orama.insertions'),
    mt =
      (Symbol('orama.removals'),
      globalThis.process?.emitWarning ??
        function (e, t) {
          console.warn(`[WARNING] [${t.code}] ${e}`);
        });
  function yt(e) {
    'number' != typeof e[gt] &&
      (queueMicrotask(() => {
        e[gt] = void 0;
      }),
      (e[gt] = 0)),
      e[gt] > 1e3 ? (mt("Orama's insert operation is synchronous. Please avoid inserting a large number of document in a single operation in order not to block the main thread or, in alternative, please use insertMultiple.", { code: 'ORAMA0001' }), (e[gt] = -1)) : e[gt] >= 0 && e[gt]++;
  }
  function bt(e, t, n, r, o) {
    const s = e.validateSchema(t, e.schema);
    if (s) throw x('SCHEMA_VALIDATION_FAILURE', s);
    return T(e.beforeInsert) || T(e.afterInsert) || T(e.index.beforeInsert) || T(e.index.insert) || T(e.index.afterInsert)
      ? (async function (e, t, n, r, o) {
          const { index: s, docs: i } = e.data,
            a = e.getDocumentIndexId(t);
          if ('string' != typeof a) throw x('DOCUMENT_ID_MUST_BE_STRING', typeof a);
          const c = V(e.internalDocumentIDStore, a);
          if (!e.documentsStore.store(i, a, c, t)) throw x('DOCUMENT_ALREADY_EXISTS', a);
          const l = e.documentsStore.count(i);
          r || (await re(e.beforeInsert, e, a, t));
          const u = e.index.getSearchableProperties(s),
            f = e.index.getSearchablePropertiesWithTypes(s),
            d = e.getDocumentProperties(t, u);
          for (const [e, t] of Object.entries(d)) {
            if (void 0 === t) continue;
            vt(typeof t, f[e], e, t);
          }
          await (async function (e, t, n, r, o, s, i, a) {
            for (const i of n) {
              const n = r[i];
              if (void 0 === n) continue;
              const c = e.index.getSearchablePropertiesWithTypes(e.data.index)[i];
              await e.index.beforeInsert?.(e.data.index, i, t, n, c, s, e.tokenizer, o);
              const l = e.internalDocumentIDStore.idToInternalId.get(t);
              await e.index.insert(e.index, e.data.index, i, t, l, n, c, s, e.tokenizer, o, a), await e.index.afterInsert?.(e.data.index, i, t, n, c, s, e.tokenizer, o);
            }
            const c = e.sorter.getSortableProperties(e.data.sorting),
              l = e.getDocumentProperties(i, c);
            for (const n of c) {
              const r = l[n];
              if (void 0 === r) continue;
              const o = e.sorter.getSortablePropertiesWithTypes(e.data.sorting)[n];
              e.sorter.insert(e.data.sorting, n, t, r, o, s);
            }
          })(e, a, u, d, l, n, t, o),
            r || (await re(e.afterInsert, e, a, t));
          return yt(e), a;
        })(e, t, n, r, o)
      : (function (e, t, n, r, o) {
          const { index: s, docs: i } = e.data,
            a = e.getDocumentIndexId(t);
          if ('string' != typeof a) throw x('DOCUMENT_ID_MUST_BE_STRING', typeof a);
          const c = V(e.internalDocumentIDStore, a);
          if (!e.documentsStore.store(i, a, c, t)) throw x('DOCUMENT_ALREADY_EXISTS', a);
          const l = e.documentsStore.count(i);
          r || re(e.beforeInsert, e, a, t);
          const u = e.index.getSearchableProperties(s),
            f = e.index.getSearchablePropertiesWithTypes(s),
            d = e.getDocumentProperties(t, u);
          for (const [e, t] of Object.entries(d)) {
            if (void 0 === t) continue;
            vt(typeof t, f[e], e, t);
          }
          (function (e, t, n, r, o, s, i, a) {
            for (const i of n) {
              const n = r[i];
              if (void 0 === n) continue;
              const c = e.index.getSearchablePropertiesWithTypes(e.data.index)[i],
                l = V(e.internalDocumentIDStore, t);
              e.index.beforeInsert?.(e.data.index, i, t, n, c, s, e.tokenizer, o), e.index.insert(e.index, e.data.index, i, t, l, n, c, s, e.tokenizer, o, a), e.index.afterInsert?.(e.data.index, i, t, n, c, s, e.tokenizer, o);
            }
            const c = e.sorter.getSortableProperties(e.data.sorting),
              l = e.getDocumentProperties(i, c);
            for (const n of c) {
              const r = l[n];
              if (void 0 === r) continue;
              const o = e.sorter.getSortablePropertiesWithTypes(e.data.sorting)[n];
              e.sorter.insert(e.data.sorting, n, t, r, o, s);
            }
          })(e, a, u, d, l, n, t, o),
            r || re(e.afterInsert, e, a, t);
          return yt(e), a;
        })(e, t, n, r, o);
  }
  const St = new Set(['enum', 'enum[]']),
    wt = new Set(['string', 'number']);
  function vt(e, t, n, r) {
    if (('geopoint' !== t || 'object' != typeof r || 'number' != typeof r.lon || 'number' != typeof r.lat) && !((C(t) && Array.isArray(r)) || (z(t) && Array.isArray(r)) || (St.has(t) && wt.has(e)) || e === t)) throw x('INVALID_DOCUMENT_PROPERTY', n, t, e);
  }
  async function It(e, t, n = 1e3, r, o, s = 0) {
    const i = [],
      a = async (s) => {
        const a = Math.min(s + n, t.length),
          c = t.slice(s, a);
        for (const t of c) {
          const n = { avlRebalanceThreshold: c.length },
            s = await bt(e, t, r, o, n);
          i.push(s);
        }
        return a;
      };
    return (
      await (async () => {
        let e = 0;
        for (; e < t.length; ) {
          const t = Date.now();
          if (((e = await a(e)), s > 0)) {
            const e = Date.now() - t,
              n = s - e;
            n > 0 && D(n);
          }
        }
      })(),
      o || (await oe(e.afterInsertMultiple, e, t)),
      i
    );
  }
  function Ot(e, t, n = 1e3, r, o, s = 0) {
    const i = [];
    let a = 0;
    function c() {
      const s = t.slice(a * n, (a + 1) * n);
      if (0 === s.length) return !1;
      for (const t of s) {
        const n = { avlRebalanceThreshold: s.length },
          a = bt(e, t, r, o, n);
        i.push(a);
      }
      return a++, !0;
    }
    return (
      (function () {
        const e = Date.now();
        for (;;) {
          if (!c()) break;
          if (s > 0) {
            const t = Date.now() - e;
            if (t >= s) {
              const e = s - (t % s);
              e > 0 && D(e);
            }
          }
        }
      })(),
      o || oe(e.afterInsertMultiple, e, t),
      i
    );
  }
  const Tt = 'fulltext';
  function Nt(e, t) {
    return e[1] - t[1];
  }
  function At(e, t) {
    return t[1] - e[1];
  }
  function _t(e = 'desc') {
    return 'asc' === e.toLowerCase() ? Nt : At;
  }
  function Dt(e, t, n) {
    const r = {},
      o = t.map(([e]) => e),
      s = e.documentsStore.getMultiple(e.data.docs, o),
      i = Object.keys(n),
      a = e.index.getSearchablePropertiesWithTypes(e.data.index);
    for (const e of i) {
      let t;
      if ('number' === a[e]) {
        const { ranges: r } = n[e],
          o = r.length,
          s = Array.from({ length: o });
        for (let e = 0; e < o; e++) {
          const t = r[e];
          s[e] = [`${t.from}-${t.to}`, 0];
        }
        t = Object.fromEntries(s);
      }
      r[e] = { count: 0, values: t ?? {} };
    }
    const c = s.length;
    for (let e = 0; e < c; e++) {
      const t = s[e];
      for (const e of i) {
        const o = e.includes('.') ? w(t, e) : t[e],
          s = a[e],
          i = r[e].values;
        switch (s) {
          case 'number':
            Et(n[e].ranges, i)(o);
            break;
          case 'number[]': {
            const t = new Set(),
              r = Et(n[e].ranges, i, t);
            for (const e of o) r(e);
            break;
          }
          case 'boolean':
          case 'enum':
          case 'string':
            xt(i, s)(o);
            break;
          case 'boolean[]':
          case 'enum[]':
          case 'string[]': {
            const e = xt(i, 'boolean[]' === s ? 'boolean' : 'string', new Set());
            for (const t of o) e(t);
            break;
          }
          default:
            throw x('FACET_NOT_SUPPORTED', s);
        }
      }
    }
    for (const e of i) {
      const t = r[e];
      if (((t.count = Object.keys(t.values).length), 'string' === a[e])) {
        const r = n[e],
          o = _t(r.sort);
        t.values = Object.fromEntries(
          Object.entries(t.values)
            .sort(o)
            .slice(r.offset ?? 0, r.limit ?? 10)
        );
      }
    }
    return r;
  }
  function Et(e, t, n) {
    return (r) => {
      for (const o of e) {
        const e = `${o.from}-${o.to}`;
        n?.has(e) || (r >= o.from && r <= o.to && (void 0 === t[e] ? (t[e] = 1) : (t[e]++, n?.add(e))));
      }
    };
  }
  function xt(e, t, n) {
    const r = 'boolean' === t ? 'false' : '';
    return (t) => {
      const o = t?.toString() ?? r;
      n?.has(o) || ((e[o] = (e[o] ?? 0) + 1), n?.add(o));
    };
  }
  const Pt = { reducer: (e, t, n, r) => ((t[r] = n), t), getInitialValue: (e) => Array.from({ length: e }) },
    kt = ['string', 'number', 'boolean'];
  function Rt(e, t, n) {
    const r = n.properties,
      o = r.length,
      s = e.index.getSearchablePropertiesWithTypes(e.data.index);
    for (let e = 0; e < o; e++) {
      const t = r[e];
      if (void 0 === s[t]) throw x('UNKNOWN_GROUP_BY_PROPERTY', t);
      if (!kt.includes(s[t])) throw x('INVALID_GROUP_BY_PROPERTY', t, kt.join(', '), s[t]);
    }
    const i = t.map(([t]) => F(e.internalDocumentIDStore, t)),
      a = e.documentsStore.getMultiple(e.data.docs, i),
      c = a.length,
      l = n.maxResult || Number.MAX_SAFE_INTEGER,
      u = [],
      f = {};
    for (let e = 0; e < o; e++) {
      const t = r[e],
        n = { property: t, perValue: {} },
        o = new Set();
      for (let e = 0; e < c; e++) {
        const r = w(a[e], t);
        if (void 0 === r) continue;
        const s = 'boolean' != typeof r ? r : '' + r,
          i = n.perValue[s] ?? { indexes: [], count: 0 };
        i.count >= l || (i.indexes.push(e), i.count++, (n.perValue[s] = i), o.add(r));
      }
      u.push(Array.from(o)), (f[t] = n);
    }
    const d = Mt(u),
      h = d.length,
      p = [];
    for (let e = 0; e < h; e++) {
      const t = d[e],
        n = t.length,
        o = { values: [], indexes: [] },
        s = [];
      for (let e = 0; e < n; e++) {
        const n = t[e],
          i = r[e];
        s.push(f[i].perValue['boolean' != typeof n ? n : '' + n].indexes), o.values.push(n);
      }
      (o.indexes = b(s).sort((e, t) => e - t)), 0 !== o.indexes.length && p.push(o);
    }
    const g = p.length,
      m = Array.from({ length: g });
    for (let e = 0; e < g; e++) {
      const r = p[e],
        o = n.reduce || Pt,
        s = r.indexes.map((e) => ({ id: i[e], score: t[e][1], document: a[e] })),
        c = o.reducer.bind(null, r.values),
        l = o.getInitialValue(r.indexes.length),
        u = s.reduce(c, l);
      m[e] = { values: r.values, result: u };
    }
    return m;
  }
  function Mt(e, t = 0) {
    if (t + 1 === e.length) return e[t].map((e) => [e]);
    const n = e[t],
      r = Mt(e, t + 1),
      o = [];
    for (const e of n)
      for (const t of r) {
        const n = [e];
        f(n, t), o.push(n);
      }
    return o;
  }
  function Lt(e, t, n) {
    const { term: r, properties: o } = t,
      s = e.data.index;
    let i = e.caches.propertiesToSearch;
    if (!i) {
      const t = e.index.getSearchablePropertiesWithTypes(s);
      (i = e.index.getSearchableProperties(s)), (i = i.filter((e) => t[e].startsWith('string'))), (e.caches.propertiesToSearch = i);
    }
    if (o && '*' !== o) {
      for (const e of o) if (!i.includes(e)) throw x('UNKNOWN_INDEX', e, i.join(', '));
      i = i.filter((e) => o.includes(e));
    }
    let a, c;
    if ((Object.keys(t.where ?? {}).length > 0 && (a = e.index.searchByWhereClause(s, e.tokenizer, t.where, n)), r || o)) {
      const o = (l = e).documentsStore.count(l.data.docs);
      c = e.index.search(
        s,
        r || '',
        e.tokenizer,
        n,
        i,
        t.exact || !1,
        t.tolerance || 0,
        t.boost || {},
        (function (e) {
          const t = e ?? {};
          return (t.k = t.k ?? zt.k), (t.b = t.b ?? zt.b), (t.d = t.d ?? zt.d), t;
        })(t.relevance),
        o,
        a,
        void 0 !== t.threshold && null !== t.threshold ? t.threshold : 1
      );
    } else {
      c = (a ? Array.from(a) : Object.keys(e.documentsStore.getAll(e.data.docs))).map((e) => [+e, 0]);
    }
    var l;
    return c;
  }
  function Ct(e, t, n) {
    const r = p();
    function o() {
      const o = Object.keys(e.data.index.vectorIndexes),
        s = t.facets && Object.keys(t.facets).length > 0,
        { limit: i = 10, offset: a = 0, distinctOn: c, includeVectors: l = !1 } = t,
        u = !0 === t.preflight;
      let f,
        d = Lt(e, t, n);
      if (t.sortBy)
        if ('function' == typeof t.sortBy) {
          const n = d.map(([e]) => e),
            r = e.documentsStore.getMultiple(e.data.docs, n).map((e, t) => [d[t][0], d[t][1], e]);
          r.sort(t.sortBy), (d = r.map(([e, t]) => [e, t]));
        } else d = e.sorter.sortBy(e.data.sorting, d, t.sortBy).map(([t, n]) => [V(e.internalDocumentIDStore, t), n]);
      else d = d.sort(y);
      u ||
        (f = c
          ? (function (e, t, n, r, o) {
              const s = e.data.docs,
                i = new Map(),
                a = [],
                c = new Set(),
                l = t.length;
              let u = 0;
              for (let f = 0; f < l; f++) {
                const l = t[f];
                if (void 0 === l) continue;
                const [d, h] = l;
                if (c.has(d)) continue;
                const p = e.documentsStore.get(s, d),
                  g = w(p, o);
                if (void 0 !== g && !i.has(g) && (i.set(g, !0), u++, !(u <= n) && (a.push({ id: F(e.internalDocumentIDStore, d), score: h, document: p }), c.add(d), u >= n + r))) break;
              }
              return a;
            })(e, d, a, i, c)
          : Ft(e, d, a, i));
      const h = { elapsed: { formatted: '', raw: 0 }, hits: [], count: d.length };
      if ((void 0 !== f && ((h.hits = f.filter(Boolean)), l || O(h, o)), s)) {
        const n = Dt(e, d, t.facets);
        h.facets = n;
      }
      return t.groupBy && (h.groups = Rt(e, d, t.groupBy)), (h.elapsed = e.formatElapsedTime(p() - r)), h;
    }
    return e.beforeSearch?.length || e.afterSearch?.length
      ? (async function () {
          e.beforeSearch && (await ie(e.beforeSearch, e, t, n));
          const r = o();
          return e.afterSearch && (await se(e.afterSearch, e, t, n, r)), r;
        })()
      : o();
  }
  const zt = { k: 1.2, b: 0.75, d: 0.5 };
  function Ut(e, t, n) {
    const r = t.vector;
    if (r && (!('value' in r) || !('property' in r))) throw x('INVALID_VECTOR_INPUT', Object.keys(r).join(', '));
    const o = e.data.index.vectorIndexes[r.property],
      s = o.node.size;
    if (r?.value.length !== s) {
      if (void 0 === r?.property || void 0 === r?.value.length) throw x('INVALID_INPUT_VECTOR', 'undefined', s, 'undefined');
      throw x('INVALID_INPUT_VECTOR', r.property, s, r.value.length);
    }
    const i = e.data.index;
    let a;
    return Object.keys(t.where ?? {}).length > 0 && (a = e.index.searchByWhereClause(i, e.tokenizer, t.where, n)), o.node.find(r.value, t.similarity ?? 0.8, a);
  }
  function Bt(e, t, n) {
    const r = (function (e) {
        const t = Math.max.apply(Math, e.map(jt));
        return e.map(([e, n]) => [e, n / t]);
      })(Lt(e, t, n)),
      o = Ut(e, t, n),
      s = t.hybridWeights;
    return (function (e, t, n, r) {
      const o = Math.max.apply(Math, e.map(jt)),
        s = Math.max.apply(Math, t.map(jt)),
        i = r && r.text && r.vector,
        { text: a, vector: c } = i ? r : { text: 0.5, vector: 0.5 },
        l = new Map(),
        u = e.length,
        f = (function (e, t) {
          return (n, r) => n * e + r * t;
        })(a, c);
      for (let t = 0; t < u; t++) {
        const [n, r] = e[t],
          s = f(Wt(r, o), 0);
        l.set(n, s);
      }
      const d = t.length;
      for (let e = 0; e < d; e++) {
        const [n, r] = t[e],
          o = Wt(r, s),
          i = l.get(n) ?? 0;
        l.set(n, i + f(0, o));
      }
      return [...l].sort((e, t) => t[1] - e[1]);
    })(r, o, t.term, s);
  }
  function jt(e) {
    return e[1];
  }
  function Wt(e, t) {
    return e / t;
  }
  function Vt(e, t, n) {
    const r = t.mode ?? Tt;
    if (r === Tt) return Ct(e, t, n);
    if ('vector' === r)
      return (function (e, t, n = 'english') {
        const r = p();
        function o() {
          const o = Ut(e, t, n).sort(y);
          let s = [];
          t.facets && Object.keys(t.facets).length > 0 && (s = Dt(e, o, t.facets));
          const i = t.vector.property,
            a = t.includeVectors ?? !1,
            c = t.limit ?? 10,
            l = t.offset ?? 0,
            u = Array.from({ length: c });
          for (let t = 0; t < c; t++) {
            const n = o[t + l];
            if (!n) break;
            const r = e.data.docs.docs[n[0]];
            if (r) {
              a || (r[i] = null);
              const o = { id: F(e.internalDocumentIDStore, n[0]), score: n[1], document: r };
              u[t] = o;
            }
          }
          let f = [];
          t.groupBy && (f = Rt(e, o, t.groupBy));
          const d = p() - r;
          return { count: o.length, hits: u.filter(Boolean), elapsed: { raw: Number(d), formatted: h(d) }, ...(s ? { facets: s } : {}), ...(f ? { groups: f } : {}) };
        }
        return e.beforeSearch?.length || e.afterSearch?.length
          ? (async function () {
              e.beforeSearch && (await ie(e.beforeSearch, e, t, n));
              const r = o();
              return e.afterSearch && (await se(e.afterSearch, e, t, n, r)), r;
            })()
          : o();
      })(e, t);
    if ('hybrid' === r)
      return (function (e, t, n) {
        const r = p();
        function o() {
          const o = Bt(e, t, n);
          let s, i;
          t.facets && Object.keys(t.facets).length > 0 && (s = Dt(e, o, t.facets)), t.groupBy && (i = Rt(e, o, t.groupBy));
          const a = t.offset ?? 0,
            c = t.limit ?? 10,
            l = Ft(e, o, a, c).filter(Boolean),
            u = p(),
            f = { count: o.length, elapsed: { raw: Number(u - r), formatted: h(u - r) }, hits: l, ...(s ? { facets: s } : {}), ...(i ? { groups: i } : {}) };
          return t.includeVectors || O(f, Object.keys(e.data.index.vectorIndexes)), f;
        }
        return e.beforeSearch?.length || e.afterSearch?.length
          ? (async function () {
              e.beforeSearch && (await ie(e.beforeSearch, e, t, n));
              const r = o();
              return e.afterSearch && (await se(e.afterSearch, e, t, n, r)), r;
            })()
          : o();
      })(e, t);
    throw x('INVALID_SEARCH_MODE', r);
  }
  function Ft(e, t, n, r) {
    const o = e.data.docs,
      s = Array.from({ length: r }),
      i = new Set();
    for (let a = n; a < r + n; a++) {
      const n = t[a];
      if (void 0 === n) break;
      const [r, c] = n;
      if (!i.has(r)) {
        const t = e.documentsStore.get(o, r);
        (s[a] = { id: F(e.internalDocumentIDStore, r), score: c, document: t }), i.add(r);
      }
    }
    return s;
  }
  function $t() {
    return Object.create(null);
  }
  function Gt(e, t, n) {
    for (let [r, o] of Object.entries(t)) {
      let t = `${n}${n ? '.' : ''}${r}`;
      if ('object' != typeof o || Array.isArray(o))
        if (C(o)) e.searchableProperties.push(t), (e.searchablePropertiesWithTypes[t] = o), (e.vectorIndexes[t] = { type: 'Vector', node: new be(B(o)), isArray: !1 });
        else {
          let n = /\[/.test(o);
          switch (o) {
            case 'boolean':
            case 'boolean[]':
              e.indexes[t] = { type: 'Bool', node: new me(), isArray: n };
              break;
            case 'number':
            case 'number[]':
              e.indexes[t] = { type: 'AVL', node: new ce(0, []), isArray: n };
              break;
            case 'string':
            case 'string[]':
              e.indexes[t] = { type: 'Position', node: [$t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t(), $t()], isArray: n };
              break;
            case 'enum':
            case 'enum[]':
              e.indexes[t] = { type: 'Flat', node: new le(), isArray: n };
              break;
            case 'geopoint':
              e.indexes[t] = { type: 'BKD', node: new ge(), isArray: n };
              break;
            default:
              throw new Error('INVALID_SCHEMA_TYPE: ' + t);
          }
          e.searchableProperties.push(t), (e.searchablePropertiesWithTypes[t] = o);
        }
      else Gt(e, o, t);
    }
  }
  function Jt(e, t, n, r, o, s) {
    let i = s.tokenize(e, o, n),
      a = i.length;
    for (let e = 0; e < a; e++) {
      let n = i[e],
        o = t[15 - Yt(e, a) - 1];
      for (let e = n.length; e > 0; e--) {
        let t = n.slice(0, e);
        (o[t] = o[t] || []), o[t].push(r);
      }
    }
  }
  function Yt(e, t) {
    return t < 15 ? e : Math.floor((15 * e) / t);
  }
  function Ht(e, t, n, r, o) {
    let s = e.tokenize(t),
      i = new Map();
    for (let e of s)
      for (let t = 0; t < 15; t++) {
        let s = n[t];
        if (s[e]) {
          let n = s[e],
            a = n.length;
          for (let e = 0; e < a; e++) {
            if (o && !o.has(n[e])) continue;
            let s = n[e];
            i.has(s) ? i.set(s, i.get(s) + t * r) : i.set(s, t * r);
          }
        }
      }
    return i;
  }
  function Kt(e, t, n, r, o, s) {
    let i = o.tokenize(e, s, n),
      a = i.length;
    for (let e = 0; e < a; e++) {
      let n = i[e],
        o = t[15 - Yt(e, a) - 1];
      for (let e = n.length; e > 0; e--) {
        let t = o[n.slice(0, e)];
        if (t) {
          let e = t.indexOf(r);
          -1 !== e && t.splice(e, 1);
        }
      }
    }
  }
  function qt() {
    return {
      name: 'orama-plugin-pt15',
      getComponents: function (e) {
        return (
          (t = e),
          {
            index: {
              create: function () {
                let e = { indexes: {}, vectorIndexes: {}, searchableProperties: [], searchablePropertiesWithTypes: {} };
                return Gt(e, t, ''), e;
              },
              insert: function (e, t, n, r, o, s, i, a, c, l) {
                if ('string' !== i && 'string[]' !== i) return Ne(e, t, n, 0, o, s, i, a, c, l);
                let u = t.indexes[n].node;
                if (Array.isArray(s)) for (let e of s) Jt(e, u, n, o, a, c);
                else Jt(s, u, n, o, a, c);
              },
              remove: function (e, t, n, r, o, s, i, a, c, l) {
                if ('string' !== i && 'string[]' !== i) return _e(e, t, n, r, o, s, i, a, c, l);
                let u = t.indexes[n].node;
                if (Array.isArray(s)) for (let e of s) Kt(e, u, n, o, c, a);
                else Kt(s, u, n, o, c, a);
                return !0;
              },
              insertDocumentScoreParameters: () => {
                throw new Error();
              },
              insertTokenScoreParameters: () => {
                throw new Error();
              },
              removeDocumentScoreParameters: () => {
                throw new Error();
              },
              removeTokenScoreParameters: () => {
                throw new Error();
              },
              calculateResultScores: () => {
                throw new Error();
              },
              search: function (e, t, n, r, o, s, i, a, c, l, u) {
                if (0 !== i) throw new Error('Tolerance not implemented yet');
                if (!0 === s) throw new Error('Exact not implemented yet');
                let f = [],
                  d = o.length,
                  h = { score: -1 / 0, id: -1 };
                for (let r = 0; r < d; r++) {
                  let s = o[r],
                    i = Ht(n, t, e.indexes[s].node, a[s] ?? 1, u);
                  i.size > h.score && (h = { score: i.size, id: r }), f.push(i);
                }
                if (1 === f.length) return Array.from(f[0]);
                let p = f[h.id];
                for (let e = 0; e < f.length; e++) {
                  if (e === h.id) continue;
                  let t = f[e];
                  for (let [e, n] of t) p.has(e) ? p.set(e, p.get(e) + n) : p.set(e, n);
                }
                return Array.from(p);
              },
              searchByWhereClause: function (e, t, n, r) {
                if (0 !== Object.entries(n).filter(([t]) => 'Position' === e.indexes[t].type).length) throw new Error('String filters are not supported');
                return Pe(e, t, n, r);
              },
              getSearchableProperties: function (e) {
                return e.searchableProperties;
              },
              getSearchablePropertiesWithTypes: function (e) {
                return e.searchablePropertiesWithTypes;
              },
              load: function (e, t) {
                let n = Me(e, t[0]),
                  r = t[1];
                return { ...n, indexes: { ...Object.fromEntries(r), ...n.indexes } };
              },
              save: function (e) {
                let t = e,
                  n = Object.entries(e.indexes).filter(([, { type: e }]) => 'Position' !== e);
                return [Le({ ...t, indexes: Object.fromEntries(n) }), Object.entries(e.indexes).filter(([, { type: e }]) => 'Position' === e)];
              },
            },
          }
        );
        var t;
      },
    };
  }
  function Xt(e) {
    return (
      (Xt =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
          ? function (e) {
              return typeof e;
            }
          : function (e) {
              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
            }),
      Xt(e)
    );
  }
  function Zt(e) {
    return (
      (function (e) {
        if (Array.isArray(e)) return Qt(e);
      })(e) ||
      (function (e) {
        if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
      })(e) ||
      (function (e, t) {
        if (e) {
          if ('string' == typeof e) return Qt(e, t);
          var n = {}.toString.call(e).slice(8, -1);
          return 'Object' === n && e.constructor && (n = e.constructor.name), 'Map' === n || 'Set' === n ? Array.from(e) : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
        }
      })(e) ||
      (function () {
        throw new TypeError('Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
      })()
    );
  }
  function Qt(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  function en() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ en = function () {
      return t;
    };
    var e,
      t = {},
      n = Object.prototype,
      r = n.hasOwnProperty,
      o =
        Object.defineProperty ||
        function (e, t, n) {
          e[t] = n.value;
        },
      s = 'function' == typeof Symbol ? Symbol : {},
      i = s.iterator || '@@iterator',
      a = s.asyncIterator || '@@asyncIterator',
      c = s.toStringTag || '@@toStringTag';
    function l(e, t, n) {
      return Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }), e[t];
    }
    try {
      l({}, '');
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      var s = t && t.prototype instanceof y ? t : y,
        i = Object.create(s.prototype),
        a = new x(r || []);
      return o(i, '_invoke', { value: A(e, n, a) }), i;
    }
    function f(e, t, n) {
      try {
        return { type: 'normal', arg: e.call(t, n) };
      } catch (e) {
        return { type: 'throw', arg: e };
      }
    }
    t.wrap = u;
    var d = 'suspendedStart',
      h = 'suspendedYield',
      p = 'executing',
      g = 'completed',
      m = {};
    function y() {}
    function b() {}
    function S() {}
    var w = {};
    l(w, i, function () {
      return this;
    });
    var v = Object.getPrototypeOf,
      I = v && v(v(P([])));
    I && I !== n && r.call(I, i) && (w = I);
    var O = (S.prototype = y.prototype = Object.create(w));
    function T(e) {
      ['next', 'throw', 'return'].forEach(function (t) {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(o, s, i, a) {
        var c = f(e[o], e, s);
        if ('throw' !== c.type) {
          var l = c.arg,
            u = l.value;
          return u && 'object' == Xt(u) && r.call(u, '__await')
            ? t.resolve(u.__await).then(
                function (e) {
                  n('next', e, i, a);
                },
                function (e) {
                  n('throw', e, i, a);
                }
              )
            : t.resolve(u).then(
                function (e) {
                  (l.value = e), i(l);
                },
                function (e) {
                  return n('throw', e, i, a);
                }
              );
        }
        a(c.arg);
      }
      var s;
      o(this, '_invoke', {
        value: function (e, r) {
          function o() {
            return new t(function (t, o) {
              n(e, r, t, o);
            });
          }
          return (s = s ? s.then(o, o) : o());
        },
      });
    }
    function A(t, n, r) {
      var o = d;
      return function (s, i) {
        if (o === p) throw Error('Generator is already running');
        if (o === g) {
          if ('throw' === s) throw i;
          return { value: e, done: !0 };
        }
        for (r.method = s, r.arg = i; ; ) {
          var a = r.delegate;
          if (a) {
            var c = _(a, r);
            if (c) {
              if (c === m) continue;
              return c;
            }
          }
          if ('next' === r.method) r.sent = r._sent = r.arg;
          else if ('throw' === r.method) {
            if (o === d) throw ((o = g), r.arg);
            r.dispatchException(r.arg);
          } else 'return' === r.method && r.abrupt('return', r.arg);
          o = p;
          var l = f(t, n, r);
          if ('normal' === l.type) {
            if (((o = r.done ? g : h), l.arg === m)) continue;
            return { value: l.arg, done: r.done };
          }
          'throw' === l.type && ((o = g), (r.method = 'throw'), (r.arg = l.arg));
        }
      };
    }
    function _(t, n) {
      var r = n.method,
        o = t.iterator[r];
      if (o === e) return (n.delegate = null), ('throw' === r && t.iterator.return && ((n.method = 'return'), (n.arg = e), _(t, n), 'throw' === n.method)) || ('return' !== r && ((n.method = 'throw'), (n.arg = new TypeError("The iterator does not provide a '" + r + "' method")))), m;
      var s = f(o, t.iterator, n.arg);
      if ('throw' === s.type) return (n.method = 'throw'), (n.arg = s.arg), (n.delegate = null), m;
      var i = s.arg;
      return i ? (i.done ? ((n[t.resultName] = i.value), (n.next = t.nextLoc), 'return' !== n.method && ((n.method = 'next'), (n.arg = e)), (n.delegate = null), m) : i) : ((n.method = 'throw'), (n.arg = new TypeError('iterator result is not an object')), (n.delegate = null), m);
    }
    function D(e) {
      var t = { tryLoc: e[0] };
      1 in e && (t.catchLoc = e[1]), 2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])), this.tryEntries.push(t);
    }
    function E(e) {
      var t = e.completion || {};
      (t.type = 'normal'), delete t.arg, (e.completion = t);
    }
    function x(e) {
      (this.tryEntries = [{ tryLoc: 'root' }]), e.forEach(D, this), this.reset(!0);
    }
    function P(t) {
      if (t || '' === t) {
        var n = t[i];
        if (n) return n.call(t);
        if ('function' == typeof t.next) return t;
        if (!isNaN(t.length)) {
          var o = -1,
            s = function n() {
              for (; ++o < t.length; ) if (r.call(t, o)) return (n.value = t[o]), (n.done = !1), n;
              return (n.value = e), (n.done = !0), n;
            };
          return (s.next = s);
        }
      }
      throw new TypeError(Xt(t) + ' is not iterable');
    }
    return (
      (b.prototype = S),
      o(O, 'constructor', { value: S, configurable: !0 }),
      o(S, 'constructor', { value: b, configurable: !0 }),
      (b.displayName = l(S, c, 'GeneratorFunction')),
      (t.isGeneratorFunction = function (e) {
        var t = 'function' == typeof e && e.constructor;
        return !!t && (t === b || 'GeneratorFunction' === (t.displayName || t.name));
      }),
      (t.mark = function (e) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(e, S) : ((e.__proto__ = S), l(e, c, 'GeneratorFunction')), (e.prototype = Object.create(O)), e;
      }),
      (t.awrap = function (e) {
        return { __await: e };
      }),
      T(N.prototype),
      l(N.prototype, a, function () {
        return this;
      }),
      (t.AsyncIterator = N),
      (t.async = function (e, n, r, o, s) {
        void 0 === s && (s = Promise);
        var i = new N(u(e, n, r, o), s);
        return t.isGeneratorFunction(n)
          ? i
          : i.next().then(function (e) {
              return e.done ? e.value : i.next();
            });
      }),
      T(O),
      l(O, c, 'Generator'),
      l(O, i, function () {
        return this;
      }),
      l(O, 'toString', function () {
        return '[object Generator]';
      }),
      (t.keys = function (e) {
        var t = Object(e),
          n = [];
        for (var r in t) n.push(r);
        return (
          n.reverse(),
          function e() {
            for (; n.length; ) {
              var r = n.pop();
              if (r in t) return (e.value = r), (e.done = !1), e;
            }
            return (e.done = !0), e;
          }
        );
      }),
      (t.values = P),
      (x.prototype = {
        constructor: x,
        reset: function (t) {
          if (((this.prev = 0), (this.next = 0), (this.sent = this._sent = e), (this.done = !1), (this.delegate = null), (this.method = 'next'), (this.arg = e), this.tryEntries.forEach(E), !t)) for (var n in this) 't' === n.charAt(0) && r.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = e);
        },
        stop: function () {
          this.done = !0;
          var e = this.tryEntries[0].completion;
          if ('throw' === e.type) throw e.arg;
          return this.rval;
        },
        dispatchException: function (t) {
          if (this.done) throw t;
          var n = this;
          function o(r, o) {
            return (a.type = 'throw'), (a.arg = t), (n.next = r), o && ((n.method = 'next'), (n.arg = e)), !!o;
          }
          for (var s = this.tryEntries.length - 1; s >= 0; --s) {
            var i = this.tryEntries[s],
              a = i.completion;
            if ('root' === i.tryLoc) return o('end');
            if (i.tryLoc <= this.prev) {
              var c = r.call(i, 'catchLoc'),
                l = r.call(i, 'finallyLoc');
              if (c && l) {
                if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                if (this.prev < i.finallyLoc) return o(i.finallyLoc);
              } else if (c) {
                if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
              } else {
                if (!l) throw Error('try statement without catch or finally');
                if (this.prev < i.finallyLoc) return o(i.finallyLoc);
              }
            }
          }
        },
        abrupt: function (e, t) {
          for (var n = this.tryEntries.length - 1; n >= 0; --n) {
            var o = this.tryEntries[n];
            if (o.tryLoc <= this.prev && r.call(o, 'finallyLoc') && this.prev < o.finallyLoc) {
              var s = o;
              break;
            }
          }
          s && ('break' === e || 'continue' === e) && s.tryLoc <= t && t <= s.finallyLoc && (s = null);
          var i = s ? s.completion : {};
          return (i.type = e), (i.arg = t), s ? ((this.method = 'next'), (this.next = s.finallyLoc), m) : this.complete(i);
        },
        complete: function (e, t) {
          if ('throw' === e.type) throw e.arg;
          return 'break' === e.type || 'continue' === e.type ? (this.next = e.arg) : 'return' === e.type ? ((this.rval = this.arg = e.arg), (this.method = 'return'), (this.next = 'end')) : 'normal' === e.type && t && (this.next = t), m;
        },
        finish: function (e) {
          for (var t = this.tryEntries.length - 1; t >= 0; --t) {
            var n = this.tryEntries[t];
            if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), E(n), m;
          }
        },
        catch: function (e) {
          for (var t = this.tryEntries.length - 1; t >= 0; --t) {
            var n = this.tryEntries[t];
            if (n.tryLoc === e) {
              var r = n.completion;
              if ('throw' === r.type) {
                var o = r.arg;
                E(n);
              }
              return o;
            }
          }
          throw Error('illegal catch attempt');
        },
        delegateYield: function (t, n, r) {
          return (this.delegate = { iterator: P(t), resultName: n, nextLoc: r }), 'next' === this.method && (this.arg = e), m;
        },
      }),
      t
    );
  }
  function tn(e, t, n, r, o, s, i) {
    try {
      var a = e[s](i),
        c = a.value;
    } catch (e) {
      return void n(e);
    }
    a.done ? t(c) : Promise.resolve(c).then(r, o);
  }
  function nn(e) {
    return function () {
      var t = this,
        n = arguments;
      return new Promise(function (r, o) {
        var s = e.apply(t, n);
        function i(e) {
          tn(s, r, o, i, a, 'next', e);
        }
        function a(e) {
          tn(s, r, o, i, a, 'throw', e);
        }
        i(void 0);
      });
    };
  }
  var rn = null;
  function on() {
    return sn.apply(this, arguments);
  }
  function sn() {
    return (
      (sn = nn(
        en().mark(function e() {
          var t, n, r;
          return en().wrap(function (e) {
            for (;;)
              switch ((e.prev = e.next)) {
                case 0:
                  (n = function () {
                    return (n = nn(
                      en().mark(function e(t) {
                        return en().wrap(function (e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (e.next = 2), pt({ schema: { title: 'string', content: 'string', uri: 'string', breadcrumb: 'string', description: 'string', tags: 'string[]' }, plugins: [qt()] });
                              case 2:
                                return (rn = e.sent), (e.next = 5), (r = t), (o = void 0), (s = void 0), (i = void 0), (a = void 0), T((n = rn).afterInsertMultiple) || T(n.beforeInsertMultiple) || T(n.index.beforeInsert) || T(n.index.insert) || T(n.index.afterInsert) ? It(n, r, o, s, i, a) : Ot(n, r, o, s, i, a);
                              case 5:
                                (window.relearn.isSearchEngineReady = !0), window.relearn.executeInitialSearch();
                              case 7:
                              case 'end':
                                return e.stop();
                            }
                          var n, r, o, s, i, a;
                        }, e);
                      })
                    )).apply(this, arguments);
                  }),
                    (t = function (e) {
                      return n.apply(this, arguments);
                    }),
                    window.relearn.index_js_url &&
                      (((r = document.createElement('script')).src = window.relearn.index_js_url),
                      r.setAttribute('async', ''),
                      (r.onload = function () {
                        t(relearn_searchindex);
                      }),
                      (r.onerror = function (e) {
                        console.error('Error getting Hugo index file');
                      }),
                      document.head.appendChild(r));
                case 3:
                case 'end':
                  return e.stop();
              }
          }, e);
        })
      )),
      sn.apply(this, arguments)
    );
  }
  function an(e) {
    return cn.apply(this, arguments);
  }
  function cn() {
    return (cn = nn(
      en().mark(function e(t) {
        var n;
        return en().wrap(function (e) {
          for (;;)
            switch ((e.prev = e.next)) {
              case 0:
                return (e.next = 2), Vt(rn, { term: t, properties: '*', threshold: 0, limit: 99, boost: { tags: 1.8, title: 1.5, description: 1.3, breadcrumb: 1.2 } });
              case 2:
                return (
                  (n = e.sent),
                  console.log('new term', t),
                  n.hits.forEach(function (e) {
                    return console.log(e.score, e.document.uri);
                  }),
                  e.abrupt(
                    'return',
                    n.hits.map(function (e) {
                      return { matches: [t].concat(Zt(t.split(' '))), page: e.document };
                    })
                  )
                );
              case 6:
              case 'end':
                return e.stop();
            }
        }, e);
      })
    )).apply(this, arguments);
  }
  ((window.relearn = window.relearn || {}).search = window.relearn.search || {}).adapter = t;
})();
