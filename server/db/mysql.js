'use strict';
// MySQL / MariaDB adapter (requires the "mysql2" package). Interface: query / run / exec / close.
module.exports = async function createMysql(cfg) {
  let mysql;
  try { mysql = require('mysql2/promise'); }
  catch (e) { throw new Error('The "mysql2" package is missing. Run: npm install'); }

  const base = { host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, charset: 'utf8mb4' };
  // Create the database on first run (needs a MySQL user allowed to CREATE DATABASE)
  const boot = await mysql.createConnection(base);
  await boot.query('CREATE DATABASE IF NOT EXISTS `' + cfg.database.replace(/`/g, '') + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await boot.end();

  const pool = mysql.createPool({
    ...base, database: cfg.database, waitForConnections: true, connectionLimit: 10,
    supportBigNumbers: true, bigNumberStrings: false, dateStrings: true,
  });
  return {
    dialect: 'mysql',
    async query(sql, params = []) { const [rows] = await pool.query(sql, params); return rows; },
    async run(sql, params = []) { const [r] = await pool.query(sql, params); return { insertId: Number(r.insertId || 0), changes: Number(r.affectedRows || 0) }; },
    async exec(script) { for (const s of script.split(/;\s*(?:\r?\n|$)/).map(x => x.replace(/^\s*--.*$/gm, '').trim()).filter(Boolean)) await pool.query(s); },
    async close() { await pool.end(); },
  };
};
