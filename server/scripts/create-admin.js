#!/usr/bin/env node
'use strict';
// Create (or promote) an admin account.
//   node server/scripts/create-admin.js you@example.com "Your Name"          (asks for the password)
//   node server/scripts/create-admin.js you@example.com "Your Name" --password "Secret123"
const path = require('path');
const readline = require('readline');
const { loadEnv, getConfig } = require('../config');
loadEnv(path.join(__dirname, '..', '..', '.env'));
const config = getConfig();
const { createDb } = require('../db');
const { hashPassword, passwordProblem } = require('../lib/auth');

function askHidden(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}
(async () => {
  const args = process.argv.slice(2), pi = args.indexOf('--password');
  let password = pi >= 0 ? args[pi + 1] : null;
  const pos = args.filter((a, i) => !a.startsWith('--') && i !== pi + 1);
  const [email, name = 'Admin'] = pos;
  if (!email) { console.error('Usage: node server/scripts/create-admin.js <email> ["Name"] [--password "..."]'); process.exit(1); }
  if (!password) password = await askHidden('Password (min 8, letters and digits): ');
  const problem = passwordProblem(password, email);
  if (problem) { console.error('Password rejected:', problem); process.exit(1); }
  const db = await createDb(config.db), now = Date.now(), e = email.toLowerCase();
  const rows = await db.query('SELECT id FROM users WHERE email=?', [e]);
  if (rows.length) { await db.run("UPDATE users SET role='admin', status='active', password_hash=?, updated_at=? WHERE id=?", [await hashPassword(password), now, rows[0].id]); console.log('Existing user promoted to admin and password updated:', e); }
  else { await db.run('INSERT INTO users(email,name,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', [e, name, await hashPassword(password), 'admin', 'active', now, now]); console.log('Admin created:', e); }
  await db.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
