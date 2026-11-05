'use strict';
// Tiny .env loader (no dependency) + configuration with safe defaults.
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2];
    if (/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

function getConfig(env = process.env) {
  const port = Number(env.PORT) || 3000;
  return {
    port,
    host: env.HOST || '127.0.0.1', // use 0.0.0.0 to let other devices on your Wi-Fi (e.g. a tablet) connect
    appUrl: env.APP_URL || `http://localhost:${port}`,
    publicDir: path.join(__dirname, '..', 'public'),
    db: {
      driver: env.DB_DRIVER || 'mysql',
      host: env.DB_HOST || '127.0.0.1',
      port: Number(env.DB_PORT) || 3306,
      user: env.DB_USER || 'root',
      password: env.DB_PASSWORD || '',
      database: env.DB_NAME || 'kids_world',
      file: env.SQLITE_FILE || ':memory:',
    },
    cookieSecure: env.COOKIE_SECURE === 'true', // set true when served over HTTPS
    allowRegistration: env.ALLOW_REGISTRATION !== 'false',
    sessionDays: Number(env.SESSION_DAYS) || 14,
    rateLimitFactor: Number(env.RATE_LIMIT_FACTOR) || 1, // 1 = normal limits (tests raise it)
    maxChildrenPerUser: Number(env.MAX_CHILDREN) || 8,
    smtp: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT) || 587, user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.SMTP_FROM || 'Kids World <no-reply@localhost>' },
    adminEmail: env.ADMIN_EMAIL, adminPassword: env.ADMIN_PASSWORD, adminName: env.ADMIN_NAME || 'Admin',
    quiet: env.QUIET === 'true',
  };
}
module.exports = { loadEnv, getConfig };
