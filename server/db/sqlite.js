'use strict';
// SQLite adapter using Node's built-in node:sqlite. Used by the tests (and optionally for quick local dev).
module.exports = async function createSqlite(cfg) {
  const { DatabaseSync } = require('node:sqlite');
  const d = new DatabaseSync(cfg.file || ':memory:');
  d.exec('PRAGMA foreign_keys = ON');
  const num = (v) => (typeof v === 'bigint' ? Number(v) : v);
  return {
    dialect: 'sqlite',
    async query(sql, params = []) { return d.prepare(sql).all(...params).map((r) => ({ ...r })); },
    async run(sql, params = []) { const r = d.prepare(sql).run(...params); return { insertId: num(r.lastInsertRowid), changes: num(r.changes) }; },
    async exec(script) { d.exec(script); },
    async close() { d.close(); },
  };
};
