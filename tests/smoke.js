// Loads index.html's scripts in order, renders every screen once and fails on any exception.
//   node tests/smoke.js            -> pass/fail
//   node tests/smoke.js --dump out.json  -> also dump the rendered HTML of every screen (used to compare refactors)
const fs = require('fs'), path = require('path'), { makeContext, load, vm } = require('./harness');
const root = path.join(__dirname, '..', 'public');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const scripts = files.map(f => [f, fs.readFileSync(path.join(root, f), 'utf8')]);
const origIdx = process.argv.indexOf('--orig');
const useScripts = origIdx > 0 ? [['orig', fs.readFileSync(process.argv[origIdx + 1], 'utf8')]] : scripts;
const ctx = makeContext(); load(ctx, useScripts);
const ev = (c) => vm.runInContext(c, ctx);
const SCREENS = [['home'], ['sub', 'ar'], ['learn', 'ar'], ['learn', 'wd'], ['play', 'ar'], ['play', 'math'], ['play', 'num'], ['play', 'wd'], ['play', 'sen'], ['color'], ['mem'], ['habits'], ['hab', 0], ['chk'], ['fun'], ['bub'], ['odd'], ['snd'], ['ordg'], ['shd'], ['fl'], ['mole'], ['colg'], ['more'], ['prt'], ['rew'], ['read'], ['read2'], ['lesson', 3], ['stage', 2], ['story', 0], ['story', 9], ['nums'], ['numLearn', 1], ['numLearn', 51], ['calc'], ['puz'], ['riddle'], ['oddout'], ['pattern'], ['vanish'], ['simon'], ['diy'], ['paint'], ['chara'], ['sentm'], ['wordb'], ['anl'], ['code'], ['codeLv', 0], ['codeLv', 5], ['hub'], ['clock'], ['setClock'], ['money'], ['shop'], ['science'], ['shapes'], ['duas'], ['sura', 0, 1], ['sura', 2, 3], ['english'], ['engT', 0], ['engT', 6], ['istories'], ['ist', 0, 'a'], ['ist', 2, 'b'], ['pet'], ['certs'], ['maze'], ['jig'], ['race'], ['trace'], ['trace1', 'أ'], ['profiles'], ['goalBar'], ['goalLocked'], ['feel'], ['safe'], ['tasks'], ['calm'], ['sortg'], ['dots'], ['ach'], ['dq'], ['cbn'], ['bub2'], ['sentOrd'], ['forms'], ['parentPage'], ['exitPar'], ['horder'], ['vopts']];
const out = {}; let fails = 0;
const run = (label, fn) => { ctx.__reseed(); try { fn(); const g = k => (ctx.__els[k] ? ctx.__els[k].__html : ''); out[label] = ['#app', '#ov', '#par'].map(g).join('\u0001'); } catch (e) { fails++; console.log('FAIL', label, e.message); } };
for (const [n, ...a] of SCREENS) run(n + ' ' + a.join(','), () => ev('(' + n + ')')(...a));
const host = () => { const o = { html: '', set innerHTML(v) { this.html = v; }, get innerHTML() { return this.html; }, querySelectorAll: () => [] }; return o; };
for (const k of ['rp', 'tm', 'vc', 'rc', 'kd', 'hm', 'tk', 'ms', 'ct', 'bk', 'sc']) run('PG.' + k, () => { const h = host(); ev('PG')[k](h); ctx.__els['#app'].html = h.html; });
for (const t of ['ar', 'en', 'num', 'math', 'sub', 'n100', 'mul', 'words', 'en2', 'match', 'count', 'pat', 'color', 'week', 'cards', 'story']) run('sheet2 ' + t, () => ev('sheet2')(t));
for (const g of ['ba', 'bg', 'sk', 'pv', 'hr']) run('numGame ' + g, () => ev('numGame')(g));
const di = process.argv.indexOf('--dump'); if (di > 0) fs.writeFileSync(process.argv[di + 1], JSON.stringify(out));
console.log(fails ? fails + ' failures' : 'OK - ' + Object.keys(out).length + ' screens rendered without errors (' + (origIdx > 0 ? 'single-file' : files.length + ' script files') + ')');
process.exit(fails ? 1 : 0);
