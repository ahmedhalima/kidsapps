'use strict';
const { HttpError } = require('./http');
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

const str = (v, name, { min = 0, max = 255, optional = false } = {}) => {
  if (v === undefined || v === null || v === '') { if (optional) return null; throw new HttpError(400, `${name}_required`); }
  if (typeof v !== 'string') throw new HttpError(400, `${name}_invalid`);
  const t = v.trim();
  if (t.length < min || t.length > max) throw new HttpError(400, `${name}_invalid`);
  return t;
};
const email = (v) => { const e = str(v, 'email', { max: 190 }).toLowerCase(); if (!EMAIL.test(e)) throw new HttpError(400, 'email_invalid'); return e; };
const date = (v) => {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, 'date_invalid');
  const d = new Date(v + 'T00:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v || d.getTime() > Date.now() || d.getUTCFullYear() < 2000) throw new HttpError(400, 'date_invalid');
  return v;
};
const id = (v) => { const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'id_invalid'); return n; };
const int = (v, def, min, max) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
module.exports = { str, email, date, id, int };
