'use strict';
const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const newToken = () => crypto.randomBytes(32).toString('hex');

// Password hashing: scrypt with a random salt, stored as  scrypt$N$r$p$salt$hash
const SCRYPT = { N: 16384, r: 8, p: 1 };
async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = await scrypt(pw, salt, 64, { ...SCRYPT, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('hex')}$${h.toString('hex')}`;
}
async function verifyPassword(pw, stored) {
  const [alg, N, r, p, salt, hash] = String(stored || '').split('$');
  if (alg !== 'scrypt') return false;
  const h = await scrypt(pw, Buffer.from(salt, 'hex'), 64, { N: +N, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  const want = Buffer.from(hash, 'hex');
  return h.length === want.length && crypto.timingSafeEqual(h, want);
}
let DUMMY; // used to keep response time similar when the email does not exist
async function dummyVerify(pw) { DUMMY = DUMMY || (await hashPassword('dummy-password')); await verifyPassword(pw, DUMMY); }

const COMMON = new Set(['12345678', '123456789', '1234567890', 'password', 'password1', 'qwertyui', '11111111', '00000000', 'iloveyou', 'abc12345']);
function passwordProblem(pw, email) {
  if (typeof pw !== 'string' || pw.length < 8) return 'password_too_short';
  if (pw.length > 200) return 'password_too_long';
  if (COMMON.has(pw.toLowerCase())) return 'password_too_common';
  if (email && pw.toLowerCase() === String(email).toLowerCase()) return 'password_same_as_email';
  if (!/[A-Za-z\u0600-\u06FF]/.test(pw) || !/\d/.test(pw)) return 'password_needs_letter_and_digit';
  return null;
}

// Very small in-memory rate limiter (per process). Fine for a single local server.
class Limiter {
  constructor() { this.hits = new Map(); }
  check(key, max, windowMs, now = Date.now()) {
    const h = this.hits.get(key);
    if (!h || h.reset <= now) { this.hits.set(key, { n: 1, reset: now + windowMs }); return { ok: true }; }
    h.n++;
    if (h.n > max) return { ok: false, retryAfter: Math.ceil((h.reset - now) / 1000) };
    return { ok: true };
  }
  sweep(now = Date.now()) { for (const [k, v] of this.hits) if (v.reset <= now) this.hits.delete(k); }
}

module.exports = { sha256, newToken, hashPassword, verifyPassword, dummyVerify, passwordProblem, Limiter };
