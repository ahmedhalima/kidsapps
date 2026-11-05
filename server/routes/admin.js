'use strict';
const { HttpError } = require('../lib/http');
const { hashPassword, passwordProblem } = require('../lib/auth');
const v = require('../lib/validate');

const like = (q) => '%' + String(q || '').replace(/[%_!]/g, (m) => '!' + m) + '%'; // escape char is '!' (same meaning in MySQL and SQLite)
const N = (x) => Number(x || 0);

module.exports = (router, d) => {
  const { db, audit } = d;
  const A = { auth: true, role: 'admin' };

  async function activeAdmins() { return N((await db.query("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND status='active'"))[0].n); }
  async function target(rawId) {
    const rows = await db.query('SELECT * FROM users WHERE id=?', [v.id(rawId)]);
    if (!rows[0]) throw new HttpError(404, 'user_not_found');
    return rows[0];
  }

  router.add('GET', '/api/admin/overview', A, async (ctx) => {
    const one = async (sql, p = []) => N((await db.query(sql, p))[0].n);
    const week = Date.now() - 7 * 864e5, since = new Date(Date.now() - 13 * 864e5).toISOString().slice(0, 10);
    const daily = await db.query('SELECT stat_day, SUM(minutes) AS minutes, SUM(stars) AS stars, COUNT(*) AS kids FROM daily_stats WHERE stat_day>=? GROUP BY stat_day ORDER BY stat_day', [since]);
    ctx.json(200, {
      users: await one('SELECT COUNT(*) AS n FROM users'),
      activeUsers: await one("SELECT COUNT(*) AS n FROM users WHERE status='active'"),
      disabledUsers: await one("SELECT COUNT(*) AS n FROM users WHERE status<>'active'"),
      admins: await one("SELECT COUNT(*) AS n FROM users WHERE role='admin'"),
      newUsers7d: await one('SELECT COUNT(*) AS n FROM users WHERE created_at>?', [week]),
      loggedIn7d: await one('SELECT COUNT(*) AS n FROM users WHERE last_login_at>?', [week]),
      children: await one('SELECT COUNT(*) AS n FROM children WHERE deleted_at IS NULL'),
      totalStars: await one('SELECT COALESCE(SUM(stars),0) AS n FROM child_progress'),
      registrationOpen: await d.registrationOpen(),
      daily: daily.map((r) => ({ day: r.stat_day, minutes: N(r.minutes), stars: N(r.stars), kids: N(r.kids) })),
    });
  });

  router.add('GET', '/api/admin/users', A, async (ctx) => {
    const page = v.int(ctx.query.page, 1, 1, 100000), size = v.int(ctx.query.pageSize, 20, 1, 100), q = like(ctx.query.q);
    const total = N((await db.query("SELECT COUNT(*) AS n FROM users WHERE email LIKE ? ESCAPE '!' OR name LIKE ? ESCAPE '!'", [q, q]))[0].n);
    const rows = await db.query("SELECT u.id,u.email,u.name,u.role,u.status,u.last_login_at,u.created_at,(SELECT COUNT(*) FROM children c WHERE c.user_id=u.id AND c.deleted_at IS NULL) AS children FROM users u WHERE u.email LIKE ? ESCAPE '!' OR u.name LIKE ? ESCAPE '!' ORDER BY u.id DESC LIMIT ? OFFSET ?", [q, q, size, (page - 1) * size]);
    ctx.json(200, { total, page, pageSize: size, users: rows.map((r) => ({ id: r.id, email: r.email, name: r.name, role: r.role, status: r.status, lastLoginAt: r.last_login_at, createdAt: r.created_at, children: N(r.children) })) });
  });

  router.add('POST', '/api/admin/users', A, async (ctx) => {
    const email = v.email(ctx.body.email), name = v.str(ctx.body.name, 'name', { min: 2, max: 100 });
    const role = ctx.body.role === 'admin' ? 'admin' : 'parent', problem = passwordProblem(ctx.body.password, email);
    if (problem) throw new HttpError(400, problem);
    if ((await db.query('SELECT id FROM users WHERE email=?', [email])).length) throw new HttpError(409, 'email_taken');
    const now = Date.now();
    const r = await db.run('INSERT INTO users(email,name,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', [email, name, await hashPassword(ctx.body.password), role, 'active', now, now]);
    await audit(ctx.user.id, 'admin_user_created', `${email} (${role})`, ctx.ip);
    ctx.json(201, { id: r.insertId });
  });

  router.add('PATCH', '/api/admin/users/:id', A, async (ctx) => {
    const u = await target(ctx.params.id), b = ctx.body, set = {};
    if (b.name !== undefined) set.name = v.str(b.name, 'name', { min: 2, max: 100 });
    if (b.status !== undefined) { if (!['active', 'disabled'].includes(b.status)) throw new HttpError(400, 'status_invalid'); set.status = b.status; }
    if (b.role !== undefined) { if (!['admin', 'parent'].includes(b.role)) throw new HttpError(400, 'role_invalid'); set.role = b.role; }
    const losingAdmin = u.role === 'admin' && u.status === 'active' && ((set.role && set.role !== 'admin') || (set.status && set.status !== 'active'));
    if (losingAdmin && (u.id === ctx.user.id || (await activeAdmins()) <= 1)) throw new HttpError(400, 'cannot_remove_last_admin');
    const keys = Object.keys(set);
    if (keys.length) {
      await db.run(`UPDATE users SET ${keys.map((k) => k + '=?').join(',')}, updated_at=? WHERE id=?`, [...keys.map((k) => set[k]), Date.now(), u.id]);
      if (set.status === 'disabled') await db.run('DELETE FROM sessions WHERE user_id=?', [u.id]);
      await audit(ctx.user.id, 'admin_user_updated', `${u.email}: ${JSON.stringify(set)}`, ctx.ip);
    }
    ctx.json(200, { ok: true });
  });

  router.add('POST', '/api/admin/users/:id/reset-link', A, async (ctx) => {
    const u = await target(ctx.params.id);
    const link = await d.createResetToken(u.id);
    await audit(ctx.user.id, 'admin_reset_link', u.email, ctx.ip);
    ctx.json(200, { link, expiresInMinutes: 60 });
  });

  router.add('POST', '/api/admin/users/:id/unlock', A, async (ctx) => {
    const u = await target(ctx.params.id);
    await db.run('UPDATE users SET failed_attempts=0, locked_until=0 WHERE id=?', [u.id]);
    await audit(ctx.user.id, 'admin_unlock', u.email, ctx.ip);
    ctx.json(200, { ok: true });
  });

  router.add('DELETE', '/api/admin/users/:id', A, async (ctx) => {
    const u = await target(ctx.params.id);
    if (u.id === ctx.user.id) throw new HttpError(400, 'cannot_delete_self');
    if (u.role === 'admin' && u.status === 'active' && (await activeAdmins()) <= 1) throw new HttpError(400, 'cannot_remove_last_admin');
    await db.run('DELETE FROM users WHERE id=?', [u.id]); // cascades to sessions, children, progress, stats
    await audit(ctx.user.id, 'admin_user_deleted', u.email, ctx.ip);
    ctx.json(200, { ok: true });
  });

  router.add('GET', '/api/admin/children', A, async (ctx) => {
    const page = v.int(ctx.query.page, 1, 1, 100000), size = v.int(ctx.query.pageSize, 20, 1, 100), q = like(ctx.query.q);
    const where = "(c.name LIKE ? ESCAPE '!' OR u.email LIKE ? ESCAPE '!')";
    const total = N((await db.query(`SELECT COUNT(*) AS n FROM children c JOIN users u ON u.id=c.user_id WHERE ${where}`, [q, q]))[0].n);
    const rows = await db.query(`SELECT c.id,c.name,c.avatar,c.birth_date,c.created_at,c.deleted_at,u.email AS parent_email,p.stars,p.updated_at AS progress_at FROM children c JOIN users u ON u.id=c.user_id LEFT JOIN child_progress p ON p.child_id=c.id WHERE ${where} ORDER BY c.id DESC LIMIT ? OFFSET ?`, [q, q, size, (page - 1) * size]);
    ctx.json(200, { total, page, pageSize: size, children: rows.map((r) => ({ id: r.id, name: r.name, avatar: r.avatar, birthDate: r.birth_date, createdAt: r.created_at, deleted: !!r.deleted_at, parentEmail: r.parent_email, stars: N(r.stars), progressAt: r.progress_at })) });
  });

  router.add('GET', '/api/admin/children/:id', A, async (ctx) => {
    const id = v.id(ctx.params.id);
    const c = (await db.query('SELECT c.*, u.email AS parent_email FROM children c JOIN users u ON u.id=c.user_id WHERE c.id=?', [id]))[0];
    if (!c) throw new HttpError(404, 'child_not_found');
    const p = (await db.query('SELECT data,version,stars,updated_at FROM child_progress WHERE child_id=?', [id]))[0];
    const stats = await db.query('SELECT stat_day, minutes, stars FROM daily_stats WHERE child_id=? ORDER BY stat_day DESC LIMIT 30', [id]);
    const data = p ? JSON.parse(p.data) : {}; // summary only: the admin dashboard does not need the child's private settings such as the PIN
    ctx.json(200, {
      child: { id: c.id, name: c.name, avatar: c.avatar, birthDate: c.birth_date, notes: c.notes, parentEmail: c.parent_email, deleted: !!c.deleted_at },
      progress: p ? { stars: N(p.stars), version: p.version, updatedAt: p.updated_at, readingDone: Object.keys(data.rd || {}).length, activeDays: Object.keys(data.days || {}).length } : null,
      stats: stats.map((r) => ({ day: r.stat_day, minutes: N(r.minutes), stars: N(r.stars) })),
    });
  });

  router.add('GET', '/api/admin/audit', A, async (ctx) => {
    const size = v.int(ctx.query.limit, 100, 1, 500);
    const rows = await db.query('SELECT a.id,a.action,a.detail,a.ip,a.created_at,u.email FROM audit_log a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT ?', [size]);
    ctx.json(200, { events: rows.map((r) => ({ id: r.id, action: r.action, detail: r.detail, ip: r.ip, at: r.created_at, email: r.email })) });
  });

  router.add('PUT', '/api/admin/settings', A, async (ctx) => {
    if (typeof ctx.body.allowRegistration === 'boolean') {
      await db.run('REPLACE INTO settings(k,v) VALUES(?,?)', ['allow_registration', ctx.body.allowRegistration ? '1' : '0']);
      await audit(ctx.user.id, 'admin_setting', 'allow_registration=' + ctx.body.allowRegistration, ctx.ip);
    }
    ctx.json(200, { registrationOpen: await d.registrationOpen() });
  });
};
