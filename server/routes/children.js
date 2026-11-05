'use strict';
const { HttpError } = require('../lib/http');
const v = require('../lib/validate');

const COLS = 'c.id,c.name,c.birth_date,c.avatar,c.notes,c.created_at,p.stars,p.version,p.updated_at AS progress_at';
const shape = (r) => ({ id: r.id, name: r.name, birthDate: r.birth_date, avatar: r.avatar, notes: r.notes, createdAt: r.created_at, stars: Number(r.stars || 0), version: r.version || 0, progressAt: r.progress_at || null });

module.exports = (router, d) => {
  const { db, config, audit } = d;

  async function owned(ctx, rawId) {
    const id = v.id(rawId);
    const rows = await db.query(`SELECT ${COLS} FROM children c LEFT JOIN child_progress p ON p.child_id=c.id WHERE c.id=? AND c.user_id=? AND c.deleted_at IS NULL`, [id, ctx.user.id]);
    if (!rows[0]) throw new HttpError(404, 'child_not_found'); // same answer for "not yours" and "does not exist"
    return rows[0];
  }
  const fields = (b, partial) => {
    const out = {};
    if (!partial || b.name !== undefined) out.name = v.str(b.name, 'name', { min: 1, max: 60 });
    if (!partial || b.birthDate !== undefined) out.birth_date = v.date(b.birthDate);
    if (!partial || b.avatar !== undefined) out.avatar = v.str(b.avatar || '🧒', 'avatar', { max: 16 });
    if (!partial || b.notes !== undefined) out.notes = v.str(b.notes, 'notes', { max: 500, optional: true });
    return out;
  };

  router.add('GET', '/api/children', { auth: true }, async (ctx) => {
    const rows = await db.query(`SELECT ${COLS} FROM children c LEFT JOIN child_progress p ON p.child_id=c.id WHERE c.user_id=? AND c.deleted_at IS NULL ORDER BY c.id`, [ctx.user.id]);
    ctx.json(200, { children: rows.map(shape) });
  });

  router.add('POST', '/api/children', { auth: true }, async (ctx) => {
    const n = (await db.query('SELECT COUNT(*) AS n FROM children WHERE user_id=? AND deleted_at IS NULL', [ctx.user.id]))[0].n;
    if (Number(n) >= config.maxChildrenPerUser) throw new HttpError(400, 'too_many_children');
    const f = fields(ctx.body, false), now = Date.now();
    const r = await db.run('INSERT INTO children(user_id,name,birth_date,avatar,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', [ctx.user.id, f.name, f.birth_date, f.avatar, f.notes, now, now]);
    await audit(ctx.user.id, 'child_created', f.name, ctx.ip);
    ctx.json(201, { child: shape(await owned(ctx, r.insertId)) });
  });

  router.add('GET', '/api/children/:id', { auth: true }, async (ctx) => ctx.json(200, { child: shape(await owned(ctx, ctx.params.id)) }));

  router.add('PATCH', '/api/children/:id', { auth: true }, async (ctx) => {
    const c = await owned(ctx, ctx.params.id), f = fields(ctx.body, true), keys = Object.keys(f);
    if (keys.length) await db.run(`UPDATE children SET ${keys.map((k) => k + '=?').join(',')}, updated_at=? WHERE id=?`, [...keys.map((k) => f[k]), Date.now(), c.id]);
    ctx.json(200, { child: shape(await owned(ctx, c.id)) });
  });

  router.add('DELETE', '/api/children/:id', { auth: true, elevated: true }, async (ctx) => {
    const c = await owned(ctx, ctx.params.id);
    await db.run('UPDATE children SET deleted_at=?, updated_at=? WHERE id=?', [Date.now(), Date.now(), c.id]); // soft delete: the admin can still see it
    await audit(ctx.user.id, 'child_deleted', c.name, ctx.ip);
    ctx.json(200, { ok: true });
  });

  router.add('GET', '/api/children/:id/progress', { auth: true }, async (ctx) => {
    const c = await owned(ctx, ctx.params.id);
    const rows = await db.query('SELECT data,version,updated_at FROM child_progress WHERE child_id=?', [c.id]);
    if (!rows[0]) return ctx.json(200, { data: null, version: 0 });
    ctx.json(200, { data: JSON.parse(rows[0].data), version: rows[0].version, updatedAt: rows[0].updated_at });
  });

  // Save progress. `version` must equal the server's version (compare-and-swap) or the server answers 409 with its copy,
  // so two devices can never silently overwrite each other.
  router.add('PUT', '/api/children/:id/progress', { auth: true }, async (ctx) => {
    const c = await owned(ctx, ctx.params.id), b = ctx.body;
    if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) throw new HttpError(400, 'data_invalid');
    const json = JSON.stringify(b.data);
    if (json.length > 900000) throw new HttpError(413, 'payload_too_large');
    const stars = Math.max(0, Math.min(1e9, parseInt(b.data.stars, 10) || 0)), now = Date.now();
    const rows = await db.query('SELECT version FROM child_progress WHERE child_id=?', [c.id]);
    let version;
    if (!rows[0]) {
      try { await db.run('INSERT INTO child_progress(child_id,data,version,stars,updated_at) VALUES(?,?,?,?,?)', [c.id, json, 1, stars, now]); version = 1; }
      catch { throw new HttpError(409, 'version_conflict'); }
    } else {
      const cur = rows[0].version;
      if (!b.force && Number(b.version) !== cur) {
        const full = (await db.query('SELECT data,version FROM child_progress WHERE child_id=?', [c.id]))[0];
        throw new HttpError(409, 'version_conflict', { version: full.version, data: JSON.parse(full.data) });
      }
      const r = await db.run('UPDATE child_progress SET data=?, version=version+1, stars=?, updated_at=? WHERE child_id=? AND version=?', [json, stars, now, c.id, cur]);
      if (!r.changes) throw new HttpError(409, 'version_conflict');
      version = cur + 1;
    }
    const s = b.stats;
    if (s && /^\d{4}-\d{2}-\d{2}$/.test(String(s.day))) {
      await db.run('REPLACE INTO daily_stats(child_id,stat_day,minutes,stars) VALUES(?,?,?,?)', [c.id, s.day, Math.max(0, Math.min(1440, parseInt(s.minutes, 10) || 0)), Math.max(0, Math.min(100000, parseInt(s.stars, 10) || 0))]);
    }
    ctx.json(200, { version });
  });

  router.add('GET', '/api/children/:id/stats', { auth: true }, async (ctx) => {
    const c = await owned(ctx, ctx.params.id), days = v.int(ctx.query.days, 30, 1, 365);
    const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const rows = await db.query('SELECT stat_day, minutes, stars FROM daily_stats WHERE child_id=? AND stat_day>=? ORDER BY stat_day', [c.id, since]);
    ctx.json(200, { stats: rows.map((r) => ({ day: r.stat_day, minutes: Number(r.minutes), stars: Number(r.stars) })) });
  });
};
