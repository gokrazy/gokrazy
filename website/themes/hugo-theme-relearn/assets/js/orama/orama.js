/**
 * Edited for local inclusion by McShelby
 *   - replace regex "/npm/@orama/orama@\d+\.\d+\.\d+" with "."
 *   - replace string "/+esm" with ".js"
 * Version 3.0.8
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.37.0.
 * Original file: ./orama/dist/browser/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const e = { arabic: 'ar', armenian: 'am', bulgarian: 'bg', danish: 'dk', dutch: 'nl', english: 'en', finnish: 'fi', french: 'fr', german: 'de', greek: 'gr', hungarian: 'hu', indian: 'in', indonesian: 'id', irish: 'ie', italian: 'it', lithuanian: 'lt', nepali: 'np', norwegian: 'no', portuguese: 'pt', romanian: 'ro', russian: 'ru', serbian: 'rs', slovenian: 'ru', spanish: 'es', swedish: 'se', tamil: 'ta', turkish: 'tr', ukrainian: 'uk', sanskrit: 'sk' },
  t = { dutch: /[^A-Za-zàèéìòóù0-9_'-]+/gim, english: /[^A-Za-zàèéìòóù0-9_'-]+/gim, french: /[^a-z0-9äâàéèëêïîöôùüûœç-]+/gim, italian: /[^A-Za-zàèéìòóù0-9_'-]+/gim, norwegian: /[^a-z0-9_æøåÆØÅäÄöÖüÜ]+/gim, portuguese: /[^a-z0-9à-úÀ-Ú]/gim, russian: /[^a-z0-9а-яА-ЯёЁ]+/gim, spanish: /[^a-z0-9A-Zá-úÁ-ÚñÑüÜ]+/gim, swedish: /[^a-z0-9_åÅäÄöÖüÜ-]+/gim, german: /[^a-z0-9A-ZäöüÄÖÜß]+/gim, finnish: /[^a-z0-9äöÄÖ]+/gim, danish: /[^a-z0-9æøåÆØÅ]+/gim, hungarian: /[^a-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+/gim, romanian: /[^a-z0-9ăâîșțĂÂÎȘȚ]+/gim, serbian: /[^a-z0-9čćžšđČĆŽŠĐ]+/gim, turkish: /[^a-z0-9çÇğĞıİöÖşŞüÜ]+/gim, lithuanian: /[^a-z0-9ąčęėįšųūžĄČĘĖĮŠŲŪŽ]+/gim, arabic: /[^a-z0-9أ-ي]+/gim, nepali: /[^a-z0-9अ-ह]+/gim, irish: /[^a-z0-9áéíóúÁÉÍÓÚ]+/gim, indian: /[^a-z0-9अ-ह]+/gim, armenian: /[^a-z0-9ա-ֆ]+/gim, greek: /[^a-z0-9α-ωά-ώ]+/gim, indonesian: /[^a-z0-9]+/gim, ukrainian: /[^a-z0-9а-яА-ЯіїєІЇЄ]+/gim, slovenian: /[^a-z0-9čžšČŽŠ]+/gim, bulgarian: /[^a-z0-9а-яА-Я]+/gim, tamil: /[^a-z0-9அ-ஹ]+/gim, sanskrit: /[^a-z0-9A-Zāīūṛḷṃṁḥśṣṭḍṇṅñḻḹṝ]+/gim },
  n = Object.keys(e);
var r = 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : 'undefined' != typeof window ? window : {};
function o() {
  throw new Error('setTimeout has not been defined');
}
function s() {
  throw new Error('clearTimeout has not been defined');
}
var i = o,
  a = s;
function c(e) {
  if (i === setTimeout) return setTimeout(e, 0);
  if ((i === o || !i) && setTimeout) return (i = setTimeout), setTimeout(e, 0);
  try {
    return i(e, 0);
  } catch (t) {
    try {
      return i.call(null, e, 0);
    } catch (t) {
      return i.call(this, e, 0);
    }
  }
}
'function' == typeof r.setTimeout && (i = setTimeout), 'function' == typeof r.clearTimeout && (a = clearTimeout);
var l,
  u = [],
  f = !1,
  d = -1;
function h() {
  f && l && ((f = !1), l.length ? (u = l.concat(u)) : (d = -1), u.length && p());
}
function p() {
  if (!f) {
    var e = c(h);
    f = !0;
    for (var t = u.length; t; ) {
      for (l = u, u = []; ++d < t; ) l && l[d].run();
      (d = -1), (t = u.length);
    }
    (l = null),
      (f = !1),
      (function (e) {
        if (a === clearTimeout) return clearTimeout(e);
        if ((a === s || !a) && clearTimeout) return (a = clearTimeout), clearTimeout(e);
        try {
          return a(e);
        } catch (t) {
          try {
            return a.call(null, e);
          } catch (t) {
            return a.call(this, e);
          }
        }
      })(e);
  }
}
function m(e, t) {
  (this.fun = e), (this.array = t);
}
m.prototype.run = function () {
  this.fun.apply(null, this.array);
};
function g() {}
var b = g,
  y = g,
  S = g,
  I = g,
  w = g,
  v = g,
  T = g;
var D = r.performance || {},
  _ =
    D.now ||
    D.mozNow ||
    D.msNow ||
    D.oNow ||
    D.webkitNow ||
    function () {
      return new Date().getTime();
    };
var O = new Date();
var N = {
  nextTick: function (e) {
    var t = new Array(arguments.length - 1);
    if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
    u.push(new m(e, t)), 1 !== u.length || f || c(p);
  },
  title: 'browser',
  browser: !0,
  env: {},
  argv: [],
  version: '',
  versions: {},
  on: b,
  addListener: y,
  once: S,
  off: I,
  removeListener: w,
  removeAllListeners: v,
  emit: T,
  binding: function (e) {
    throw new Error('process.binding is not supported');
  },
  cwd: function () {
    return '/';
  },
  chdir: function (e) {
    throw new Error('process.chdir is not supported');
  },
  umask: function () {
    return 0;
  },
  hrtime: function (e) {
    var t = 0.001 * _.call(D),
      n = Math.floor(t),
      r = Math.floor((t % 1) * 1e9);
    return e && ((n -= e[0]), (r -= e[1]) < 0 && (n--, (r += 1e9))), [n, r];
  },
  platform: 'browser',
  release: {},
  config: {},
  uptime: function () {
    return (new Date() - O) / 1e3;
  },
};
const A = Date.now().toString().slice(5);
let P = 0;
const E = BigInt(1e3),
  x = BigInt(1e6),
  M = BigInt(1e9),
  k = 65535;
function R(e, t) {
  if (t.length < k) Array.prototype.push.apply(e, t);
  else {
    const n = t.length;
    for (let r = 0; r < n; r += k) Array.prototype.push.apply(e, t.slice(r, r + k));
  }
}
function C() {
  return BigInt(Math.floor(1e6 * performance.now()));
}
function U(e) {
  return 'number' == typeof e && (e = BigInt(e)), e < E ? `${e}ns` : e < x ? e / E + 'μs' : e < M ? e / x + 'ms' : e / M + 's';
}
function z() {
  return 'undefined' != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? C() : (void 0 !== N && N.release && 'node' === N.release.name) || (void 0 !== N && 'function' == typeof N?.hrtime?.bigint) ? N.hrtime.bigint() : 'undefined' != typeof performance ? C() : BigInt(0);
}
function L() {
  return `${A}-${P++}`;
}
function B(e, t) {
  return void 0 === Object.hasOwn ? (Object.prototype.hasOwnProperty.call(e, t) ? e[t] : void 0) : Object.hasOwn(e, t) ? e[t] : void 0;
}
function W(e, t) {
  return t[1] === e[1] ? e[0] - t[0] : t[1] - e[1];
}
function V(e) {
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
function F(e, t) {
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
function j(e, t) {
  return F(e, [t])[t];
}
const $ = { cm: 0.01, m: 1, km: 1e3, ft: 0.3048, yd: 0.9144, mi: 1609.344 };
function G(e, t) {
  const n = $[t];
  if (void 0 === n) throw new Error(ee('INVALID_DISTANCE_SUFFIX', e).message);
  return e * n;
}
function J(e, t) {
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
function Y(e) {
  return Array.isArray(e) ? e.some((e) => Y(e)) : 'AsyncFunction' === e?.constructor?.name;
}
const H = 'intersection' in new Set();
function K(...e) {
  if (0 === e.length) return new Set();
  if (1 === e.length) return e[0];
  if (2 === e.length) {
    const t = e[0],
      n = e[1];
    if (H) return t.intersection(n);
    const r = new Set(),
      o = t.size < n.size ? t : n,
      s = o === t ? n : t;
    for (const e of o) s.has(e) && r.add(e);
    return r;
  }
  const t = { index: 0, size: e[0].size };
  for (let n = 1; n < e.length; n++) e[n].size < t.size && ((t.index = n), (t.size = e[n].size));
  if (H) {
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
}
const q = 'union' in new Set();
function X(e, t) {
  return q ? (e ? e.union(t) : t) : e ? new Set([...e, ...t]) : new Set(t);
}
function Z(e) {
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
  }
}
const Q = { NO_LANGUAGE_WITH_CUSTOM_TOKENIZER: 'Do not pass the language option to create when using a custom tokenizer.', LANGUAGE_NOT_SUPPORTED: `Language "%s" is not supported.\nSupported languages are:\n - ${n.join('\n - ')}`, INVALID_STEMMER_FUNCTION_TYPE: 'config.stemmer property must be a function.', MISSING_STEMMER: 'As of version 1.0.0 @orama/orama does not ship non English stemmers by default. To solve this, please explicitly import and specify the "%s" stemmer from the package @orama/stemmers. See https://docs.orama.com/open-source/text-analysis/stemming for more information.', CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY: 'Custom stop words array must only contain strings.', UNSUPPORTED_COMPONENT: 'Unsupported component "%s".', COMPONENT_MUST_BE_FUNCTION: 'The component "%s" must be a function.', COMPONENT_MUST_BE_FUNCTION_OR_ARRAY_FUNCTIONS: 'The component "%s" must be a function or an array of functions.', INVALID_SCHEMA_TYPE: 'Unsupported schema type "%s" at "%s". Expected "string", "boolean" or "number" or array of them.', DOCUMENT_ID_MUST_BE_STRING: 'Document id must be of type "string". Got "%s" instead.', DOCUMENT_ALREADY_EXISTS: 'A document with id "%s" already exists.', DOCUMENT_DOES_NOT_EXIST: 'A document with id "%s" does not exists.', MISSING_DOCUMENT_PROPERTY: 'Missing searchable property "%s".', INVALID_DOCUMENT_PROPERTY: 'Invalid document property "%s": expected "%s", got "%s"', UNKNOWN_INDEX: 'Invalid property name "%s". Expected a wildcard string ("*") or array containing one of the following properties: %s', INVALID_BOOST_VALUE: 'Boost value must be a number greater than, or less than 0.', INVALID_FILTER_OPERATION: 'You can only use one operation per filter, you requested %d.', SCHEMA_VALIDATION_FAILURE: 'Cannot insert document due schema validation failure on "%s" property.', INVALID_SORT_SCHEMA_TYPE: 'Unsupported sort schema type "%s" at "%s". Expected "string" or "number".', CANNOT_SORT_BY_ARRAY: 'Cannot configure sort for "%s" because it is an array (%s).', UNABLE_TO_SORT_ON_UNKNOWN_FIELD: 'Unable to sort on unknown field "%s". Allowed fields: %s', SORT_DISABLED: 'Sort is disabled. Please read the documentation at https://docs.oramasearch for more information.', UNKNOWN_GROUP_BY_PROPERTY: 'Unknown groupBy property "%s".', INVALID_GROUP_BY_PROPERTY: 'Invalid groupBy property "%s". Allowed types: "%s", but given "%s".', UNKNOWN_FILTER_PROPERTY: 'Unknown filter property "%s".', INVALID_VECTOR_SIZE: 'Vector size must be a number greater than 0. Got "%s" instead.', INVALID_VECTOR_VALUE: 'Vector value must be a number greater than 0. Got "%s" instead.', INVALID_INPUT_VECTOR: 'Property "%s" was declared as a %s-dimensional vector, but got a %s-dimensional vector instead.\nInput vectors must be of the size declared in the schema, as calculating similarity between vectors of different sizes can lead to unexpected results.', WRONG_SEARCH_PROPERTY_TYPE: 'Property "%s" is not searchable. Only "string" properties are searchable.', FACET_NOT_SUPPORTED: 'Facet doens\'t support the type "%s".', INVALID_DISTANCE_SUFFIX: 'Invalid distance suffix "%s". Valid suffixes are: cm, m, km, mi, yd, ft.', INVALID_SEARCH_MODE: 'Invalid search mode "%s". Valid modes are: "fulltext", "vector", "hybrid".', MISSING_VECTOR_AND_SECURE_PROXY: 'No vector was provided and no secure proxy was configured. Please provide a vector or configure an Orama Secure Proxy to perform hybrid search.', MISSING_TERM: '"term" is a required parameter when performing hybrid search. Please provide a search term.', INVALID_VECTOR_INPUT: 'Invalid "vector" property. Expected an object with "value" and "property" properties, but got "%s" instead.', PLUGIN_CRASHED: 'A plugin crashed during initialization. Please check the error message for more information:', PLUGIN_SECURE_PROXY_NOT_FOUND: "Could not find '@orama/secure-proxy-plugin' installed in your Orama instance.\nPlease install it before proceeding with creating an answer session.\nRead more at https://docs.orama.com/open-source/plugins/plugin-secure-proxy#plugin-secure-proxy\n", PLUGIN_SECURE_PROXY_MISSING_CHAT_MODEL: 'Could not find a chat model defined in the secure proxy plugin configuration.\nPlease provide a chat model before proceeding with creating an answer session.\nRead more at https://docs.orama.com/open-source/plugins/plugin-secure-proxy#plugin-secure-proxy\n', ANSWER_SESSION_LAST_MESSAGE_IS_NOT_ASSISTANT: 'The last message in the session is not an assistant message. Cannot regenerate non-assistant messages.', PLUGIN_COMPONENT_CONFLICT: 'The component "%s" is already defined. The plugin "%s" is trying to redefine it.' };
function ee(e, ...t) {
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
    })(Q[e] ?? `Unsupported Orama Error code: ${e}`, ...t)
  );
  return (n.code = e), 'captureStackTrace' in Error.prototype && Error.captureStackTrace(n), n;
}
function te(e) {
  return { raw: Number(e), formatted: U(e) };
}
function ne(e) {
  if (e.id) {
    if ('string' != typeof e.id) throw ee('DOCUMENT_ID_MUST_BE_STRING', typeof e.id);
    return e.id;
  }
  return L();
}
function re(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const t = e[n];
    if (void 0 !== t && ('geopoint' !== r || 'object' != typeof t || 'number' != typeof t.lon || 'number' != typeof t.lat) && ('enum' !== r || ('string' != typeof t && 'number' != typeof t)))
      if ('enum[]' === r && Array.isArray(t)) {
        const e = t.length;
        for (let r = 0; r < e; r++) if ('string' != typeof t[r] && 'number' != typeof t[r]) return n + '.' + r;
      } else if (ae(r)) {
        const e = ue(r);
        if (!Array.isArray(t) || t.length !== e) throw ee('INVALID_INPUT_VECTOR', n, e, t.length);
      } else if (ce(r)) {
        if (!Array.isArray(t)) return n;
        const e = le(r),
          o = t.length;
        for (let r = 0; r < o; r++) if (typeof t[r] !== e) return n + '.' + r;
      } else if ('object' != typeof r) {
        if (typeof t !== r) return n;
      } else {
        if (!t || 'object' != typeof t) return n;
        const e = re(t, r);
        if (e) return n + '.' + e;
      }
  }
}
const oe = { 'string': !1, 'number': !1, 'boolean': !1, 'enum': !1, 'geopoint': !1, 'string[]': !0, 'number[]': !0, 'boolean[]': !0, 'enum[]': !0 },
  se = { 'string[]': 'string', 'number[]': 'number', 'boolean[]': 'boolean', 'enum[]': 'enum' };
function ie(e) {
  return 'geopoint' === e;
}
function ae(e) {
  return 'string' == typeof e && /^vector\[\d+\]$/.test(e);
}
function ce(e) {
  return 'string' == typeof e && oe[e];
}
function le(e) {
  return se[e];
}
function ue(e) {
  const t = Number(e.slice(7, -1));
  switch (!0) {
    case isNaN(t):
      throw ee('INVALID_VECTOR_VALUE', e);
    case t <= 0:
      throw ee('INVALID_VECTOR_SIZE', e);
    default:
      return t;
  }
}
function fe() {
  return { idToInternalId: new Map(), internalIdToId: [], save: de, load: he };
}
function de(e) {
  return { internalIdToId: e.internalIdToId };
}
function he(e, t) {
  const { internalIdToId: n } = t;
  e.internalDocumentIDStore.idToInternalId.clear(), (e.internalDocumentIDStore.internalIdToId = []);
  const r = n.length;
  for (let t = 0; t < r; t++) {
    const r = n[t];
    e.internalDocumentIDStore.idToInternalId.set(r, t + 1), e.internalDocumentIDStore.internalIdToId.push(r);
  }
}
function pe(e, t) {
  if ('string' == typeof t) {
    const n = e.idToInternalId.get(t);
    if (n) return n;
    const r = e.idToInternalId.size + 1;
    return e.idToInternalId.set(t, r), e.internalIdToId.push(t), r;
  }
  return t > e.internalIdToId.length ? pe(e, t.toString()) : t;
}
function me(e, t) {
  if (e.internalIdToId.length < t) throw new Error(`Invalid internalId ${t}`);
  return e.internalIdToId[t - 1];
}
var ge = Object.freeze({ __proto__: null, createInternalDocumentIDStore: fe, save: de, load: he, getInternalDocumentId: pe, getDocumentIdFromInternalId: me });
function be(e, t) {
  return { sharedInternalDocumentStore: t, docs: {}, count: 0 };
}
function ye(e, t) {
  const n = pe(e.sharedInternalDocumentStore, t);
  return e.docs[n];
}
function Se(e, t) {
  const n = t.length,
    r = Array.from({ length: n });
  for (let o = 0; o < n; o++) {
    const n = pe(e.sharedInternalDocumentStore, t[o]);
    r[o] = e.docs[n];
  }
  return r;
}
function Ie(e) {
  return e.docs;
}
function we(e, t, n, r) {
  return void 0 === e.docs[n] && ((e.docs[n] = r), e.count++, !0);
}
function ve(e, t) {
  const n = pe(e.sharedInternalDocumentStore, t);
  return void 0 !== e.docs[n] && (delete e.docs[n], e.count--, !0);
}
function Te(e) {
  return e.count;
}
function De(e, t) {
  const n = t;
  return { docs: n.docs, count: n.count, sharedInternalDocumentStore: e };
}
function _e(e) {
  return { docs: e.docs, count: e.count };
}
function Oe() {
  return { create: be, get: ye, getMultiple: Se, getAll: Ie, store: we, remove: ve, count: Te, load: De, save: _e };
}
var Ne = Object.freeze({ __proto__: null, create: be, get: ye, getMultiple: Se, getAll: Ie, store: we, remove: ve, count: Te, load: De, save: _e, createDocumentsStore: Oe });
const Ae = ['beforeInsert', 'afterInsert', 'beforeRemove', 'afterRemove', 'beforeUpdate', 'afterUpdate', 'beforeSearch', 'afterSearch', 'beforeInsertMultiple', 'afterInsertMultiple', 'beforeRemoveMultiple', 'afterRemoveMultiple', 'beforeUpdateMultiple', 'afterUpdateMultiple', 'beforeLoad', 'afterLoad', 'afterCreate'];
function Pe(e, t) {
  const n = [],
    r = e.plugins?.length;
  if (!r) return n;
  for (let o = 0; o < r; o++)
    try {
      const r = e.plugins[o];
      'function' == typeof r[t] && n.push(r[t]);
    } catch (e) {
      throw (console.error('Caught error in getAllPluginsByHook:', e), ee('PLUGIN_CRASHED'));
    }
  return n;
}
const Ee = ['tokenizer', 'index', 'documentsStore', 'sorter'],
  xe = ['validateSchema', 'getDocumentIndexId', 'getDocumentProperties', 'formatElapsedTime'];
function Me(e, t, n, r) {
  if (e.some(Y))
    return (async () => {
      for (const o of e) await o(t, n, r);
    })();
  for (const o of e) o(t, n, r);
}
function ke(e, t, n) {
  if (e.some(Y))
    return (async () => {
      for (const r of e) await r(t, n);
    })();
  for (const r of e) r(t, n);
}
function Re(e, t, n, r, o) {
  if (e.some(Y))
    return (async () => {
      for (const s of e) await s(t, n, r, o);
    })();
  for (const s of e) s(t, n, r, o);
}
function Ce(e, t, n, r) {
  if (e.some(Y))
    return (async () => {
      for (const o of e) await o(t, n, r);
    })();
  for (const o of e) o(t, n, r);
}
class Ue {
  k;
  v;
  l = null;
  r = null;
  h = 1;
  constructor(e, t) {
    (this.k = e), (this.v = new Set(t));
  }
  updateHeight() {
    this.h = Math.max(Ue.getHeight(this.l), Ue.getHeight(this.r)) + 1;
  }
  static getHeight(e) {
    return e ? e.h : 0;
  }
  getBalanceFactor() {
    return Ue.getHeight(this.l) - Ue.getHeight(this.r);
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
    const t = new Ue(e.k, e.v);
    return (t.l = e.l ? Ue.fromJSON(e.l) : null), (t.r = e.r ? Ue.fromJSON(e.r) : null), (t.h = e.h), t;
  }
}
class ze {
  root = null;
  insertCount = 0;
  constructor(e, t) {
    void 0 !== e && void 0 !== t && (this.root = new Ue(e, t));
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
    const t = new ze();
    return (t.root = e.root ? Ue.fromJSON(e.root) : null), (t.insertCount = e.insertCount || 0), t;
  }
  insertNode(e, t, n, r) {
    if (null === e) return new Ue(t, [n]);
    const o = [];
    let s = e,
      i = null;
    for (; null !== s; )
      if ((o.push({ parent: i, node: s }), t < s.k)) {
        if (null === s.l) {
          (s.l = new Ue(t, [n])), o.push({ parent: s, node: s.l });
          break;
        }
        (i = s), (s = s.l);
      } else {
        if (!(t > s.k)) return s.v.add(n), e;
        if (null === s.r) {
          (s.r = new Ue(t, [n])), o.push({ parent: s, node: s.r });
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
      if (((o = r.pop()), o.k >= e && o.k <= t && (n = X(n, o.v)), o.k > t)) break;
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
      if (((o = r.pop()), (t && o.k >= e) || (!t && o.k > e))) n = X(n, o.v);
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
      if (((o = r.pop()), (t && o.k <= e) || (!t && o.k < e))) n = X(n, o.v);
      else if (o.k > e) break;
      o = o.r;
    }
    return n;
  }
}
class Le {
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
    const t = new Le();
    for (const [n, r] of e.numberToDocumentId) t.numberToDocumentId.set(n, new Set(r));
    return t;
  }
  toJSON() {
    return { numberToDocumentId: Array.from(this.numberToDocumentId.entries()).map(([e, t]) => [e, Array.from(t)]) };
  }
}
function Be(e, t, n) {
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
function We(e, t, n) {
  const r = Be(e, t, n);
  return { distance: r, isBounded: r >= 0 };
}
class Ve {
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
        if (null !== B(e, o))
          if (r) {
            if (!(Math.abs(t.length - o.length) <= r && We(t, o, r).isBounded)) continue;
            e[o] = [];
          } else e[o] = [];
        if (null != B(e, o) && i.size > 0) {
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
          d = new Ve(l[0], l, !1);
        if ((n.c.set(l[0], d), d.updateParent(n), (i.s = u), (i.k = u[0]), d.c.set(u[0], i), i.updateParent(d), f)) {
          const e = new Ve(f[0], f, !0);
          e.addDocument(t), d.c.set(f[0], e), e.updateParent(d);
        } else (d.e = !0), d.addDocument(t);
        return;
      }
      {
        const o = new Ve(s, e.slice(r), !0);
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
        if (n && (We(e, n, r).isBounded && (o[n] = []), void 0 !== B(o, n) && s.size > 0)) {
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
    const t = new Ve(e.k, e.s, e.e);
    return (t.w = e.w), (t.d = new Set(e.d)), (t.c = new Map(e?.c?.map(([e, t]) => [e, Ve.fromJSON(t)]))), t;
  }
}
class Fe extends Ve {
  constructor() {
    super('', '', !1);
  }
  static fromJSON(e) {
    const t = new Fe();
    return (t.w = e.w), (t.s = e.s), (t.e = e.e), (t.k = e.k), (t.d = new Set(e.d)), (t.c = new Map(e.c?.map(([e, t]) => [e, Ve.fromJSON(t)]))), t;
  }
  toJSON() {
    return super.toJSON();
  }
}
class je {
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
    const n = new je(e.point, e.docIDs);
    return (n.parent = t), e.left && (n.left = je.fromJSON(e.left, n)), e.right && (n.right = je.fromJSON(e.right, n)), n;
  }
}
class $e {
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
    const o = new je(e, t);
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
    const s = o ? $e.vincentyDistance : $e.haversineDistance,
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
      const i = $e.isPointInPolygon(e, n.point);
      ((i && t) || (!i && !t)) && s.push({ point: n.point, docIDs: Array.from(n.docIDs) });
    }
    const i = $e.calculatePolygonCentroid(e);
    if (n) {
      const e = r ? $e.vincentyDistance : $e.haversineDistance;
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
    const t = new $e();
    return e.root && ((t.root = je.fromJSON(e.root)), t.buildNodeMap(t.root)), t;
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
    let m,
      g,
      b,
      y,
      S,
      I,
      w,
      v = c,
      T = 1e3;
    do {
      const e = Math.sin(v),
        t = Math.cos(v);
      if (((g = Math.sqrt(p * e * (p * e) + (d * h - f * p * t) * (d * h - f * p * t))), 0 === g)) return 0;
      (b = f * h + d * p * t), (y = Math.atan2(g, b)), (S = (d * p * e) / g), (I = 1 - S * S), (w = b - (2 * f * h) / I), isNaN(w) && (w = 0);
      const n = (r / 16) * I * (4 + r * (4 - 3 * I));
      (m = v), (v = c + (1 - n) * r * S * (y + n * g * (w + n * b * (2 * w * w - 1))));
    } while (Math.abs(v - m) > 1e-12 && --T > 0);
    if (0 === T) return NaN;
    const D = (I * (n * n - o * o)) / (o * o),
      _ = (D / 1024) * (256 + D * (D * (74 - 47 * D) - 128));
    return o * (1 + (D / 16384) * (4096 + D * (D * (320 - 175 * D) - 768))) * (y - _ * g * (w + (_ / 4) * (b * (2 * w * w - 1) - (_ / 6) * w * (4 * g * g - 3) * (4 * w * w - 3))));
  }
}
class Ge {
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
    const t = new Ge();
    return (t.true = new Set(e.true)), (t.false = new Set(e.false)), t;
  }
}
function Je(e, t, n, r, o, { k: s, b: i, d: a }) {
  return (Math.log(1 + (n - t + 0.5) / (t + 0.5)) * (a + e * (s + 1))) / (e + s * (1 - i + (i * r) / o));
}
class Ye {
  size;
  vectors = new Map();
  constructor(e) {
    this.size = e;
  }
  add(e, t) {
    t instanceof Float32Array || (t = new Float32Array(t));
    const n = He(t, this.size);
    this.vectors.set(e, [n, t]);
  }
  remove(e) {
    this.vectors.delete(e);
  }
  find(e, t, n) {
    e instanceof Float32Array || (e = new Float32Array(e));
    const r = (function (e, t, n, r, o) {
      const s = He(e, r),
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
      n = new Ye(t.size);
    for (const [e, [r, o]] of t.vectors) n.vectors.set(e, [r, new Float32Array(o)]);
    return n;
  }
}
function He(e, t) {
  let n = 0;
  for (let r = 0; r < t; r++) n += e[r] * e[r];
  return Math.sqrt(n);
}
function Ke(e, t, n, r, o) {
  const s = pe(e.sharedInternalDocumentStore, n);
  (e.avgFieldLength[t] = ((e.avgFieldLength[t] ?? 0) * (o - 1) + r.length) / o), (e.fieldLengths[t][s] = r.length), (e.frequencies[t][s] = {});
}
function qe(e, t, n, r, o) {
  let s = 0;
  for (const e of r) e === o && s++;
  const i = pe(e.sharedInternalDocumentStore, n),
    a = s / r.length;
  (e.frequencies[t][i][o] = a), o in e.tokenOccurrences[t] || (e.tokenOccurrences[t][o] = 0), (e.tokenOccurrences[t][o] = (e.tokenOccurrences[t][o] ?? 0) + 1);
}
function Xe(e, t, n, r) {
  const o = pe(e.sharedInternalDocumentStore, n);
  (e.avgFieldLength[t] = r > 1 ? (e.avgFieldLength[t] * r - e.fieldLengths[t][o]) / (r - 1) : void 0), (e.fieldLengths[t][o] = void 0), (e.frequencies[t][o] = void 0);
}
function Ze(e, t, n) {
  e.tokenOccurrences[t][n]--;
}
function Qe(e, t, n, r, o = '') {
  r || (r = { sharedInternalDocumentStore: t, indexes: {}, vectorIndexes: {}, searchableProperties: [], searchablePropertiesWithTypes: {}, frequencies: {}, tokenOccurrences: {}, avgFieldLength: {}, fieldLengths: {} });
  for (const [s, i] of Object.entries(n)) {
    const n = `${o}${o ? '.' : ''}${s}`;
    if ('object' != typeof i || Array.isArray(i))
      if (ae(i)) r.searchableProperties.push(n), (r.searchablePropertiesWithTypes[n] = i), (r.vectorIndexes[n] = { type: 'Vector', node: new Ye(ue(i)), isArray: !1 });
      else {
        const e = /\[/.test(i);
        switch (i) {
          case 'boolean':
          case 'boolean[]':
            r.indexes[n] = { type: 'Bool', node: new Ge(), isArray: e };
            break;
          case 'number':
          case 'number[]':
            r.indexes[n] = { type: 'AVL', node: new ze(0, []), isArray: e };
            break;
          case 'string':
          case 'string[]':
            (r.indexes[n] = { type: 'Radix', node: new Fe(), isArray: e }), (r.avgFieldLength[n] = 0), (r.frequencies[n] = {}), (r.tokenOccurrences[n] = {}), (r.fieldLengths[n] = {});
            break;
          case 'enum':
          case 'enum[]':
            r.indexes[n] = { type: 'Flat', node: new Le(), isArray: e };
            break;
          case 'geopoint':
            r.indexes[n] = { type: 'BKD', node: new $e(), isArray: e };
            break;
          default:
            throw ee('INVALID_SCHEMA_TYPE', Array.isArray(i) ? 'array' : i, n);
        }
        r.searchableProperties.push(n), (r.searchablePropertiesWithTypes[n] = i);
      }
    else Qe(e, t, i, r, n);
  }
  return r;
}
function et(e, t, n, r, o, s, i, a, c, l, u) {
  if (ae(i)) return tt(t, n, s, r, o);
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
  if (!ce(i)) return f(s);
  const d = s,
    h = d.length;
  for (let e = 0; e < h; e++) f(d[e]);
}
function tt(e, t, n, r, o) {
  e.vectorIndexes[t].node.add(o, n);
}
function nt(e, t, n, r, o, s, i, a, c, l) {
  if (ae(i)) return t.vectorIndexes[n].node.remove(o), !0;
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
function rt(e, t, n, r, o, s, i, a, c, l) {
  if (!ce(i)) return nt(e, t, n, r, o, s, i, a, c, l);
  const u = le(i),
    f = s,
    d = f.length;
  for (let s = 0; s < d; s++) nt(e, t, n, r, o, f[s], u, a, c, l);
  return !0;
}
function ot(e, t, n, r, o, s, i, a, c, l) {
  const u = Array.from(r),
    f = e.avgFieldLength[t],
    d = e.fieldLengths[t],
    h = e.tokenOccurrences[t],
    p = e.frequencies[t],
    m = 'number' == typeof h[n] ? h[n] ?? 0 : 0,
    g = u.length;
  for (let e = 0; e < g; e++) {
    const r = u[e];
    if (c && !c.has(r)) continue;
    l.has(r) || l.set(r, new Map());
    const h = l.get(r);
    h.set(t, (h.get(t) || 0) + 1);
    const g = Je(p?.[r]?.[n] ?? 0, m, o, d[r], f, s);
    i.has(r) ? i.set(r, i.get(r) + g * a) : i.set(r, g * a);
  }
}
function st(e, t, n, r, o, s, i, a, c, l, u, f) {
  const d = r.length;
  for (let h = 0; h < d; h++) {
    const d = r[h],
      p = t.find({ term: d, exact: o, tolerance: s }),
      m = Object.keys(p),
      g = m.length;
    for (let t = 0; t < g; t++) {
      const r = m[t];
      ot(e, n, r, p[r], l, c, i, a, u, f);
    }
  }
}
function it(e, t, n, r, o, s, i, a, c, l, u, f = 0) {
  const d = n.tokenize(t, r),
    h = d.length || 1,
    p = new Map(),
    m = new Map();
  for (const n of o) {
    if (!(n in e.indexes)) continue;
    const r = e.indexes[n],
      { type: o } = r;
    if ('Radix' !== o) throw ee('WRONG_SEARCH_PROPERTY_TYPE', n);
    const f = a[n] ?? 1;
    if (f <= 0) throw ee('INVALID_BOOST_VALUE', f);
    0 !== d.length || t || d.push(''), st(e, r.node, n, d, s, i, m, f, c, l, u, p);
  }
  const g = Array.from(m.entries())
    .map(([e, t]) => [e, t])
    .sort((e, t) => t[1] - e[1]);
  if (0 === g.length) return [];
  if (1 === f) return g;
  const b = g.filter(([e]) => {
    const t = p.get(e);
    return !!t && Array.from(t.values()).some((e) => e === h);
  });
  if (0 === f) return b;
  if (b.length > 0) {
    const e = g.filter(([e]) => !b.some(([t]) => t === e)),
      t = Math.ceil(e.length * f);
    return [...b, ...e.slice(0, t)];
  }
  return g;
}
function at(e, t, n, r) {
  const o = Object.keys(n),
    s = o.reduce((e, t) => ({ [t]: new Set(), ...e }), {});
  for (const i of o) {
    const o = n[i];
    if (void 0 === e.indexes[i]) throw ee('UNKNOWN_FILTER_PROPERTY', i);
    const { node: a, type: c, isArray: l } = e.indexes[i];
    if ('Bool' === c) {
      const e = a,
        t = o ? e.true : e.false;
      s[i] = X(s[i], t);
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
          u = G(t, r),
          f = a.searchByRadius(n, u, c, void 0, l);
        s[i] = ht(s[i], f);
      } else {
        const { coordinates: t, inside: n = !0, highPrecision: r = !1 } = o[e],
          c = a.searchByPolygon(t, n, void 0, r);
        s[i] = ht(s[i], c);
      }
      continue;
    }
    if ('Radix' === c && ('string' == typeof o || Array.isArray(o))) {
      for (const e of [o].flat()) {
        const n = t.tokenize(e, r, i);
        for (const e of n) {
          const t = a.find({ term: e, exact: !0 });
          s[i] = pt(s[i], t);
        }
      }
      continue;
    }
    const u = Object.keys(o);
    if (u.length > 1) throw ee('INVALID_FILTER_OPERATION', u.length);
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
            throw ee('INVALID_FILTER_OPERATION', e);
        }
        s[i] = X(s[i], n);
      }
    } else {
      const e = new Set(l ? a.filterArr(o) : a.filter(o));
      s[i] = X(s[i], e);
    }
  }
  return K(...Object.values(s));
}
function ct(e) {
  return e.searchableProperties;
}
function lt(e) {
  return e.searchablePropertiesWithTypes;
}
function ut(e, t) {
  const { indexes: n, vectorIndexes: r, searchableProperties: o, searchablePropertiesWithTypes: s, frequencies: i, tokenOccurrences: a, avgFieldLength: c, fieldLengths: l } = t,
    u = {},
    f = {};
  for (const e of Object.keys(n)) {
    const { node: t, type: r, isArray: o } = n[e];
    switch (r) {
      case 'Radix':
        u[e] = { type: 'Radix', node: Fe.fromJSON(t), isArray: o };
        break;
      case 'Flat':
        u[e] = { type: 'Flat', node: Le.fromJSON(t), isArray: o };
        break;
      case 'AVL':
        u[e] = { type: 'AVL', node: ze.fromJSON(t), isArray: o };
        break;
      case 'BKD':
        u[e] = { type: 'BKD', node: $e.fromJSON(t), isArray: o };
        break;
      case 'Bool':
        u[e] = { type: 'Bool', node: Ge.fromJSON(t), isArray: o };
        break;
      default:
        u[e] = n[e];
    }
  }
  for (const e of Object.keys(r)) f[e] = { type: 'Vector', isArray: !1, node: Ye.fromJSON(r[e]) };
  return { sharedInternalDocumentStore: e, indexes: u, vectorIndexes: f, searchableProperties: o, searchablePropertiesWithTypes: s, frequencies: i, tokenOccurrences: a, avgFieldLength: c, fieldLengths: l };
}
function ft(e) {
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
function dt() {
  return { create: Qe, insert: et, remove: rt, insertDocumentScoreParameters: Ke, insertTokenScoreParameters: qe, removeDocumentScoreParameters: Xe, removeTokenScoreParameters: Ze, calculateResultScores: ot, search: it, searchByWhereClause: at, getSearchableProperties: ct, getSearchablePropertiesWithTypes: lt, load: ut, save: ft };
}
function ht(e, t) {
  e || (e = new Set());
  const n = t.length;
  for (let r = 0; r < n; r++) {
    const n = t[r].docIDs,
      o = n.length;
    for (let t = 0; t < o; t++) e.add(n[t]);
  }
  return e;
}
function pt(e, t) {
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
var mt = Object.freeze({ __proto__: null, insertDocumentScoreParameters: Ke, insertTokenScoreParameters: qe, removeDocumentScoreParameters: Xe, removeTokenScoreParameters: Ze, create: Qe, insert: et, insertVector: tt, remove: rt, calculateResultScores: ot, search: it, searchByWhereClause: at, getSearchableProperties: ct, getSearchablePropertiesWithTypes: lt, load: ut, save: ft, createIndex: dt });
function gt(e, t, n, r, o) {
  const s = { language: e.tokenizer.language, sharedInternalDocumentStore: t, enabled: !0, isSorted: !0, sortableProperties: [], sortablePropertiesWithTypes: {}, sorts: {} };
  for (const [i, a] of Object.entries(n)) {
    const n = `${o}${o ? '.' : ''}${i}`;
    if (!r.includes(n))
      if ('object' != typeof a || Array.isArray(a)) {
        if (!ae(a))
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
              throw ee('INVALID_SORT_SCHEMA_TYPE', Array.isArray(a) ? 'array' : a, n);
          }
      } else {
        const o = gt(e, t, a, r, n);
        R(s.sortableProperties, o.sortableProperties), (s.sorts = { ...s.sorts, ...o.sorts }), (s.sortablePropertiesWithTypes = { ...s.sortablePropertiesWithTypes, ...o.sortablePropertiesWithTypes });
      }
  }
  return s;
}
function bt(e, t, n, r) {
  return !1 !== r?.enabled ? gt(e, t, n, (r || {}).unsortableProperties || [], '') : { disabled: !0 };
}
function yt(e, t, n, r) {
  if (!e.enabled) return;
  e.isSorted = !1;
  const o = pe(e.sharedInternalDocumentStore, n),
    s = e.sorts[t];
  s.orderedDocsToRemove.has(o) && Dt(e, t), s.docs.set(o, s.orderedDocs.length), s.orderedDocs.push([o, r]);
}
function St(e) {
  if (e.isSorted || !e.enabled) return;
  const t = Object.keys(e.sorts);
  for (const n of t) Tt(e, n);
  e.isSorted = !0;
}
function It(t, r, o) {
  return r[1].localeCompare(
    o[1],
    (function (t) {
      return void 0 !== t && n.includes(t) ? e[t] : void 0;
    })(t)
  );
}
function wt(e, t) {
  return e[1] - t[1];
}
function vt(e, t) {
  return t[1] ? -1 : 1;
}
function Tt(e, t) {
  const n = e.sorts[t];
  let r;
  switch (n.type) {
    case 'string':
      r = It.bind(null, e.language);
      break;
    case 'number':
      r = wt.bind(null);
      break;
    case 'boolean':
      r = vt.bind(null);
  }
  n.orderedDocs.sort(r);
  const o = n.orderedDocs.length;
  for (let e = 0; e < o; e++) {
    const t = n.orderedDocs[e][0];
    n.docs.set(t, e);
  }
}
function Dt(e, t) {
  const n = e.sorts[t];
  n.orderedDocsToRemove.size && ((n.orderedDocs = n.orderedDocs.filter((e) => !n.orderedDocsToRemove.has(e[0]))), n.orderedDocsToRemove.clear());
}
function _t(e, t, n) {
  if (!e.enabled) return;
  const r = e.sorts[t],
    o = pe(e.sharedInternalDocumentStore, n);
  r.docs.get(o) && (r.docs.delete(o), r.orderedDocsToRemove.set(o, !0));
}
function Ot(e, t, n) {
  if (!e.enabled) throw ee('SORT_DISABLED');
  const r = n.property,
    o = 'DESC' === n.order,
    s = e.sorts[r];
  if (!s) throw ee('UNABLE_TO_SORT_ON_UNKNOWN_FIELD', r, e.sortableProperties.join(', '));
  return (
    Dt(e, r),
    St(e),
    t.sort((t, n) => {
      const r = s.docs.get(pe(e.sharedInternalDocumentStore, t[0])),
        i = s.docs.get(pe(e.sharedInternalDocumentStore, n[0])),
        a = void 0 !== r,
        c = void 0 !== i;
      return a || c ? (a ? (c ? (o ? i - r : r - i) : -1) : 1) : 0;
    }),
    t
  );
}
function Nt(e) {
  return e.enabled ? e.sortableProperties : [];
}
function At(e) {
  return e.enabled ? e.sortablePropertiesWithTypes : {};
}
function Pt(e, t) {
  const n = t;
  if (!n.enabled) return { enabled: !1 };
  const r = Object.keys(n.sorts).reduce((e, t) => {
    const { docs: r, orderedDocs: o, type: s } = n.sorts[t];
    return (e[t] = { docs: new Map(Object.entries(r).map(([e, t]) => [+e, t])), orderedDocsToRemove: new Map(), orderedDocs: o, type: s }), e;
  }, {});
  return { sharedInternalDocumentStore: e, language: n.language, sortableProperties: n.sortableProperties, sortablePropertiesWithTypes: n.sortablePropertiesWithTypes, sorts: r, enabled: !0, isSorted: n.isSorted };
}
function Et(e) {
  if (!e.enabled) return { enabled: !1 };
  !(function (e) {
    const t = Object.keys(e.sorts);
    for (const n of t) Dt(e, n);
  })(e),
    St(e);
  const t = Object.keys(e.sorts).reduce((t, n) => {
    const { docs: r, orderedDocs: o, type: s } = e.sorts[n];
    return (t[n] = { docs: Object.fromEntries(r.entries()), orderedDocs: o, type: s }), t;
  }, {});
  return { language: e.language, sortableProperties: e.sortableProperties, sortablePropertiesWithTypes: e.sortablePropertiesWithTypes, sorts: t, enabled: e.enabled, isSorted: e.isSorted };
}
function xt() {
  return { create: bt, insert: yt, remove: _t, save: Et, load: Pt, sortBy: Ot, getSortableProperties: Nt, getSortablePropertiesWithTypes: At };
}
var Mt = Object.freeze({ __proto__: null, load: Pt, save: Et, createSorter: xt });
const kt = [65, 65, 65, 65, 65, 65, 65, 67, 69, 69, 69, 69, 73, 73, 73, 73, 69, 78, 79, 79, 79, 79, 79, null, 79, 85, 85, 85, 85, 89, 80, 115, 97, 97, 97, 97, 97, 97, 97, 99, 101, 101, 101, 101, 105, 105, 105, 105, 101, 110, 111, 111, 111, 111, 111, null, 111, 117, 117, 117, 117, 121, 112, 121, 65, 97, 65, 97, 65, 97, 67, 99, 67, 99, 67, 99, 67, 99, 68, 100, 68, 100, 69, 101, 69, 101, 69, 101, 69, 101, 69, 101, 71, 103, 71, 103, 71, 103, 71, 103, 72, 104, 72, 104, 73, 105, 73, 105, 73, 105, 73, 105, 73, 105, 73, 105, 74, 106, 75, 107, 107, 76, 108, 76, 108, 76, 108, 76, 108, 76, 108, 78, 110, 78, 110, 78, 110, 110, 78, 110, 79, 111, 79, 111, 79, 111, 79, 111, 82, 114, 82, 114, 82, 114, 83, 115, 83, 115, 83, 115, 83, 115, 84, 116, 84, 116, 84, 116, 85, 117, 85, 117, 85, 117, 85, 117, 85, 117, 85, 117, 87, 119, 89, 121, 89, 90, 122, 90, 122, 90, 122, 115];
const Rt = { ational: 'ate', tional: 'tion', enci: 'ence', anci: 'ance', izer: 'ize', bli: 'ble', alli: 'al', entli: 'ent', eli: 'e', ousli: 'ous', ization: 'ize', ation: 'ate', ator: 'ate', alism: 'al', iveness: 'ive', fulness: 'ful', ousness: 'ous', aliti: 'al', iviti: 'ive', biliti: 'ble', logi: 'log' },
  Ct = { icate: 'ic', ative: '', alize: 'al', iciti: 'ic', ical: 'ic', ful: '', ness: '' },
  Ut = '[aeiouy]',
  zt = '[^aeiou][^aeiouy]*',
  Lt = Ut + '[aeiou]*',
  Bt = '^(' + zt + ')?' + Lt + zt,
  Wt = '^(' + zt + ')?' + Lt + zt + '(' + Lt + ')?$',
  Vt = '^(' + zt + ')?' + Lt + zt + Lt + zt,
  Ft = '^(' + zt + ')?' + Ut;
function jt(e) {
  let t, n, r, o, s, i;
  if (e.length < 3) return e;
  const a = e.substring(0, 1);
  if (('y' == a && (e = a.toUpperCase() + e.substring(1)), (r = /^(.+?)(ss|i)es$/), (o = /^(.+?)([^s])s$/), r.test(e) ? (e = e.replace(r, '$1$2')) : o.test(e) && (e = e.replace(o, '$1$2')), (r = /^(.+?)eed$/), (o = /^(.+?)(ed|ing)$/), r.test(e))) {
    const t = r.exec(e);
    (r = new RegExp(Bt)), r.test(t[1]) && ((r = /.$/), (e = e.replace(r, '')));
  } else if (o.test(e)) {
    (t = o.exec(e)[1]), (o = new RegExp(Ft)), o.test(t) && ((e = t), (o = /(at|bl|iz)$/), (s = new RegExp('([^aeiouylsz])\\1$')), (i = new RegExp('^' + zt + Ut + '[^aeiouwxy]$')), o.test(e) ? (e += 'e') : s.test(e) ? ((r = /.$/), (e = e.replace(r, ''))) : i.test(e) && (e += 'e'));
  }
  if (((r = /^(.+?)y$/), r.test(e))) {
    const n = r.exec(e);
    (t = n?.[1]), (r = new RegExp(Ft)), t && r.test(t) && (e = t + 'i');
  }
  if (((r = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/), r.test(e))) {
    const o = r.exec(e);
    (t = o?.[1]), (n = o?.[2]), (r = new RegExp(Bt)), t && r.test(t) && (e = t + Rt[n]);
  }
  if (((r = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/), r.test(e))) {
    const o = r.exec(e);
    (t = o?.[1]), (n = o?.[2]), (r = new RegExp(Bt)), t && r.test(t) && (e = t + Ct[n]);
  }
  if (((r = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/), (o = /^(.+?)(s|t)(ion)$/), r.test(e))) {
    const n = r.exec(e);
    (t = n?.[1]), (r = new RegExp(Vt)), t && r.test(t) && (e = t);
  } else if (o.test(e)) {
    const n = o.exec(e);
    (t = n?.[1] ?? '' + n?.[2] ?? ''), (o = new RegExp(Vt)), o.test(t) && (e = t);
  }
  if (((r = /^(.+?)e$/), r.test(e))) {
    const n = r.exec(e);
    (t = n?.[1]), (r = new RegExp(Vt)), (o = new RegExp(Wt)), (s = new RegExp('^' + zt + Ut + '[^aeiouwxy]$')), t && (r.test(t) || (o.test(t) && !s.test(t))) && (e = t);
  }
  return (r = /ll$/), (o = new RegExp(Vt)), r.test(e) && o.test(e) && ((r = /.$/), (e = e.replace(r, ''))), 'y' == a && (e = a.toLowerCase() + e.substring(1)), e;
}
function $t(e, t, n = !0) {
  const r = `${this.language}:${e}:${t}`;
  return n && this.normalizationCache.has(r)
    ? this.normalizationCache.get(r)
    : this.stopWords?.includes(t)
    ? (n && this.normalizationCache.set(r, ''), '')
    : (this.stemmer && !this.stemmerSkipProperties.has(e) && (t = this.stemmer(t)),
      (t = (function (e) {
        const t = [];
        for (let r = 0; r < e.length; r++) t[r] = (n = e.charCodeAt(r)) < 192 || n > 383 ? n : kt[n - 192] || n;
        var n;
        return String.fromCharCode(...t);
      })(t)),
      n && this.normalizationCache.set(r, t),
      t);
}
function Gt(e, n, r, o = !0) {
  if (n && n !== this.language) throw ee('LANGUAGE_NOT_SUPPORTED', n);
  if ('string' != typeof e) return [e];
  const s = this.normalizeToken.bind(this, r ?? '');
  let i;
  if (r && this.tokenizeSkipProperties.has(r)) i = [s(e, o)];
  else {
    const n = t[this.language];
    i = e
      .toLowerCase()
      .split(n)
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
function Jt(e = {}) {
  if (e.language) {
    if (!n.includes(e.language)) throw ee('LANGUAGE_NOT_SUPPORTED', e.language);
  } else e.language = 'english';
  let t, r;
  if (e.stemming || (e.stemmer && !('stemming' in e)))
    if (e.stemmer) {
      if ('function' != typeof e.stemmer) throw ee('INVALID_STEMMER_FUNCTION_TYPE');
      t = e.stemmer;
    } else {
      if ('english' !== e.language) throw ee('MISSING_STEMMER', e.language);
      t = jt;
    }
  if (!1 !== e.stopWords) {
    if (((r = []), Array.isArray(e.stopWords))) r = e.stopWords;
    else if ('function' == typeof e.stopWords) r = e.stopWords(r);
    else if (e.stopWords) throw ee('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
    if (!Array.isArray(r)) throw ee('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
    for (const e of r) if ('string' != typeof e) throw ee('CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY');
  }
  const o = { tokenize: Gt, language: e.language, stemmer: t, stemmerSkipProperties: new Set(e.stemmerSkipProperties ? [e.stemmerSkipProperties].flat() : []), tokenizeSkipProperties: new Set(e.tokenizeSkipProperties ? [e.tokenizeSkipProperties].flat() : []), stopWords: r, allowDuplicates: Boolean(e.allowDuplicates), normalizeToken: $t, normalizationCache: new Map() };
  return (o.tokenize = Gt.bind(o)), (o.normalizeToken = $t), o;
}
var Yt = Object.freeze({ __proto__: null, normalizeToken: $t, createTokenizer: Jt });
function Ht(e) {
  const t = { formatElapsedTime: te, getDocumentIndexId: ne, getDocumentProperties: F, validateSchema: re };
  for (const n of xe) {
    const r = n;
    if (e[r]) {
      if ('function' != typeof e[r]) throw ee('COMPONENT_MUST_BE_FUNCTION', r);
    } else e[r] = t[r];
  }
  for (const t of Object.keys(e)) if (!Ee.includes(t) && !xe.includes(t)) throw ee('UNSUPPORTED_COMPONENT', t);
}
function Kt({ schema: e, sort: t, language: n, components: r, id: o, plugins: s }) {
  r || (r = {});
  for (const t of s ?? []) {
    if (!('getComponents' in t)) continue;
    if ('function' != typeof t.getComponents) continue;
    const n = t.getComponents(e),
      o = Object.keys(n);
    for (const e of o) if (r[e]) throw ee('PLUGIN_COMPONENT_CONFLICT', e, t.name);
    r = { ...r, ...n };
  }
  o || (o = L());
  let i = r.tokenizer,
    a = r.index,
    c = r.documentsStore,
    l = r.sorter;
  if (i)
    if (i.tokenize) {
      i = i;
    } else i = Jt(i);
  else i = Jt({ language: n ?? 'english' });
  if (r.tokenizer && n) throw ee('NO_LANGUAGE_WITH_CUSTOM_TOKENIZER');
  const u = fe();
  (a ||= dt()), (l ||= xt()), (c ||= Oe()), Ht(r);
  const { getDocumentProperties: f, getDocumentIndexId: d, validateSchema: h, formatElapsedTime: p } = r,
    m = { data: {}, caches: {}, schema: e, tokenizer: i, index: a, sorter: l, documentsStore: c, internalDocumentIDStore: u, getDocumentProperties: f, getDocumentIndexId: d, validateSchema: h, beforeInsert: [], afterInsert: [], beforeRemove: [], afterRemove: [], beforeUpdate: [], afterUpdate: [], beforeSearch: [], afterSearch: [], beforeInsertMultiple: [], afterInsertMultiple: [], beforeRemoveMultiple: [], afterRemoveMultiple: [], afterUpdateMultiple: [], beforeUpdateMultiple: [], afterCreate: [], formatElapsedTime: p, id: o, plugins: s, version: '{{VERSION}}' };
  m.data = { index: m.index.create(m, u, e), docs: m.documentsStore.create(m, u), sorting: m.sorter.create(m, u, e, t) };
  for (const e of Ae) m[e] = (m[e] ?? []).concat(Pe(m, e));
  const g = m.afterCreate;
  return (
    g &&
      (function (e, t) {
        if (e.some(Y))
          return (async () => {
            for (const n of e) await n(t);
          })();
        for (const n of e) n(t);
      })(g, m),
    m
  );
}
function qt(e, t) {
  return e.documentsStore.get(e.data.docs, t);
}
function Xt(e) {
  return e.documentsStore.count(e.data.docs);
}
var Zt = Object.freeze({ __proto__: null, documentsStore: Ne, index: mt, tokenizer: Yt, sorter: Mt, internalDocumentIDStore: ge, getDocumentProperties: F, formatElapsedTime: te, getDocumentIndexId: ne, validateSchema: re, isGeoPointType: ie, isVectorType: ae, isArrayType: ce, getInnerType: le, getVectorSize: ue });
const Qt = 'fulltext',
  en = 'hybrid',
  tn = 'vector',
  nn = Symbol('orama.insertions'),
  rn = Symbol('orama.removals'),
  on =
    globalThis.process?.emitWarning ??
    function (e, t) {
      console.warn(`[WARNING] [${t.code}] ${e}`);
    };
function sn(e) {
  'number' != typeof e[nn] &&
    (queueMicrotask(() => {
      e[nn] = void 0;
    }),
    (e[nn] = 0)),
    e[nn] > 1e3 ? (on("Orama's insert operation is synchronous. Please avoid inserting a large number of document in a single operation in order not to block the main thread or, in alternative, please use insertMultiple.", { code: 'ORAMA0001' }), (e[nn] = -1)) : e[nn] >= 0 && e[nn]++;
}
function an(e) {
  'number' != typeof e[rn] &&
    (queueMicrotask(() => {
      e[rn] = void 0;
    }),
    (e[rn] = 0)),
    e[rn] > 1e3 ? (on("Orama's remove operation is synchronous. Please avoid removing a large number of document in a single operation in order not to block the main thread, in alternative, please use updateMultiple.", { code: 'ORAMA0002' }), (e[rn] = -1)) : e[rn] >= 0 && e[rn]++;
}
function cn(e, t, n, r, o) {
  const s = e.validateSchema(t, e.schema);
  if (s) throw ee('SCHEMA_VALIDATION_FAILURE', s);
  return Y(e.beforeInsert) || Y(e.afterInsert) || Y(e.index.beforeInsert) || Y(e.index.insert) || Y(e.index.afterInsert)
    ? (async function (e, t, n, r, o) {
        const { index: s, docs: i } = e.data,
          a = e.getDocumentIndexId(t);
        if ('string' != typeof a) throw ee('DOCUMENT_ID_MUST_BE_STRING', typeof a);
        const c = pe(e.internalDocumentIDStore, a);
        if (!e.documentsStore.store(i, a, c, t)) throw ee('DOCUMENT_ALREADY_EXISTS', a);
        const l = e.documentsStore.count(i);
        r || (await Me(e.beforeInsert, e, a, t));
        const u = e.index.getSearchableProperties(s),
          f = e.index.getSearchablePropertiesWithTypes(s),
          d = e.getDocumentProperties(t, u);
        for (const [e, t] of Object.entries(d)) {
          if (void 0 === t) continue;
          fn(typeof t, f[e], e, t);
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
          r || (await Me(e.afterInsert, e, a, t));
        return sn(e), a;
      })(e, t, n, r, o)
    : (function (e, t, n, r, o) {
        const { index: s, docs: i } = e.data,
          a = e.getDocumentIndexId(t);
        if ('string' != typeof a) throw ee('DOCUMENT_ID_MUST_BE_STRING', typeof a);
        const c = pe(e.internalDocumentIDStore, a);
        if (!e.documentsStore.store(i, a, c, t)) throw ee('DOCUMENT_ALREADY_EXISTS', a);
        const l = e.documentsStore.count(i);
        r || Me(e.beforeInsert, e, a, t);
        const u = e.index.getSearchableProperties(s),
          f = e.index.getSearchablePropertiesWithTypes(s),
          d = e.getDocumentProperties(t, u);
        for (const [e, t] of Object.entries(d)) {
          if (void 0 === t) continue;
          fn(typeof t, f[e], e, t);
        }
        (function (e, t, n, r, o, s, i, a) {
          for (const i of n) {
            const n = r[i];
            if (void 0 === n) continue;
            const c = e.index.getSearchablePropertiesWithTypes(e.data.index)[i],
              l = pe(e.internalDocumentIDStore, t);
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
          r || Me(e.afterInsert, e, a, t);
        return sn(e), a;
      })(e, t, n, r, o);
}
const ln = new Set(['enum', 'enum[]']),
  un = new Set(['string', 'number']);
function fn(e, t, n, r) {
  if (!((ie(t) && 'object' == typeof r && 'number' == typeof r.lon && 'number' == typeof r.lat) || (ae(t) && Array.isArray(r)) || (ce(t) && Array.isArray(r)) || (ln.has(t) && un.has(e)) || e === t)) throw ee('INVALID_DOCUMENT_PROPERTY', n, t, e);
}
function dn(e, t, n, r, o, s) {
  return Y(e.afterInsertMultiple) || Y(e.beforeInsertMultiple) || Y(e.index.beforeInsert) || Y(e.index.insert) || Y(e.index.afterInsert) ? hn(e, t, n, r, o, s) : pn(e, t, n, r, o, s);
}
async function hn(e, t, n = 1e3, r, o, s = 0) {
  const i = [],
    a = async (s) => {
      const a = Math.min(s + n, t.length),
        c = t.slice(s, a);
      for (const t of c) {
        const n = { avlRebalanceThreshold: c.length },
          s = await cn(e, t, r, o, n);
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
          n > 0 && Z(n);
        }
      }
    })(),
    o || (await ke(e.afterInsertMultiple, e, t)),
    i
  );
}
function pn(e, t, n = 1e3, r, o, s = 0) {
  const i = [];
  let a = 0;
  function c() {
    const s = t.slice(a * n, (a + 1) * n);
    if (0 === s.length) return !1;
    for (const t of s) {
      const n = { avlRebalanceThreshold: s.length },
        a = cn(e, t, r, o, n);
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
            e > 0 && Z(e);
          }
        }
      }
    })(),
    o || ke(e.afterInsertMultiple, e, t),
    i
  );
}
function mn(e, t, n, r, o, s) {
  return Y(e.beforeInsert) || Y(e.afterInsert) || Y(e.index.beforeInsert) || Y(e.index.insert) || Y(e.index.afterInsert) ? hn(e, t, n, r, o, s) : pn(e, t, n, r, o, s);
}
function gn(e, t, n, r) {
  return Y(e.index.beforeRemove) || Y(e.index.remove) || Y(e.index.afterRemove)
    ? (async function (e, t, n, r) {
        let o = !0;
        const { index: s, docs: i } = e.data,
          a = e.documentsStore.get(i, t);
        if (!a) return !1;
        const c = pe(e.internalDocumentIDStore, t),
          l = me(e.internalDocumentIDStore, c),
          u = e.documentsStore.count(i);
        r || (await Me(e.beforeRemove, e, l));
        const f = e.index.getSearchableProperties(s),
          d = e.index.getSearchablePropertiesWithTypes(s),
          h = e.getDocumentProperties(a, f);
        for (const r of f) {
          const s = h[r];
          if (void 0 === s) continue;
          const i = d[r];
          await e.index.beforeRemove?.(e.data.index, r, l, s, i, n, e.tokenizer, u), (await e.index.remove(e.index, e.data.index, r, t, c, s, i, n, e.tokenizer, u)) || (o = !1), await e.index.afterRemove?.(e.data.index, r, l, s, i, n, e.tokenizer, u);
        }
        const p = await e.sorter.getSortableProperties(e.data.sorting),
          m = await e.getDocumentProperties(a, p);
        for (const n of p) void 0 !== m[n] && e.sorter.remove(e.data.sorting, n, t);
        r || (await Me(e.afterRemove, e, l));
        return e.documentsStore.remove(e.data.docs, t, c), an(e), o;
      })(e, t, n, r)
    : (function (e, t, n, r) {
        let o = !0;
        const { index: s, docs: i } = e.data,
          a = e.documentsStore.get(i, t);
        if (!a) return !1;
        const c = pe(e.internalDocumentIDStore, t),
          l = me(e.internalDocumentIDStore, c),
          u = e.documentsStore.count(i);
        r || Me(e.beforeRemove, e, l);
        const f = e.index.getSearchableProperties(s),
          d = e.index.getSearchablePropertiesWithTypes(s),
          h = e.getDocumentProperties(a, f);
        for (const r of f) {
          const s = h[r];
          if (void 0 === s) continue;
          const i = d[r];
          e.index.beforeRemove?.(e.data.index, r, l, s, i, n, e.tokenizer, u), e.index.remove(e.index, e.data.index, r, t, c, s, i, n, e.tokenizer, u) || (o = !1), e.index.afterRemove?.(e.data.index, r, l, s, i, n, e.tokenizer, u);
        }
        const p = e.sorter.getSortableProperties(e.data.sorting),
          m = e.getDocumentProperties(a, p);
        for (const n of p) void 0 !== m[n] && e.sorter.remove(e.data.sorting, n, t);
        r || Me(e.afterRemove, e, l);
        return e.documentsStore.remove(e.data.docs, t, c), an(e), o;
      })(e, t, n, r);
}
function bn(e, t, n, r, o) {
  return Y(e.index.beforeRemove) || Y(e.index.remove) || Y(e.index.afterRemove) || Y(e.beforeRemoveMultiple) || Y(e.afterRemoveMultiple)
    ? (async function (e, t, n, r, o) {
        let s = 0;
        n || (n = 1e3);
        const i = o ? [] : t.map((t) => me(e.internalDocumentIDStore, pe(e.internalDocumentIDStore, t)));
        o || (await ke(e.beforeRemoveMultiple, e, i));
        await new Promise((i, a) => {
          let c = 0;
          async function l() {
            const u = t.slice(c * n, ++c * n);
            if (!u.length) return i();
            for (const t of u)
              try {
                (await gn(e, t, r, o)) && s++;
              } catch (e) {
                a(e);
              }
            setTimeout(l, 0);
          }
          setTimeout(l, 0);
        }),
          o || (await ke(e.afterRemoveMultiple, e, i));
        return s;
      })(e, t, n, r, o)
    : (function (e, t, n, r, o) {
        let s = 0;
        n || (n = 1e3);
        const i = o ? [] : t.map((t) => me(e.internalDocumentIDStore, pe(e.internalDocumentIDStore, t)));
        o || ke(e.beforeRemoveMultiple, e, i);
        let a = 0;
        function c() {
          const i = t.slice(a * n, ++a * n);
          if (i.length) {
            for (const t of i) gn(e, t, r, o) && s++;
            setTimeout(c, 0);
          }
        }
        c(), o || ke(e.afterRemoveMultiple, e, i);
        return s;
      })(e, t, n, r, o);
}
function yn(e, t) {
  return e[1] - t[1];
}
function Sn(e, t) {
  return t[1] - e[1];
}
function In(e = 'desc') {
  return 'asc' === e.toLowerCase() ? yn : Sn;
}
function wn(e, t, n) {
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
      const o = e.includes('.') ? j(t, e) : t[e],
        s = a[e],
        i = r[e].values;
      switch (s) {
        case 'number':
          vn(n[e].ranges, i)(o);
          break;
        case 'number[]': {
          const t = new Set(),
            r = vn(n[e].ranges, i, t);
          for (const e of o) r(e);
          break;
        }
        case 'boolean':
        case 'enum':
        case 'string':
          Tn(i, s)(o);
          break;
        case 'boolean[]':
        case 'enum[]':
        case 'string[]': {
          const e = Tn(i, 'boolean[]' === s ? 'boolean' : 'string', new Set());
          for (const t of o) e(t);
          break;
        }
        default:
          throw ee('FACET_NOT_SUPPORTED', s);
      }
    }
  }
  for (const e of i) {
    const t = r[e];
    if (((t.count = Object.keys(t.values).length), 'string' === a[e])) {
      const r = n[e],
        o = In(r.sort);
      t.values = Object.fromEntries(
        Object.entries(t.values)
          .sort(o)
          .slice(r.offset ?? 0, r.limit ?? 10)
      );
    }
  }
  return r;
}
function vn(e, t, n) {
  return (r) => {
    for (const o of e) {
      const e = `${o.from}-${o.to}`;
      n?.has(e) || (r >= o.from && r <= o.to && (void 0 === t[e] ? (t[e] = 1) : (t[e]++, n?.add(e))));
    }
  };
}
function Tn(e, t, n) {
  const r = 'boolean' === t ? 'false' : '';
  return (t) => {
    const o = t?.toString() ?? r;
    n?.has(o) || ((e[o] = (e[o] ?? 0) + 1), n?.add(o));
  };
}
const Dn = { reducer: (e, t, n, r) => ((t[r] = n), t), getInitialValue: (e) => Array.from({ length: e }) },
  _n = ['string', 'number', 'boolean'];
function On(e, t, n) {
  const r = n.properties,
    o = r.length,
    s = e.index.getSearchablePropertiesWithTypes(e.data.index);
  for (let e = 0; e < o; e++) {
    const t = r[e];
    if (void 0 === s[t]) throw ee('UNKNOWN_GROUP_BY_PROPERTY', t);
    if (!_n.includes(s[t])) throw ee('INVALID_GROUP_BY_PROPERTY', t, _n.join(', '), s[t]);
  }
  const i = t.map(([t]) => me(e.internalDocumentIDStore, t)),
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
      const r = j(a[e], t);
      if (void 0 === r) continue;
      const s = 'boolean' != typeof r ? r : '' + r,
        i = n.perValue[s] ?? { indexes: [], count: 0 };
      i.count >= l || (i.indexes.push(e), i.count++, (n.perValue[s] = i), o.add(r));
    }
    u.push(Array.from(o)), (f[t] = n);
  }
  const d = Nn(u),
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
    (o.indexes = V(s).sort((e, t) => e - t)), 0 !== o.indexes.length && p.push(o);
  }
  const m = p.length,
    g = Array.from({ length: m });
  for (let e = 0; e < m; e++) {
    const r = p[e],
      o = n.reduce || Dn,
      s = r.indexes.map((e) => ({ id: i[e], score: t[e][1], document: a[e] })),
      c = o.reducer.bind(null, r.values),
      l = o.getInitialValue(r.indexes.length),
      u = s.reduce(c, l);
    g[e] = { values: r.values, result: u };
  }
  return g;
}
function Nn(e, t = 0) {
  if (t + 1 === e.length) return e[t].map((e) => [e]);
  const n = e[t],
    r = Nn(e, t + 1),
    o = [];
  for (const e of n)
    for (const t of r) {
      const n = [e];
      R(n, t), o.push(n);
    }
  return o;
}
function An(e, t, n) {
  const { term: r, properties: o } = t,
    s = e.data.index;
  let i = e.caches.propertiesToSearch;
  if (!i) {
    const t = e.index.getSearchablePropertiesWithTypes(s);
    (i = e.index.getSearchableProperties(s)), (i = i.filter((e) => t[e].startsWith('string'))), (e.caches.propertiesToSearch = i);
  }
  if (o && '*' !== o) {
    for (const e of o) if (!i.includes(e)) throw ee('UNKNOWN_INDEX', e, i.join(', '));
    i = i.filter((e) => o.includes(e));
  }
  let a, c;
  if ((Object.keys(t.where ?? {}).length > 0 && (a = e.index.searchByWhereClause(s, e.tokenizer, t.where, n)), r || o)) {
    const o = Xt(e);
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
        return (t.k = t.k ?? En.k), (t.b = t.b ?? En.b), (t.d = t.d ?? En.d), t;
      })(t.relevance),
      o,
      a,
      void 0 !== t.threshold && null !== t.threshold ? t.threshold : 1
    );
  } else {
    c = (a ? Array.from(a) : Object.keys(e.documentsStore.getAll(e.data.docs))).map((e) => [+e, 0]);
  }
  return c;
}
function Pn(e, t, n) {
  const r = z();
  function o() {
    const o = Object.keys(e.data.index.vectorIndexes),
      s = t.facets && Object.keys(t.facets).length > 0,
      { limit: i = 10, offset: a = 0, distinctOn: c, includeVectors: l = !1 } = t,
      u = !0 === t.preflight;
    let f,
      d = An(e, t, n);
    if (t.sortBy)
      if ('function' == typeof t.sortBy) {
        const n = d.map(([e]) => e),
          r = e.documentsStore.getMultiple(e.data.docs, n).map((e, t) => [d[t][0], d[t][1], e]);
        r.sort(t.sortBy), (d = r.map(([e, t]) => [e, t]));
      } else d = e.sorter.sortBy(e.data.sorting, d, t.sortBy).map(([t, n]) => [pe(e.internalDocumentIDStore, t), n]);
    else d = d.sort(W);
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
                m = j(p, o);
              if (void 0 !== m && !i.has(m) && (i.set(m, !0), u++, !(u <= n) && (a.push({ id: me(e.internalDocumentIDStore, d), score: h, document: p }), c.add(d), u >= n + r))) break;
            }
            return a;
          })(e, d, a, i, c)
        : zn(e, d, a, i));
    const h = { elapsed: { formatted: '', raw: 0 }, hits: [], count: d.length };
    if ((void 0 !== f && ((h.hits = f.filter(Boolean)), l || J(h, o)), s)) {
      const n = wn(e, d, t.facets);
      h.facets = n;
    }
    return t.groupBy && (h.groups = On(e, d, t.groupBy)), (h.elapsed = e.formatElapsedTime(z() - r)), h;
  }
  return e.beforeSearch?.length || e.afterSearch?.length
    ? (async function () {
        e.beforeSearch && (await Ce(e.beforeSearch, e, t, n));
        const r = o();
        return e.afterSearch && (await Re(e.afterSearch, e, t, n, r)), r;
      })()
    : o();
}
const En = { k: 1.2, b: 0.75, d: 0.5 };
function xn(e, t, n) {
  const r = t.vector;
  if (r && (!('value' in r) || !('property' in r))) throw ee('INVALID_VECTOR_INPUT', Object.keys(r).join(', '));
  const o = e.data.index.vectorIndexes[r.property],
    s = o.node.size;
  if (r?.value.length !== s) {
    if (void 0 === r?.property || void 0 === r?.value.length) throw ee('INVALID_INPUT_VECTOR', 'undefined', s, 'undefined');
    throw ee('INVALID_INPUT_VECTOR', r.property, s, r.value.length);
  }
  const i = e.data.index;
  let a;
  return Object.keys(t.where ?? {}).length > 0 && (a = e.index.searchByWhereClause(i, e.tokenizer, t.where, n)), o.node.find(r.value, t.similarity ?? 0.8, a);
}
function Mn(e, t, n = 'english') {
  const r = z();
  function o() {
    const o = xn(e, t, n).sort(W);
    let s = [];
    if (t.facets && Object.keys(t.facets).length > 0) {
      s = wn(e, o, t.facets);
    }
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
        const o = { id: me(e.internalDocumentIDStore, n[0]), score: n[1], document: r };
        u[t] = o;
      }
    }
    let f = [];
    t.groupBy && (f = On(e, o, t.groupBy));
    const d = z() - r;
    return { count: o.length, hits: u.filter(Boolean), elapsed: { raw: Number(d), formatted: U(d) }, ...(s ? { facets: s } : {}), ...(f ? { groups: f } : {}) };
  }
  return e.beforeSearch?.length || e.afterSearch?.length
    ? (async function () {
        e.beforeSearch && (await Ce(e.beforeSearch, e, t, n));
        const r = o();
        return e.afterSearch && (await Re(e.afterSearch, e, t, n, r)), r;
      })()
    : o();
}
function kn(e, t, n) {
  const r = (function (e) {
      const t = Math.max.apply(Math, e.map(Rn));
      return e.map(([e, n]) => [e, n / t]);
    })(An(e, t, n)),
    o = xn(e, t, n),
    s = t.hybridWeights;
  return (function (e, t, n, r) {
    const o = Math.max.apply(Math, e.map(Rn)),
      s = Math.max.apply(Math, t.map(Rn)),
      i = r && r.text && r.vector,
      { text: a, vector: c } = i ? r : { text: 0.5, vector: 0.5 },
      l = new Map(),
      u = e.length,
      f = (function (e, t) {
        return (n, r) => n * e + r * t;
      })(a, c);
    for (let t = 0; t < u; t++) {
      const [n, r] = e[t],
        s = f(Cn(r, o), 0);
      l.set(n, s);
    }
    const d = t.length;
    for (let e = 0; e < d; e++) {
      const [n, r] = t[e],
        o = Cn(r, s),
        i = l.get(n) ?? 0;
      l.set(n, i + f(0, o));
    }
    return [...l].sort((e, t) => t[1] - e[1]);
  })(r, o, t.term, s);
}
function Rn(e) {
  return e[1];
}
function Cn(e, t) {
  return e / t;
}
function Un(e, t, n) {
  const r = t.mode ?? Qt;
  if (r === Qt) return Pn(e, t, n);
  if (r === tn) return Mn(e, t);
  if (r === en)
    return (function (e, t, n) {
      const r = z();
      function o() {
        const o = kn(e, t, n);
        let s, i;
        t.facets && Object.keys(t.facets).length > 0 && (s = wn(e, o, t.facets)), t.groupBy && (i = On(e, o, t.groupBy));
        const a = t.offset ?? 0,
          c = t.limit ?? 10,
          l = zn(e, o, a, c).filter(Boolean),
          u = z(),
          f = { count: o.length, elapsed: { raw: Number(u - r), formatted: U(u - r) }, hits: l, ...(s ? { facets: s } : {}), ...(i ? { groups: i } : {}) };
        return t.includeVectors || J(f, Object.keys(e.data.index.vectorIndexes)), f;
      }
      return e.beforeSearch?.length || e.afterSearch?.length
        ? (async function () {
            e.beforeSearch && (await Ce(e.beforeSearch, e, t, n));
            const r = o();
            return e.afterSearch && (await Re(e.afterSearch, e, t, n, r)), r;
          })()
        : o();
    })(e, t);
  throw ee('INVALID_SEARCH_MODE', r);
}
function zn(e, t, n, r) {
  const o = e.data.docs,
    s = Array.from({ length: r }),
    i = new Set();
  for (let a = n; a < r + n; a++) {
    const n = t[a];
    if (void 0 === n) break;
    const [r, c] = n;
    if (!i.has(r)) {
      const t = e.documentsStore.get(o, r);
      (s[a] = { id: me(e.internalDocumentIDStore, r), score: c, document: t }), i.add(r);
    }
  }
  return s;
}
function Ln(e, t) {
  e.internalDocumentIDStore.load(e, t.internalDocumentIDStore), (e.data.index = e.index.load(e.internalDocumentIDStore, t.index)), (e.data.docs = e.documentsStore.load(e.internalDocumentIDStore, t.docs)), (e.data.sorting = e.sorter.load(e.internalDocumentIDStore, t.sorting)), (e.tokenizer.language = t.language);
}
function Bn(e) {
  return { internalDocumentIDStore: e.internalDocumentIDStore.save(e.internalDocumentIDStore), index: e.index.save(e.data.index), docs: e.documentsStore.save(e.data.docs), sorting: e.sorter.save(e.data.sorting), language: e.tokenizer.language };
}
function Wn(e, t, n, r, o) {
  return Y(e.afterInsert) || Y(e.beforeInsert) || Y(e.afterRemove) || Y(e.beforeRemove) || Y(e.beforeUpdate) || Y(e.afterUpdate)
    ? (async function (e, t, n, r, o) {
        !o && e.beforeUpdate && (await Me(e.beforeUpdate, e, t));
        await gn(e, t, r, o);
        const s = await cn(e, n, r, o);
        !o && e.afterUpdate && (await Me(e.afterUpdate, e, s));
        return s;
      })(e, t, n, r, o)
    : (function (e, t, n, r, o) {
        !o && e.beforeUpdate && Me(e.beforeUpdate, e, t);
        gn(e, t, r, o);
        const s = cn(e, n, r, o);
        !o && e.afterUpdate && Me(e.afterUpdate, e, s);
        return s;
      })(e, t, n, r, o);
}
function Vn(e, t, n, r, o, s) {
  return Y(e.afterInsert) || Y(e.beforeInsert) || Y(e.afterRemove) || Y(e.beforeRemove) || Y(e.beforeUpdate) || Y(e.afterUpdate) || Y(e.beforeUpdateMultiple) || Y(e.afterUpdateMultiple) || Y(e.beforeRemoveMultiple) || Y(e.afterRemoveMultiple) || Y(e.beforeInsertMultiple) || Y(e.afterInsertMultiple)
    ? (async function (e, t, n, r, o, s) {
        s || (await ke(e.beforeUpdateMultiple, e, t));
        const i = n.length;
        for (let t = 0; t < i; t++) {
          const r = e.validateSchema(n[t], e.schema);
          if (r) throw ee('SCHEMA_VALIDATION_FAILURE', r);
        }
        await bn(e, t, r, o, s);
        const a = await mn(e, n, r, o, s);
        s || (await ke(e.afterUpdateMultiple, e, a));
        return a;
      })(e, t, n, r, o, s)
    : (function (e, t, n, r, o, s) {
        s || ke(e.beforeUpdateMultiple, e, t);
        const i = n.length;
        for (let t = 0; t < i; t++) {
          const r = e.validateSchema(n[t], e.schema);
          if (r) throw ee('SCHEMA_VALIDATION_FAILURE', r);
        }
        bn(e, t, r, o, s);
        const a = mn(e, n, r, o, s);
        s || ke(e.afterUpdateMultiple, e, a);
        return a;
      })(e, t, n, r, o, s);
}
class Fn {
  db;
  proxy = null;
  config;
  abortController = null;
  lastInteractionParams = null;
  chatModel = null;
  conversationID;
  messages = [];
  events;
  initPromise;
  state = [];
  constructor(e, t) {
    (this.db = e), (this.config = t), this.init(), (this.messages = t.initialMessages || []), (this.events = t.events || {}), (this.conversationID = t.conversationID || this.generateRandomID());
  }
  async ask(e) {
    await this.initPromise;
    let t = '';
    for await (const n of await this.askStream(e)) t += n;
    return t;
  }
  async askStream(e) {
    return await this.initPromise, this.fetchAnswer(e);
  }
  abortAnswer() {
    this.abortController?.abort(), (this.state[this.state.length - 1].aborted = !0), this.triggerStateChange();
  }
  getMessages() {
    return this.messages;
  }
  clearSession() {
    (this.messages = []), (this.state = []);
  }
  regenerateLast({ stream: e = !0 }) {
    if (0 === this.state.length || 0 === this.messages.length) throw new Error('No messages to regenerate');
    if (!('assistant' === this.messages.at(-1)?.role)) throw ee('ANSWER_SESSION_LAST_MESSAGE_IS_NOT_ASSISTANT');
    return this.messages.pop(), this.state.pop(), e ? this.askStream(this.lastInteractionParams) : this.ask(this.lastInteractionParams);
  }
  async *fetchAnswer(e) {
    if (!this.chatModel) throw ee('PLUGIN_SECURE_PROXY_MISSING_CHAT_MODEL');
    (this.abortController = new AbortController()), (this.lastInteractionParams = e);
    const t = this.generateRandomID();
    this.messages.push({ role: 'user', content: e.term ?? '' }), this.state.push({ interactionId: t, aborted: !1, loading: !0, query: e.term ?? '', response: '', sources: null, translatedQuery: null, error: !1, errorMessage: null });
    const n = this.state.length - 1;
    this.addEmptyAssistantMessage(), this.triggerStateChange();
    try {
      const t = await Un(this.db, e);
      (this.state[n].sources = t), this.triggerStateChange();
      for await (const e of this.proxy.chatStream({ model: this.chatModel, messages: this.messages })) yield e, (this.state[n].response += e), (this.messages.findLast((e) => 'assistant' === e.role).content += e), this.triggerStateChange();
    } catch (e) {
      'AbortError' === e.name ? (this.state[n].aborted = !0) : ((this.state[n].error = !0), (this.state[n].errorMessage = e.toString())), this.triggerStateChange();
    }
    return (this.state[n].loading = !1), this.triggerStateChange(), this.state[n].response;
  }
  generateRandomID(e = 24) {
    return Array.from({ length: e }, () => Math.floor(36 * Math.random()).toString(36)).join('');
  }
  triggerStateChange() {
    this.events.onStateChange && this.events.onStateChange(this.state);
  }
  async init() {
    const e = this;
    const t = await (async function () {
      return await e.db.plugins.find((e) => 'orama-secure-proxy' === e.name);
    })();
    if (!t) throw ee('PLUGIN_SECURE_PROXY_NOT_FOUND');
    const n = t.extra;
    if (((this.proxy = n.proxy), this.config.systemPrompt && this.messages.push({ role: 'system', content: this.config.systemPrompt }), !n?.pluginParams?.chat?.model)) throw ee('PLUGIN_SECURE_PROXY_MISSING_CHAT_MODEL');
    this.chatModel = n.pluginParams.chat.model;
  }
  addEmptyAssistantMessage() {
    this.messages.push({ role: 'assistant', content: '' });
  }
}
var jn = Object.freeze({
  __proto__: null,
  boundedLevenshtein: function (e, t, n) {
    const r = Be(e, t, n);
    return { distance: r, isBounded: r >= 0 };
  },
  formatBytes: function (e, t = 2) {
    if (0 === e) return '0 Bytes';
    const n = t < 0 ? 0 : t,
      r = Math.floor(Math.log(e) / Math.log(1024));
    return `${parseFloat((e / Math.pow(1024, r)).toFixed(n))} ${['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][r]}`;
  },
  formatNanoseconds: U,
  getNanosecondsTime: z,
  uniqueId: L,
  convertDistanceToMeters: G,
  safeArrayPush: R,
  setIntersection: K,
  setUnion: X,
  normalizeToken: $t,
});
export { Fn as AnswerSession, Qt as MODE_FULLTEXT_SEARCH, en as MODE_HYBRID_SEARCH, tn as MODE_VECTOR_SEARCH, Zt as components, Xt as count, Kt as create, qt as getByID, cn as insert, dn as insertMultiple, jn as internals, nn as kInsertions, rn as kRemovals, Ln as load, gn as remove, bn as removeMultiple, Bn as save, Un as search, Mn as searchVector, Wn as update, Vn as updateMultiple };
export default null;
//# sourceMappingURL=/sm/d5ad3da7ec43374ab3f80adc1e4c547b8e97db446bb9b2d330c1bc3b70d50c00.map
