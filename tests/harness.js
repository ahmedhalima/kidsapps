// Minimal fake browser so the app's scripts can be loaded and every screen rendered in Node (no dependencies).
const vm = require('vm');
function makeContext(extra = {}) {
  let seed = 12345;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const M = Object.create(Math); M.random = rnd;
  class FixedDate extends Date {
    constructor(...a) { a.length ? super(...a) : super('2026-11-02T10:00:00Z'); }
    static now() { return new Date('2026-11-02T10:00:00Z').getTime(); }
  }
  const els = {};
  const generic = () => new Proxy(function () {}, {
    get: (t, k) => {
      if (k === 'querySelectorAll') return () => [];
      if (k === 'classList') return { add() {}, remove() {}, contains: () => false };
      if (k === 'dataset') return {};
      if (k === Symbol.toPrimitive) return () => '';
      if (k === 'length') return 0;
      if (k === 'value') return '5';
      if (k === 'isConnected') return true;
      return generic();
    },
    set: () => true, apply: () => generic(),
  });
  const rec = () => { const o = { html: '' };
    return new Proxy(o, {
      get: (t, k) => {
        if (k === 'innerHTML') return t.html;
        if (k === 'insertAdjacentHTML') return (_p, h) => { t.html += h; };
        if (k === 'querySelectorAll') return () => [];
        if (k === 'querySelector') return () => generic();
        if (k === 'classList') return { add() {}, remove() {}, contains: () => false };
        if (k === 'dataset' || k === 'style') return {};
        if (k === '__html') return t.html;
        return generic();
      },
      set: (t, k, v) => { if (k === 'innerHTML') t.html = String(v); return true; },
    });
  };
  const doc = {
    body: { classList: { add() {}, remove() {} } }, hidden: false,
    querySelector: (s) => (els[s] = els[s] || (/^#(app|ov|par)$/.test(s) ? rec() : generic())),
    createElement: () => generic(), createTextNode: () => generic(), execCommand: () => true, addEventListener() {},
  };
  const ctx = {
    console, setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, Math: M, Date: FixedDate, JSON, Object, Array, String, Number, Set, Promise,
    encodeURIComponent, decodeURIComponent, btoa, atob, escape, unescape, document: doc, navigator: {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    speechSynthesis: { getVoices: () => [], cancel() {}, speak() {} }, SpeechSynthesisUtterance: function () {},
    XMLSerializer: function () {}, Image: function () {},
    __reseed() { seed = 12345; }, __els: els, addEventListener() {}, sessionStorage: { getItem: () => null, setItem() {}, clear() {} },
    ...extra,
  };
  ctx.window = ctx; vm.createContext(ctx);
  return ctx;
}
function load(ctx, scripts) { for (const [name, code] of scripts) { try { vm.runInContext(code, ctx, { filename: name }); } catch (e) { throw new Error('Error while loading ' + name + ': ' + e.message); } } }
module.exports = { makeContext, load, vm };
