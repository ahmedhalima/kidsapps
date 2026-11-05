#!/usr/bin/env node
'use strict';
// Creates the database (if missing) and all tables. Safe to run many times.
const path = require('path');
const { loadEnv, getConfig } = require('../config');
loadEnv(path.join(__dirname, '..', '..', '.env'));
const config = getConfig();
require('../db').createDb(config.db).then(async (db) => {
  const t = await db.query(db.dialect === 'mysql' ? 'SHOW TABLES' : "SELECT name FROM sqlite_master WHERE type='table'");
  console.log(`Database ready (${db.dialect}). Tables:`, t.map((r) => Object.values(r)[0]).join(', '));
  await db.close();
}).catch((e) => { console.error('Database setup failed:', e.message); process.exit(1); });
