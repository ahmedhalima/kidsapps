'use strict';
// API tests. They run the real server code against an in-memory SQLite database (no MySQL needed).
//   node --test tests/server.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { getConfig } = require('../server/config');
const { createDb } = require('../server/db');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/lib/auth');

let server, base, db, app;
const config = { ...getConfig({ DB_DRIVER: 'sqlite', QUIET: 'true', RATE_LIMIT_FACTOR: '1000' }), quiet: true };

test.before(async () => {
  db = await createDb(config.db);
  app = createApp({ db, config });
  server = http.createServer(app.handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  const now = Date.now();
  await db.run('INSERT INTO users(email,name,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', ['admin@test.com', 'Admin', await hashPassword('Admin1234'), 'admin', 'active', now, now]);
});
test.after(async () => { server.close(); app.close(); await db.close(); });

// tiny client with a cookie jar
function client() {
  let sid = '';
  const call = async (method, path, body, headers = {}) => {
    const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', ...(sid ? { Cookie: 'sid=' + sid } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = res.headers.get('set-cookie');
    if (sc) { const m = /sid=([^;]*)/.exec(sc); sid = m ? m[1] : sid; }
    let json = null; try { json = await res.json(); } catch { /* not json */ }
    return { status: res.status, json, headers: res.headers };
  };
  return { call, get sid() { return sid; }, set sid(v) { sid = v; } };
}
const newParent = async (email, pw = 'Parent1234') => { const c = client(); const r = await c.call('POST', '/api/auth/register', { email, name: 'Parent ' + email, password: pw }); assert.equal(r.status, 201); return c; };
const admin = async () => { const c = client(); const r = await c.call('POST', '/api/auth/login', { email: 'admin@test.com', password: 'Admin1234' }); assert.equal(r.status, 200); return c; };

test('register, me, weak password and duplicate email', async () => {
  const c = client();
  assert.equal((await c.call('POST', '/api/auth/register', { email: 'a@test.com', name: 'Ahmed', password: '123' })).status, 400);
  assert.equal((await c.call('POST', '/api/auth/register', { email: 'a@test.com', name: 'Ahmed', password: 'password' })).json.error, 'password_too_common');
  const r = await c.call('POST', '/api/auth/register', { email: 'A@Test.com', name: 'Ahmed', password: 'Secret123' });
  assert.equal(r.status, 201);
  assert.equal(r.json.user.email, 'a@test.com');
  assert.equal((await c.call('GET', '/api/auth/me')).json.user.role, 'parent');
  assert.equal((await client().call('POST', '/api/auth/register', { email: 'a@test.com', name: 'Xy', password: 'Secret123' })).json.error, 'email_taken');
  assert.equal((await client().call('GET', '/api/auth/me')).status, 401);
});

test('passwords are stored hashed (scrypt), never in clear text', async () => {
  const row = (await db.query('SELECT password_hash FROM users WHERE email=?', ['a@test.com']))[0];
  assert.match(row.password_hash, /^scrypt\$16384\$8\$1\$/);
  assert.ok(!row.password_hash.includes('Secret123'));
});

test('login failures are generic; 5 failures lock the account; admin can unlock', async () => {
  await newParent('lock@test.com');
  const c = client();
  assert.equal((await c.call('POST', '/api/auth/login', { email: 'nobody@test.com', password: 'Whatever123' })).json.error, 'invalid_credentials');
  for (let i = 0; i < 5; i++) assert.equal((await c.call('POST', '/api/auth/login', { email: 'lock@test.com', password: 'Wrong12345' })).status, 401);
  const locked = await c.call('POST', '/api/auth/login', { email: 'lock@test.com', password: 'Parent1234' });
  assert.equal(locked.status, 429);
  assert.equal(locked.json.error, 'account_locked');
  const a = await admin();
  const id = (await db.query('SELECT id FROM users WHERE email=?', ['lock@test.com']))[0].id;
  assert.equal((await a.call('POST', `/api/admin/users/${id}/unlock`)).status, 200);
  assert.equal((await c.call('POST', '/api/auth/login', { email: 'lock@test.com', password: 'Parent1234' })).status, 200);
});

test('CSRF: state-changing calls need the custom header and a same-origin Origin', async () => {
  const r = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@test.com', password: 'Secret123' }) });
  assert.equal(r.status, 403);
  const r2 = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', Origin: 'http://evil.example' }, body: '{}' });
  assert.equal(r2.status, 403);
});

test('forgot / reset password flow', async () => {
  const c = await newParent('reset@test.com', 'OldPass123');
  const other = client(); other.sid = c.sid; // a second signed-in device
  assert.equal((await client().call('POST', '/api/auth/forgot', { email: 'ghost@test.com' })).status, 200); // no user enumeration
  app.mailer.outbox.length = 0;
  assert.equal((await client().call('POST', '/api/auth/forgot', { email: 'reset@test.com' })).status, 200);
  const mail = app.mailer.outbox.at(-1);
  assert.equal(mail.to, 'reset@test.com');
  const token = /token=([a-f0-9]{64})/.exec(mail.text)[1];
  assert.equal((await client().call('POST', '/api/auth/reset', { token, password: 'short' })).status, 400);
  assert.equal((await client().call('POST', '/api/auth/reset', { token: 'f'.repeat(64), password: 'NewPass123' })).json.error, 'invalid_or_expired_token');
  assert.equal((await client().call('POST', '/api/auth/reset', { token, password: 'NewPass123' })).status, 200);
  assert.equal((await client().call('POST', '/api/auth/reset', { token, password: 'Another123' })).status, 400); // single use
  assert.equal((await other.call('GET', '/api/auth/me')).status, 401); // old sessions are gone
  assert.equal((await client().call('POST', '/api/auth/login', { email: 'reset@test.com', password: 'OldPass123' })).status, 401);
  assert.equal((await client().call('POST', '/api/auth/login', { email: 'reset@test.com', password: 'NewPass123' })).status, 200);
  const raw = (await db.query('SELECT token_hash FROM password_resets'))[0];
  assert.ok(!raw || raw.token_hash !== token); // only a hash is stored
});

test('expired reset token is refused', async () => {
  await newParent('exp@test.com');
  const id = (await db.query('SELECT id FROM users WHERE email=?', ['exp@test.com']))[0].id;
  const link = await app.deps.createResetToken(id);
  await db.run('UPDATE password_resets SET expires_at=?', [Date.now() - 1000]);
  const token = /token=([a-f0-9]{64})/.exec(link)[1];
  assert.equal((await client().call('POST', '/api/auth/reset', { token, password: 'NewPass123' })).json.error, 'invalid_or_expired_token');
});

test('change password signs out the other devices', async () => {
  const c = await newParent('chg@test.com', 'Start1234');
  const d2 = client(); await d2.call('POST', '/api/auth/login', { email: 'chg@test.com', password: 'Start1234' });
  assert.equal((await c.call('POST', '/api/auth/change-password', { current: 'bad', password: 'Next12345' })).status, 401);
  assert.equal((await c.call('POST', '/api/auth/change-password', { current: 'Start1234', password: 'Next12345' })).status, 200);
  assert.equal((await d2.call('GET', '/api/auth/me')).status, 401);
  assert.equal((await c.call('GET', '/api/auth/me')).status, 200);
});

test('children: CRUD, validation, isolation between parents, delete needs password re-entry', async () => {
  const p1 = await newParent('p1@test.com'), p2 = await newParent('p2@test.com');
  assert.equal((await p1.call('POST', '/api/children', { name: '' })).status, 400);
  assert.equal((await p1.call('POST', '/api/children', { name: 'Omar', birthDate: '2999-01-01' })).json.error, 'date_invalid');
  const created = await p1.call('POST', '/api/children', { name: 'عمر', birthDate: '2020-05-17', avatar: '🦁', notes: 'يحب الحيوانات' });
  assert.equal(created.status, 201);
  const id = created.json.child.id;
  assert.equal(created.json.child.name, 'عمر');
  assert.equal((await p1.call('GET', '/api/children')).json.children.length, 1);
  assert.equal((await p1.call('PATCH', `/api/children/${id}`, { name: 'عمرو' })).json.child.name, 'عمرو');
  // another parent cannot see or touch it
  assert.equal((await p2.call('GET', `/api/children/${id}`)).status, 404);
  assert.equal((await p2.call('PATCH', `/api/children/${id}`, { name: 'x' })).status, 404);
  assert.equal((await p2.call('PUT', `/api/children/${id}/progress`, { data: { stars: 999 }, version: 0 })).status, 404);
  assert.equal((await p2.call('GET', '/api/children')).json.children.length, 0);
  // deleting needs a recent password check
  assert.equal((await p1.call('DELETE', `/api/children/${id}`)).json.error, 'password_required');
  assert.equal((await p1.call('POST', '/api/auth/verify', { password: 'wrong' })).status, 401);
  assert.equal((await p1.call('POST', '/api/auth/verify', { password: 'Parent1234' })).status, 200);
  assert.equal((await p1.call('DELETE', `/api/children/${id}`)).status, 200);
  assert.equal((await p1.call('GET', '/api/children')).json.children.length, 0);
  assert.equal((await p1.call('POST', '/api/auth/lock')).status, 200);
});

test('progress: versioned saves, conflict returns the server copy, stats stored', async () => {
  const p = await newParent('prog@test.com');
  const id = (await p.call('POST', '/api/children', { name: 'Sara' })).json.child.id;
  assert.deepEqual((await p.call('GET', `/api/children/${id}/progress`)).json, { data: null, version: 0 });
  const r1 = await p.call('PUT', `/api/children/${id}/progress`, { version: 0, data: { stars: 10, rd: { L1: 1 } }, stats: { day: '2026-11-02', minutes: 12, stars: 10 } });
  assert.equal(r1.json.version, 1);
  const r2 = await p.call('PUT', `/api/children/${id}/progress`, { version: 1, data: { stars: 25 } });
  assert.equal(r2.json.version, 2);
  const stale = await p.call('PUT', `/api/children/${id}/progress`, { version: 1, data: { stars: 5 } });
  assert.equal(stale.status, 409);
  assert.equal(stale.json.version, 2);
  assert.equal(stale.json.data.stars, 25); // nothing was overwritten
  assert.equal((await p.call('PUT', `/api/children/${id}/progress`, { version: 1, force: true, data: { stars: 30 } })).json.version, 3);
  assert.equal((await p.call('PUT', `/api/children/${id}/progress`, { data: [1] })).status, 400);
  const got = await p.call('GET', `/api/children/${id}/progress`);
  assert.equal(got.json.data.stars, 30);
  assert.equal((await p.call('GET', '/api/children')).json.children[0].stars, 30);
  const st = await p.call('GET', `/api/children/${id}/stats?days=3650`);
  assert.deepEqual(st.json.stats, [{ day: '2026-11-02', minutes: 12, stars: 10 }]);
});

test('admin API: only admins, overview, user management and safety rules', async () => {
  const p = await newParent('victim@test.com');
  assert.equal((await p.call('GET', '/api/admin/overview')).status, 403);
  assert.equal((await client().call('GET', '/api/admin/overview')).status, 401);
  const a = await admin();
  const ov = await a.call('GET', '/api/admin/overview');
  assert.equal(ov.status, 200);
  assert.ok(ov.json.users >= 2 && ov.json.admins === 1);
  const list = await a.call('GET', '/api/admin/users?q=victim');
  assert.equal(list.json.users.length, 1);
  const uid = list.json.users[0].id;
  assert.equal((await a.call('GET', '/api/admin/users?q=%25')).json.users.length, 0); // wildcard is escaped, not a match-all
  // disabling kills the session and blocks login
  assert.equal((await a.call('PATCH', `/api/admin/users/${uid}`, { status: 'disabled' })).status, 200);
  assert.equal((await p.call('GET', '/api/auth/me')).status, 401);
  assert.equal((await client().call('POST', '/api/auth/login', { email: 'victim@test.com', password: 'Parent1234' })).json.error, 'account_disabled');
  await a.call('PATCH', `/api/admin/users/${uid}`, { status: 'active' });
  // admin reset link works
  const link = (await a.call('POST', `/api/admin/users/${uid}/reset-link`)).json.link;
  const token = /token=([a-f0-9]{64})/.exec(link)[1];
  assert.equal((await client().call('POST', '/api/auth/reset', { token, password: 'Fresh12345' })).status, 200);
  // cannot demote / disable / delete yourself or the last admin
  const meId = (await a.call('GET', '/api/auth/me')).json.user.id;
  assert.equal((await a.call('PATCH', `/api/admin/users/${meId}`, { role: 'parent' })).json.error, 'cannot_remove_last_admin');
  assert.equal((await a.call('PATCH', `/api/admin/users/${meId}`, { status: 'disabled' })).json.error, 'cannot_remove_last_admin');
  assert.equal((await a.call('DELETE', `/api/admin/users/${meId}`)).json.error, 'cannot_delete_self');
  // audit log records what happened
  const audit = await a.call('GET', '/api/admin/audit?limit=200');
  assert.ok(audit.json.events.some((e) => e.action === 'admin_reset_link'));
  assert.ok(audit.json.events.some((e) => e.action === 'login_fail'));
  // children listing + detail never expose the child's PIN
  assert.equal((await p.call('POST', '/api/auth/login', { email: 'victim@test.com', password: 'Fresh12345' })).status, 200);
  const kid = await p.call('POST', '/api/children', { name: 'Layla' });
  await p.call('PUT', `/api/children/${kid.json.child.id}/progress`, { version: 0, data: { stars: 7, pin: '4321' } });
  const detail = await a.call('GET', `/api/admin/children/${kid.json.child.id}`);
  assert.equal(detail.json.progress.stars, 7);
  assert.ok(!JSON.stringify(detail.json).includes('4321'));
  assert.ok((await a.call('GET', '/api/admin/children?q=Layla')).json.children.length >= 1);
});

test('admin can close registration; deleting a user removes their data', async () => {
  const a = await admin();
  await a.call('PUT', '/api/admin/settings', { allowRegistration: false });
  assert.equal((await client().call('POST', '/api/auth/register', { email: 'late@test.com', name: 'Late', password: 'Secret123' })).json.error, 'registration_closed');
  assert.equal((await client().call('GET', '/api/public-config')).json.allowRegistration, false);
  await a.call('PUT', '/api/admin/settings', { allowRegistration: true });
  const p = await newParent('gone@test.com');
  const cid = (await p.call('POST', '/api/children', { name: 'Tmp' })).json.child.id;
  await p.call('PUT', `/api/children/${cid}/progress`, { version: 0, data: { stars: 1 } });
  const uid = (await db.query('SELECT id FROM users WHERE email=?', ['gone@test.com']))[0].id;
  assert.equal((await a.call('DELETE', `/api/admin/users/${uid}`)).status, 200);
  assert.equal((await db.query('SELECT COUNT(*) AS n FROM children WHERE id=?', [cid]))[0].n, 0);
  assert.equal((await db.query('SELECT COUNT(*) AS n FROM child_progress WHERE child_id=?', [cid]))[0].n, 0);
});

test('static files: security headers; secrets and server code are never served', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.match(await r.text(), /عالم الصغار/);
  for (const p of ['/.env', '/../server/config.js', '/%2e%2e/server/config.js', '/server/config.js', '/..%2fpackage.json', '/js/../../package.json']) {
    const x = await fetch(base + p); assert.equal(x.status, 404, p);
  }
  assert.equal((await fetch(base + '/js/core/state.js')).status, 200);
});

test('rate limiting: too many password-reset requests from one address are refused', async () => {
  const strict = { ...config, rateLimitFactor: 1 };
  const db2 = await createDb(strict.db), app2 = createApp({ db: db2, config: strict });
  const srv = http.createServer(app2.handler); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${srv.address().port}/api/auth/forgot`;
  const post = () => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: JSON.stringify({ email: 'x@test.com' }) });
  for (let i = 0; i < 5; i++) assert.equal((await post()).status, 200);
  const blocked = await post();
  assert.equal(blocked.status, 429);
  assert.ok((await blocked.json()).retryAfter > 0);
  srv.close(); app2.close(); await db2.close();
});
