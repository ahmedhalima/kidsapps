'use strict';
const fs = require('fs');
const path = require('path');

async function createDb(cfg) {
  const driver = cfg.driver === 'sqlite' ? './sqlite' : './mysql';
  const db = await require(driver)(cfg);
  const schema = fs.readFileSync(path.join(__dirname, `schema.${db.dialect}.sql`), 'utf8');
  await db.exec(schema); // idempotent: CREATE TABLE IF NOT EXISTS
  return db;
}
module.exports = { createDb };
