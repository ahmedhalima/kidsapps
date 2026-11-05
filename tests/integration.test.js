'use strict';
// End-to-end: the REAL front-end scripts (public/js) running against the REAL server code + SQLite database.
// A fake browser (tests/harness.js) provides fetch/localStorage/location. Run: node --test tests/integration.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { makeContext, load, vm } = require('./harness');
const { getConfig } = require('../server/config');
const { createDb } = require('../server/db');
const { createApp } = require('../server/app');

const pub = path.join(__dirname, '..', 'public');
const files = [...fs.readFileSync(path.join(pub, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const scripts = files.map((f) => [f, fs.readFileSync(path.join(pub, f), 'utf8')]);
const config = { ...getConfig({ DB_DRIVER: 'sqlite', QUIET: 'true', RATE_LIMIT_FACTOR: '1000' }), quiet: true };
let server, base, db, app;

test.before(async () => {
  db = await createDb(config.db); app = createApp({ db, config });
  server = http.createServer(app.handler); await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { server.close(); app.close(); await db.close(); });

const mem = () => { const store = {}; return new Proxy(store, { get: (t, k) => (k === 'getItem' ? (x) => (x in t ? t[x] : null) : k === 'setItem' ? (x, v) => { t[x] = String(v); } : k === 'removeItem' ? (x) => { delete t[x]; } : k === 'clear' ? () => { for (const x of Object.keys(t)) delete t[x]; } : t[k]) }); };
async function api(sid, method, p, body) {
  const r = await fetch(base + p, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', ...(sid ? { Cookie: 'sid=' + sid } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const sc = r.headers.get('set-cookie');
  return { status: r.status, json: await r.json().catch(() => null), sid: sc ? /sid=([^;]*)/.exec(sc)[1] : sid };
}
// boot the real app in a fake browser that is signed in with `sid`
async function boot(sid, opts = {}) {
  const location = { protocol: 'http:', replaced: null, replace(u) { this.replaced = u; } };
  const localStorage = opts.localStorage || mem();
  const fetchImpl = opts.fetch || ((u, o = {}) => fetch(base + u, { ...o, headers: { ...(o.headers || {}), ...(sid ? { Cookie: 'sid=' + sid } : {}) } }));
  const ctx = makeContext({ fetch: fetchImpl, location, localStorage, sessionStorage: mem() });
  load(ctx, scripts);
  const ev = (c) => vm.runInContext(c, ctx);
  for (let i = 0; i < 200 && !(ev('Cloud.child') || location.replaced || ev('Cloud.on') === false && i > 20); i++) await new Promise((r) => setImmediate(r));
  for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  return { ctx, ev, location, localStorage };
}
const html = (ctx) => ctx.__els['#app'].__html;

test('signed-in parent with one child: app loads that child from the server and saves progress to the database', async () => {
  const reg = await api('', 'POST', '/api/auth/register', { email: 'e2e@test.com', name: 'Mama', password: 'Parent1234' });
  const child = (await api(reg.sid, 'POST', '/api/children', { name: 'سلمى', birthDate: '2020-01-01', avatar: '🦄' })).json.child;
  const { ev, ctx } = await boot(reg.sid);
  assert.equal(ev('Cloud.on'), true);
  assert.equal(ev('Cloud.child.name'), 'سلمى');
  assert.equal(ev('PN()'), 'سلمى');
  assert.match(html(ctx), /سلمى/);                       // the home screen shows the child's name
  assert.equal(ev('S.stars'), 0);
  ev('hs()');                                            // the 1-second timer records today's stats
  ev('addStar(7)');                                      // child earns stars...
  ev('S.used=125');
  await ev('Cloud.flush()');                             // ...and they are written to the database
  const saved = await api(reg.sid, 'GET', `/api/children/${child.id}/progress`);
  assert.equal(saved.json.data.stars, 7);
  assert.ok(saved.json.version >= 2);
  const stats = await api(reg.sid, 'GET', `/api/children/${child.id}/stats`);
  assert.deepEqual(stats.json.stats, [{ day: '2026-11-02', minutes: 2, stars: 7 }]); // daily stats for the parent report / admin chart
});

test('two devices: a stale save is merged (nothing lost), not overwritten', async () => {
  const reg = await api('', 'POST', '/api/auth/register', { email: 'two@test.com', name: 'Baba', password: 'Parent1234' });
  const child = (await api(reg.sid, 'POST', '/api/children', { name: 'يوسف' })).json.child;
  const A = await boot(reg.sid);                          // device A is open
  assert.equal(A.ev('Cloud.child.id'), child.id);
  // device B saves more progress meanwhile
  const cur = await api(reg.sid, 'GET', `/api/children/${child.id}/progress`);
  await api(reg.sid, 'PUT', `/api/children/${child.id}/progress`, { version: cur.json.version, data: { ...cur.json.data, stars: 40, rd: { L1: 1, L2: 1 } } });
  // device A (still at the old version) earns a little and saves
  A.ev('addStar(3)'); A.ev("S.rd.L3=1");
  await A.ev('Cloud.flush()');
  const final = (await api(reg.sid, 'GET', `/api/children/${child.id}/progress`)).json.data;
  assert.equal(final.stars, 40);                          // B's stars kept (max of both)
  assert.deepEqual(Object.keys(final.rd).sort(), ['L1', 'L2', 'L3']); // lessons from both devices
  assert.equal(A.ev('S.stars'), 40);                      // device A now shows the merged state
});

test('several children: switching loads each child separately and never mixes their progress', async () => {
  const reg = await api('', 'POST', '/api/auth/register', { email: 'multi@test.com', name: 'Mama', password: 'Parent1234' });
  const c1 = (await api(reg.sid, 'POST', '/api/children', { name: 'أحمد' })).json.child;
  const c2 = (await api(reg.sid, 'POST', '/api/children', { name: 'مريم' })).json.child;
  await api(reg.sid, 'PUT', `/api/children/${c2.id}/progress`, { version: 0, data: { stars: 99, pin: '1234' } });
  const { ev } = await boot(reg.sid);
  // two children -> a "who is playing" picker is shown first; choose Ahmed
  await ev(`Cloud.selectChild(${c1.id})`); ev('Cloud.enter()');
  assert.equal(ev('PN()'), 'أحمد'); assert.equal(ev('S.stars'), 0);
  ev('addStar(5)'); await ev('Cloud.flush()');
  await ev(`Cloud.switchTo('alam_cloud_${c2.id}')`);
  assert.equal(ev('PN()'), 'مريم'); assert.equal(ev('S.stars'), 99);
  assert.deepEqual(ev('PL().map(x=>x.name)'), ['أحمد', 'مريم']);
  assert.equal((await api(reg.sid, 'GET', `/api/children/${c1.id}/progress`)).json.data.stars, 5);
  assert.equal((await api(reg.sid, 'GET', `/api/children/${c2.id}/progress`)).json.data.stars, 99);
});

test('not signed in -> the app sends the user to the login page', async () => {
  const { location, ev } = await boot('');
  assert.equal(location.replaced, 'login.html');
  assert.equal(ev('Cloud.on'), true);
});

test('logout flushes, clears the cached child data on this device and returns to login', async () => {
  const reg = await api('', 'POST', '/api/auth/register', { email: 'bye@test.com', name: 'Mama', password: 'Parent1234' });
  const child = (await api(reg.sid, 'POST', '/api/children', { name: 'عمر' })).json.child;
  const { ev, location, localStorage } = await boot(reg.sid);
  ev('addStar(4)');
  assert.ok(localStorage.getItem('alam_cloud_' + child.id));
  await ev('Cloud.logout()');
  assert.equal(location.replaced, 'login.html');
  assert.equal(localStorage.getItem('alam_cloud_' + child.id), null);
  assert.equal((await api(reg.sid, 'GET', '/api/auth/me')).status, 401);   // session really ended on the server
});

test('no server (static hosting or server down) -> automatic local mode, app still works', async () => {
  const down = await boot('', { fetch: () => Promise.reject(new Error('offline')) });
  assert.equal(down.ev('Cloud.on'), false);
  assert.match(html(down.ctx), /أهلاً يا بطل/);
  const staticHost = await boot('', { fetch: async () => ({ ok: false, status: 404, json: async () => { throw new Error('html'); } }) });
  assert.equal(staticHost.ev('Cloud.on'), false);
  assert.equal(staticHost.location.replaced, null);
  assert.match(html(staticHost.ctx), /أهلاً يا بطل/);
});
