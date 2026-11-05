#!/usr/bin/env node
'use strict';
const http = require('http');
const path = require('path');
const { loadEnv, getConfig } = require('./config');
loadEnv(path.join(__dirname, '..', '.env'));
const config = getConfig();
const { createDb } = require('./db');
const { createApp } = require('./app');
const { hashPassword, passwordProblem } = require('./lib/auth');

(async () => {
  const db = await createDb(config.db);
  // Optional first-run bootstrap of an admin account from .env (then remove ADMIN_PASSWORD from .env)
  if (config.adminEmail && config.adminPassword) {
    const has = await db.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (!has.length) {
      const problem = passwordProblem(config.adminPassword, config.adminEmail);
      if (problem) console.error('ADMIN_PASSWORD rejected:', problem);
      else {
        const now = Date.now();
        await db.run('INSERT INTO users(email,name,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', [config.adminEmail.toLowerCase(), config.adminName, await hashPassword(config.adminPassword), 'admin', 'active', now, now]);
        console.log('Admin account created for', config.adminEmail);
      }
    }
  }
  const app = createApp({ db, config });
  const server = http.createServer(app.handler);
  server.listen(config.port, config.host, () => {
    console.log(`Kids World is running:  http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    console.log(`Database: ${config.db.driver}${config.db.driver === 'mysql' ? ` (${config.db.user}@${config.db.host}/${config.db.database})` : ''}`);
  });
  const stop = async () => { server.close(); app.close(); await db.close(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
})().catch((e) => { console.error('Failed to start:', e.message); process.exit(1); });
