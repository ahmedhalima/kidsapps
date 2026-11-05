'use strict';
const { HttpError, cookie } = require('../lib/http');
const { sha256, newToken, hashPassword, verifyPassword, dummyVerify, passwordProblem } = require('../lib/auth');
const v = require('../lib/validate');

const MIN = 60 * 1000;
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

module.exports = (router, d) => {
  const { db, config, mailer, limiter, audit } = d;

  async function startSession(ctx, userId) {
    const token = newToken(), now = Date.now();
    await db.run('INSERT INTO sessions(id,user_id,created_at,expires_at,elevated_until,ip,user_agent) VALUES(?,?,?,?,?,?,?)',
      [sha256(token), userId, now, now + config.sessionDays * 864e5, 0, ctx.ip, String(ctx.req.headers['user-agent'] || '').slice(0, 250)]);
    return cookie('sid', token, { maxAgeSec: config.sessionDays * 86400, secure: config.cookieSecure });
  }
  const clearCookie = () => cookie('sid', '', { maxAgeSec: 0, secure: config.cookieSecure });
  const limit = (key, max, windowMs) => { const r = limiter.check(key, max * config.rateLimitFactor, windowMs); if (!r.ok) throw new HttpError(429, 'too_many_requests', { retryAfter: r.retryAfter }); };

  router.add('GET', '/api/health', (ctx) => ctx.json(200, { ok: true }));
  router.add('GET', '/api/public-config', async (ctx) => ctx.json(200, { allowRegistration: await d.registrationOpen() }));

  router.add('POST', '/api/auth/register', async (ctx) => {
    limit('reg:' + ctx.ip, 10, 60 * MIN);
    if (!(await d.registrationOpen())) throw new HttpError(403, 'registration_closed');
    const email = v.email(ctx.body.email), name = v.str(ctx.body.name, 'name', { min: 2, max: 100 });
    const problem = passwordProblem(ctx.body.password, email);
    if (problem) throw new HttpError(400, problem);
    if ((await db.query('SELECT id FROM users WHERE email=?', [email])).length) throw new HttpError(409, 'email_taken');
    const now = Date.now();
    const r = await db.run('INSERT INTO users(email,name,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',
      [email, name, await hashPassword(ctx.body.password), 'parent', 'active', now, now]);
    await audit(r.insertId, 'register', email, ctx.ip);
    const setCookie = await startSession(ctx, r.insertId);
    ctx.json(201, { user: { id: r.insertId, email, name, role: 'parent' } }, { 'Set-Cookie': setCookie });
  });

  router.add('POST', '/api/auth/login', async (ctx) => {
    limit('login-ip:' + ctx.ip, 30, 15 * MIN);
    const email = v.email(ctx.body.email), pw = typeof ctx.body.password === 'string' ? ctx.body.password : '';
    const rows = await db.query('SELECT * FROM users WHERE email=?', [email]);
    const u = rows[0];
    if (!u) { await dummyVerify(pw); await audit(null, 'login_fail', email, ctx.ip); throw new HttpError(401, 'invalid_credentials'); }
    const now = Date.now();
    if (u.locked_until > now) throw new HttpError(429, 'account_locked', { retryAfter: Math.ceil((u.locked_until - now) / 1000) });
    if (!(await verifyPassword(pw, u.password_hash))) {
      const n = u.failed_attempts + 1;
      if (n >= 5) { await db.run('UPDATE users SET failed_attempts=0, locked_until=? WHERE id=?', [now + 15 * MIN, u.id]); await audit(u.id, 'account_locked', 'too many failed logins', ctx.ip); }
      else await db.run('UPDATE users SET failed_attempts=? WHERE id=?', [n, u.id]);
      await audit(u.id, 'login_fail', email, ctx.ip);
      throw new HttpError(401, 'invalid_credentials');
    }
    if (u.status !== 'active') throw new HttpError(403, 'account_disabled');
    await db.run('UPDATE users SET failed_attempts=0, locked_until=0, last_login_at=? WHERE id=?', [now, u.id]);
    await audit(u.id, 'login', '', ctx.ip);
    ctx.json(200, { user: publicUser(u) }, { 'Set-Cookie': await startSession(ctx, u.id) });
  });

  router.add('GET', '/api/auth/me', { auth: true }, (ctx) => ctx.json(200, { user: publicUser(ctx.user), elevated: ctx.session.elevated_until > Date.now() }));

  router.add('POST', '/api/auth/logout', async (ctx) => {
    if (ctx.session) await db.run('DELETE FROM sessions WHERE id=?', [ctx.session.sid]);
    ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  });

  router.add('POST', '/api/auth/logout-all', { auth: true }, async (ctx) => {
    await db.run('DELETE FROM sessions WHERE user_id=?', [ctx.user.id]);
    await audit(ctx.user.id, 'logout_all', '', ctx.ip);
    ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  });

  // Re-enter the password to open the parent area / do sensitive actions for 10 minutes
  router.add('POST', '/api/auth/verify', { auth: true }, async (ctx) => {
    limit('verify:' + ctx.user.id, 10, 10 * MIN);
    const rows = await db.query('SELECT password_hash FROM users WHERE id=?', [ctx.user.id]);
    if (!(await verifyPassword(String(ctx.body.password || ''), rows[0].password_hash))) { await audit(ctx.user.id, 'verify_fail', '', ctx.ip); throw new HttpError(401, 'invalid_credentials'); }
    await db.run('UPDATE sessions SET elevated_until=? WHERE id=?', [Date.now() + 10 * MIN, ctx.session.sid]);
    ctx.json(200, { ok: true });
  });
  router.add('POST', '/api/auth/lock', { auth: true }, async (ctx) => { await db.run('UPDATE sessions SET elevated_until=0 WHERE id=?', [ctx.session.sid]); ctx.json(200, { ok: true }); });

  router.add('PATCH', '/api/auth/me', { auth: true }, async (ctx) => {
    const name = v.str(ctx.body.name, 'name', { min: 2, max: 100 });
    await db.run('UPDATE users SET name=?, updated_at=? WHERE id=?', [name, Date.now(), ctx.user.id]);
    ctx.json(200, { user: { ...publicUser(ctx.user), name } });
  });

  router.add('POST', '/api/auth/change-password', { auth: true }, async (ctx) => {
    limit('chpw:' + ctx.user.id, 10, 30 * MIN);
    const rows = await db.query('SELECT password_hash FROM users WHERE id=?', [ctx.user.id]);
    if (!(await verifyPassword(String(ctx.body.current || ''), rows[0].password_hash))) throw new HttpError(401, 'invalid_credentials');
    const problem = passwordProblem(ctx.body.password, ctx.user.email);
    if (problem) throw new HttpError(400, problem);
    await db.run('UPDATE users SET password_hash=?, updated_at=? WHERE id=?', [await hashPassword(ctx.body.password), Date.now(), ctx.user.id]);
    await db.run('DELETE FROM sessions WHERE user_id=? AND id<>?', [ctx.user.id, ctx.session.sid]); // sign out all other devices
    await audit(ctx.user.id, 'password_changed', '', ctx.ip);
    ctx.json(200, { ok: true });
  });

  // ---- password reset ----
  d.createResetToken = async (userId) => {
    const token = newToken(), now = Date.now();
    await db.run('DELETE FROM password_resets WHERE user_id=?', [userId]);
    await db.run('INSERT INTO password_resets(user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)', [userId, sha256(token), now + 60 * MIN, now]);
    return `${config.appUrl}/reset.html?token=${token}`;
  };

  router.add('POST', '/api/auth/forgot', async (ctx) => {
    limit('forgot-ip:' + ctx.ip, 5, 60 * MIN);
    const email = v.email(ctx.body.email);
    const rows = await db.query("SELECT id,name,status FROM users WHERE email=?", [email]);
    if (rows[0] && rows[0].status === 'active') {
      const link = await d.createResetToken(rows[0].id);
      await audit(rows[0].id, 'reset_requested', '', ctx.ip);
      mailer.send({
        to: email, subject: 'إعادة تعيين كلمة المرور - عالم الصغار',
        text: `مرحبًا ${rows[0].name}،\n\nلإعادة تعيين كلمة المرور افتح هذا الرابط (صالح لمدة ساعة واحدة):\n${link}\n\nإذا لم تطلب ذلك فتجاهل هذه الرسالة.`,
      }).catch((e) => console.error('[mail] failed:', e.message));
    }
    ctx.json(200, { ok: true }); // same answer whether or not the e-mail exists
  });

  router.add('POST', '/api/auth/reset', async (ctx) => {
    limit('reset-ip:' + ctx.ip, 10, 60 * MIN);
    const token = v.str(ctx.body.token, 'token', { min: 20, max: 200 });
    const rows = await db.query('SELECT r.id AS rid, r.user_id, r.expires_at, r.used_at, u.email, u.status FROM password_resets r JOIN users u ON u.id=r.user_id WHERE r.token_hash=?', [sha256(token)]);
    const r = rows[0];
    if (!r || r.used_at || r.expires_at < Date.now()) throw new HttpError(400, 'invalid_or_expired_token');
    const problem = passwordProblem(ctx.body.password, r.email);
    if (problem) throw new HttpError(400, problem);
    await db.run('UPDATE users SET password_hash=?, failed_attempts=0, locked_until=0, updated_at=? WHERE id=?', [await hashPassword(ctx.body.password), Date.now(), r.user_id]);
    await db.run('UPDATE password_resets SET used_at=? WHERE id=?', [Date.now(), r.rid]);
    await db.run('DELETE FROM sessions WHERE user_id=?', [r.user_id]);
    await audit(r.user_id, 'password_reset', '', ctx.ip);
    ctx.json(200, { ok: true });
  });
};
