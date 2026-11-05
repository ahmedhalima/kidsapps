'use strict';
// Sends e-mail through SMTP when SMTP_HOST is set and the optional "nodemailer" package is installed.
// Otherwise the message is printed to the server console (handy for local use) and kept in `outbox` (used by tests).
function createMailer(cfg) {
  const outbox = [];
  let tx = null;
  if (cfg.smtp && cfg.smtp.host) {
    try {
      const nm = require('nodemailer');
      tx = nm.createTransport({ host: cfg.smtp.host, port: cfg.smtp.port, secure: cfg.smtp.port === 465, auth: cfg.smtp.user ? { user: cfg.smtp.user, pass: cfg.smtp.pass } : undefined });
    } catch { console.warn('[mail] SMTP_HOST is set but "nodemailer" is not installed. Run: npm install nodemailer'); }
  }
  return {
    outbox,
    async send(m) {
      outbox.push(m);
      if (outbox.length > 50) outbox.shift();
      if (tx) { await tx.sendMail({ from: cfg.smtp.from, ...m }); return; }
      if (!cfg.quiet) console.log(`\n[mail:dev] To: ${m.to}\nSubject: ${m.subject}\n${m.text}\n`);
    },
  };
}
module.exports = { createMailer };
