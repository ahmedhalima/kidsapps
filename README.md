# عالم الصغار (Kids World)

Interactive Arabic learning site for a 5-year-old (letters, numbers, math, reading, games, coloring, coding blocks…)
with **parent accounts, several children per account, progress stored in a local MySQL database,
password reset and an admin dashboard**.

```
Browser (child + parent area)  ──HTTP/JSON──►  Node server (no framework)  ──►  MySQL
   public/index.html                              server/                        users, children,
   public/login.html  reset.html  admin.html                                     progress, stats, audit
```

If the page is opened without the server (double-click `index.html`, GitHub Pages…) it automatically falls back to the
old **local mode** (progress saved in the browser) — nothing breaks.

## 1. Quick start

You need **Node.js 18+** and **MySQL 8 (or MariaDB 10.4+)** running on your computer.

```bash
npm install                      # installs the only dependency: mysql2
cp .env.example .env             # then edit DB_USER / DB_PASSWORD ...
npm run db:setup                 # creates the database and all tables (safe to repeat)
npm run admin:create -- you@example.com "Your Name"     # asks for a password
npm start                        # http://localhost:3000
```

Open http://localhost:3000 → you are sent to the login page. The admin dashboard is at http://localhost:3000/admin.html.

### MySQL in 3 minutes
Install MySQL (Windows: MySQL Installer · macOS: `brew install mysql && brew services start mysql` · Linux: `sudo apt install mysql-server`), then:

```sql
CREATE USER 'kidsworld'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON kids_world.* TO 'kidsworld'@'localhost';
GRANT CREATE ON *.* TO 'kidsworld'@'localhost';   -- only so db:setup can create the database; you can revoke it afterwards
```
Put the same user/password in `.env`. Tables use `utf8mb4` so Arabic and emoji are stored correctly.

## 2. What you get

**Accounts & login**
- Register / login / logout, sessions in the database (HttpOnly, SameSite=Strict cookie; token stored only as a SHA-256 hash).
- Passwords hashed with **scrypt** + per-user salt. Policy: 8+ characters, letters and digits, not a common password.
- 5 wrong passwords lock the account for 15 minutes (admin can unlock). Rate limits on login, register, reset.
- **Password reset**: "Forgot password" → one-time link valid for 1 hour (stored hashed, single use). After a reset or a password
  change every other device is signed out. Without SMTP the link is printed in the server console, and the admin can create a link
  from the dashboard (Users → "رابط استعادة"). With SMTP: `npm install nodemailer` and fill `SMTP_*` in `.env`.
- The parent area inside the app asks for the **account password** (not a 4-digit PIN). Deleting a child needs a password check in the last 10 minutes.

**Children**
- Several children per account (default max 8). Name, birth date, avatar, notes. Rename/edit from ⚙️ → 👶 الأطفال.
- Each child has separate progress, stars, time limits, goals, tasks, pet, achievements — all saved to MySQL as one JSON document
  plus daily stats (minutes/stars per day).
- A "who is playing?" screen appears when the account has more than one child.
- You can import the progress that was saved in this browser before accounts existed (children page → "استيراد").
- Two devices at once are safe: saves are versioned; if a device is behind, the server refuses and the app **merges** (max of
  numbers, union of lessons/days) instead of overwriting.

**Admin dashboard** (`/admin.html`, admins only)
- Overview: users, active, new, children, total stars, 14-day activity chart.
- Users: search, create, enable/disable, make admin, **create reset link**, unlock, delete.
- Children: search and details (the child's private settings such as the PIN are never shown).
- Audit log (logins, failures, resets, admin actions) and a switch to close registration.
- Safety rules: you cannot demote/disable/delete yourself or the last admin.

## 3. Using it on other devices (tablet, phone)
1. In `.env` set `HOST=0.0.0.0` and `APP_URL=http://<your-computer-ip>:3000`, restart.
2. Open `http://<your-computer-ip>:3000` on the tablet (same Wi-Fi). Microphone recording needs HTTPS or `localhost`.
3. For the internet, put the server behind HTTPS (Caddy / nginx / Cloudflare Tunnel) and set `COOKIE_SECURE=true`.

## 4. Backup
```bash
mysqldump -u kidsworld -p --default-character-set=utf8mb4 kids_world > backup.sql
```

## 5. Project layout
```
public/                  everything the browser loads (static)
  index.html             the children's app          login.html / reset.html / admin.html
  css/  js/core  js/data  js/features  js/parent  js/cloud  js/auth  js/admin  js/shared  assets/
server/
  index.js               starts the server           app.js  request handling, CSRF, sessions
  config.js              .env + settings              db/  schema.mysql.sql, mysql.js, sqlite.js (tests)
  routes/                auth.js children.js admin.js lib/  http, auth(hash/limiter), mailer, validate
  scripts/               db-setup.js  create-admin.js
tests/                   smoke.js (all screens)  server.test.js (API)  integration.test.js (real app vs real server)
scripts/                 build-single.js (one-file bundle)  check-secrets.sh  publish-to-github.sh
```
The browser scripts are plain scripts (not ES modules) that share one scope, so the `<script>` order in `index.html` matters:
`core → data → features → parent → shared/api → cloud → navigation → main`.

## 6. Tests
```bash
npm test
```
- `server.test.js` — 13 API tests (auth, lockout, reset, ownership isolation, versioned progress, admin rules, static-file safety).
- `integration.test.js` — runs the real front-end scripts against the real server.
- `smoke.js` — renders every screen.

The tests use SQLite (built into Node 22) so they need no MySQL. **The MySQL adapter itself (`server/db/mysql.js`) could not be
run in the environment where this was written** — run `npm run db:setup` and `npm start` once on your machine to confirm.

## 7. Security notes / limits
- Everything is served over plain HTTP by default — fine on your own computer/home network; use HTTPS beyond that.
- Rate limiting is in memory (resets when the server restarts; one server process only).
- No 2-factor login. Voice recordings (parent's own voice) are still stored in the browser only, not in MySQL.
- `.env`, keys and databases are git-ignored; `scripts/check-secrets.sh` blocks pushes that contain key-like text.
- Do not commit `.env`. If a secret was ever committed, revoke it — deleting the file later does not remove it from history.

## 8. Single-file build
`npm run build` → `dist/kids-world.html` (local mode only, no server features).
