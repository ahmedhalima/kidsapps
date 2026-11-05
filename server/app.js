'use strict';
const { Router, HttpError, parseCookies, readBody, sendJson, serveStatic, SECURITY_HEADERS } = require('./lib/http');
const { Limiter, sha256 } = require('./lib/auth');
const { createMailer } = require('./lib/mailer');

// Builds the request handler. `db` is any adapter with query/run/exec (MySQL in production, SQLite in tests).
function createApp({ db, config, mailer = createMailer(config) }) {
  const limiter = new Limiter();
  const sweep = setInterval(() => limiter.sweep(), 10 * 60 * 1000); sweep.unref();
  const purge = setInterval(() => db.run('DELETE FROM sessions WHERE expires_at<?', [Date.now()]).catch(() => {}), 60 * 60 * 1000); purge.unref();

  const deps = {
    db, config, mailer, limiter,
    audit: async (userId, action, detail, ip) => { try { await db.run('INSERT INTO audit_log(user_id,action,detail,ip,created_at) VALUES(?,?,?,?,?)', [userId, action, String(detail || '').slice(0, 480), ip || '', Date.now()]); } catch (e) { /* never break a request because of logging */ } },
    registrationOpen: async () => { const r = await db.query('SELECT v FROM settings WHERE k=?', ['allow_registration']); return r.length ? r[0].v === '1' : config.allowRegistration; },
  };
  const router = new Router();
  require('./routes/auth')(router, deps);
  require('./routes/children')(router, deps);
  require('./routes/admin')(router, deps);

  async function loadSession(req) {
    const token = parseCookies(req.headers.cookie).sid;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const rows = await db.query('SELECT s.id AS sid, s.expires_at, s.elevated_until, u.id AS uid, u.email, u.name, u.role, u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?', [sha256(token)]);
    const r = rows[0];
    if (!r || r.expires_at < Date.now() || r.status !== 'active') return null;
    return { session: { sid: r.sid, elevated_until: Number(r.elevated_until) }, user: { id: r.uid, email: r.email, name: r.name, role: r.role } };
  }

  async function handleApi(req, res, url) {
    const ip = req.socket.remoteAddress || '';
    const m = router.match(req.method, url.pathname);
    if (!m.route) throw new HttpError(m.pathMatched ? 405 : 404, m.pathMatched ? 'method_not_allowed' : 'not_found');
    // CSRF defence in depth (cookies are SameSite=Strict as well): state-changing calls need our custom header and a same-origin Origin
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['x-requested-with'] !== 'fetch') throw new HttpError(403, 'csrf_header_missing');
      if (req.headers.origin) { let ok = false; try { ok = new URL(req.headers.origin).host === req.headers.host; } catch { /* bad origin */ } if (!ok) throw new HttpError(403, 'bad_origin'); }
    }
    const ctx = { req, res, ip, params: m.params, query: Object.fromEntries(url.searchParams), body: {}, user: null, session: null, json: (s, o, h) => sendJson(res, s, o, h) };
    const s = await loadSession(req);
    if (s) { ctx.user = s.user; ctx.session = s.session; }
    const o = m.route.opts;
    if (o.auth && !ctx.user) throw new HttpError(401, 'not_authenticated');
    if (o.role && ctx.user.role !== o.role) throw new HttpError(403, 'forbidden');
    if (o.elevated && ctx.session.elevated_until < Date.now()) throw new HttpError(403, 'password_required');
    if (req.method !== 'GET' && req.method !== 'HEAD') ctx.body = await readBody(req);
    await m.route.handler(ctx);
  }

  async function handler(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'method_not_allowed');
      if (!serveStatic(config.publicDir, url.pathname, res)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS }); res.end('Not found'); }
    } catch (e) {
      if (res.headersSent) return res.end();
      if (e instanceof HttpError) return sendJson(res, e.status, { error: e.message, ...(e.extra || {}) });
      if (!config.quiet) console.error('[error]', e);
      sendJson(res, 500, { error: 'server_error' });
    }
  }
  return { handler, deps, mailer, close() { clearInterval(sweep); clearInterval(purge); } };
}
module.exports = { createApp };
