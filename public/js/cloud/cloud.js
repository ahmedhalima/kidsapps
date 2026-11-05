/* Cloud mode: accounts, children and progress stored on the server (MySQL).
   When the page is not served by our server (file://, GitHub Pages...) everything stays in local mode exactly as before. */

// ---- merge used when two devices saved different progress (server copy `a`, this device `b`) ----
const LOCAL_WINS = ['limit', 'extra', 'used', 'day', 'goal', 'glock', 'eye', 'h1', 'h2', 'pin', 'msg', 'gift', 'info', 'tasks', 'hord', 'hhide', 'vr', 'va', 've'];
function mergeState(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (Array.isArray(a) && Array.isArray(b)) { const seen = new Set(), out = []; for (const x of a.concat(b)) { const k = JSON.stringify(x); if (!seen.has(k)) { seen.add(k); out.push(x); } } return out; }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) { const o = { ...a }; for (const k of Object.keys(b)) o[k] = k in a ? mergeState(a[k], b[k]) : b[k]; return o; }
  return b !== undefined ? b : a;
}
function mergeTop(server, local) { const r = mergeState(server, local); for (const k of LOCAL_WINS) if (k in local) r[k] = local[k]; return r; }

const AVATARS = ['🧒', '👦', '👧', '🦁', '🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🦄', '🚀'];
function ageText(b) {
  if (!b) return '';
  const d = new Date(b + 'T00:00:00Z'), n = new Date();
  let m = (n.getFullYear() - d.getUTCFullYear()) * 12 + n.getMonth() - d.getUTCMonth();
  if (n.getDate() < d.getUTCDate()) m--;
  if (m < 0) m = 0;
  return m < 24 ? m + ' شهرًا' : Math.floor(m / 12) + ' سنة';
}
// progress that was saved in this browser before accounts existed (can be imported into a child)
function localProfiles() {
  const out = [], seen = new Set();
  const add = (k, name) => { if (seen.has(k)) return; seen.add(k); try { const o = JSON.parse(localStorage.getItem(k)); if (o && typeof o === 'object' && (o.stars || Object.keys(o.days || {}).length)) out.push({ k, name, stars: o.stars || 0 }); } catch (e) { /* ignore */ } };
  try { const l = JSON.parse(localStorage.getItem('alam_profiles') || 'null'); if (l) l.forEach((p) => add(p.k, p.name)); } catch (e) { /* ignore */ }
  add('alam_v1', 'طفلي');
  return out;
}

const Cloud = {
  on: false, user: null, children: [], child: null, version: 0, dirty: false, rev: 0, busy: false, busyP: null, timer: null, last: 0,

  async init() {
    if (typeof fetch === 'undefined' || location.protocol === 'file:') return;
    const r = await Api.get('/api/auth/me');
    if (!(r.data && (r.data.user || r.data.error === 'not_authenticated'))) return; // not our server -> local mode
    this.on = true; this.user = r.data.user || null; this.sync('ok');
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.flush(); });
    window.addEventListener('pagehide', () => this.flush());
  },
  sync(state) {
    const e = $('#bSync'); if (!e) return;
    e.style.display = this.on ? '' : 'none';
    e.textContent = { ok: '☁️', busy: '⏳', err: '⚠️' }[state] || '☁️';
    e.title = { ok: 'محفوظ على الخادم', busy: 'جارٍ الحفظ…', err: 'تعذّر الحفظ، سنعيد المحاولة' }[state] || '';
  },
  list() { return this.children.map((c) => ({ k: 'alam_cloud_' + c.id, name: c.name })); },
  async loadChildren() {
    const r = await Api.get('/api/children');
    if (r.status === 401) { location.replace('login.html'); return false; }
    if (r.ok) this.children = r.data.children;
    return r.ok;
  },

  // ---- choose / switch the child that is playing ----
  async flow() {
    if (!(await this.loadChildren())) return;
    if (!this.children.length) await this.firstChild();
    const ch = this.children;
    if (ch.length === 1) await this.selectChild(ch[0].id);
    else {
      const last = Number(localStorage.getItem('alam_cloud_last')) || 0;
      if (sessionStorage.getItem('alam_picked') && ch.some((c) => c.id === last)) await this.selectChild(last);
      else await this.picker();
    }
    this.enter();
  },
  enter() { document.body.classList.remove('pm'); ov.innerHTML = ''; locked = false; NH = []; hdr(); },
  afterSwitch() { this.enter(); if (left() <= 0) lock(); else home(); },
  async selectChild(id) {
    await this.flush();
    const r = await Api.get('/api/children/' + id + '/progress');
    if (!r.ok) throw new Error('load progress failed');
    const child = this.children.find((c) => c.id === id) || { id, name: '' };
    KK = 'alam_cloud_' + id;
    try { localStorage.setItem('alam_cloud_last', String(id)); sessionStorage.setItem('alam_picked', '1'); } catch (e) { /* ignore */ }
    let data = r.data.data;
    if (!data) { try { data = JSON.parse(localStorage.getItem(KK)); } catch (e) { data = null; } }
    S = Object.assign(defaultState(), data || {});
    if (S.day !== today()) { S.day = today(); S.used = 0; S.extra = 0; }
    this.child = child; this.version = r.data.version || 0; this.dirty = !r.data.data; this.rev++; // first time: upload the starting state
    if (this.dirty) this.push();
  },
  async switchTo(k) { await this.selectChild(Number(String(k).replace('alam_cloud_', ''))); this.afterSwitch(); },
  picker() {
    return new Promise((resolve) => {
      document.body.classList.add('pm'); view = 'parent';
      $('#par').replaceChildren(dom('div', { style: 'max-width:760px;margin:30px auto;padding:16px;text-align:center' },
        dom('h1', {}, 'من يلعب الآن؟'),
        dom('div', { class: 'grid' }, this.children.map((c) => dom('button', { class: 'tile', style: 'background:#7048e8', onclick: async () => { await this.selectChild(c.id); resolve(); } }, dom('b', {}, c.avatar), c.name, dom('small', { style: 'display:block;font-size:14px' }, ageText(c.birthDate))))),
        dom('div', { class: 'row' }, dom('button', { class: 'btn', onclick: () => this.logout() }, '🚪 تسجيل الخروج'))));
    });
  },
  firstChild() {
    return new Promise((resolve) => {
      document.body.classList.add('pm'); view = 'parent';
      const host = dom('div', {});
      $('#par').replaceChildren(dom('div', { style: 'max-width:480px;margin:30px auto;padding:16px;text-align:center' }, dom('h1', {}, 'مرحبًا ' + this.user.name + ' 👋'), dom('p', {}, 'أضف طفلك الأول لنبدأ'), host));
      childForm(host, { onDone: async () => { await this.loadChildren(); resolve(); } });
    });
  },

  // ---- saving ----
  // `rev` counts changes. A save only clears `dirty` if nothing changed while the request was in flight (otherwise it saves again).
  pushSoon() {
    if (!this.on || !this.child) return;
    this.dirty = true; this.rev++;
    if (this.timer) return;
    this.timer = setTimeout(() => { this.timer = null; this.push(); }, Math.max(2500, 20000 - (Date.now() - this.last)));
  },
  async flush() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    for (let i = 0; i < 4 && (this.dirty || this.busy); i++) {
      if (this.busy) await this.busyP; else await this.push(true);
    }
  },
  push(keepalive) {
    if (!this.child || !this.dirty) return Promise.resolve();
    if (this.busy) return this.busyP;
    this.busyP = this.doPush(keepalive);
    return this.busyP;
  },
  async doPush(keepalive) {
    this.busy = true; this.sync('busy');
    try {
      for (let i = 0; i < 4; i++) {
        const rev = this.rev, h = S.hist && S.hist[S.day];
        const stats = h ? { day: S.day, minutes: Math.floor(S.used / 60), stars: Math.max(0, S.stars - h.s0) } : undefined;
        const r = await Api.put('/api/children/' + this.child.id + '/progress', { version: this.version, data: S, stats }, { keepalive: !!keepalive });
        if (r.ok) {
          this.version = r.data.version; this.last = Date.now();
          if (this.rev === rev) { this.dirty = false; this.sync('ok'); break; }
          continue; // something changed while saving: save once more
        }
        if (r.status === 409 && r.data.data) { S = mergeTop(r.data.data, S); this.version = r.data.version; this.rev++; try { localStorage.setItem(KK, JSON.stringify(S)); } catch (e) { /* ignore */ } continue; }
        if (r.status === 401) { location.replace('login.html'); break; }
        throw new Error('save failed ' + r.status);
      }
    } catch (e) {
      this.sync('err'); clearTimeout(this.timer); this.timer = setTimeout(() => { this.timer = null; this.push(); }, 30000);
    }
    this.busy = false;
  },

  // ---- parent area ----
  lockParent() { if (this.on) Api.post('/api/auth/lock'); },
  askPassword(cb) {
    document.body.classList.add('pm'); view = 'parent';
    const inp = dom('input', { type: 'password', autocomplete: 'current-password', style: 'width:240px' });
    const err = dom('div', { style: 'color:#c92a2a;font-weight:700;min-height:24px' });
    const btn = dom('button', { class: 'btn', onclick: go }, 'دخول');
    async function go() {
      btn.disabled = true; err.textContent = '';
      const r = await Api.post('/api/auth/verify', { password: inp.value });
      btn.disabled = false;
      if (r.status === 401 && r.data.error === 'not_authenticated') { location.replace('login.html'); return; }
      if (!r.ok) { err.textContent = errText(r); inp.select(); return; }
      cb();
    }
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $('#par').replaceChildren(dom('div', { class: 'card', style: 'max-width:380px;margin:60px auto;padding:24px;cursor:default;text-align:center' },
      dom('div', { class: 'big' }, '🔒'), dom('h2', {}, 'صفحة الأهل'), dom('p', {}, 'أدخل كلمة مرور حسابك', dom('br'), dom('small', { dir: 'ltr' }, this.user.email)), inp, err,
      dom('div', { class: 'row' }, btn, ' ', dom('button', { class: 'btn', onclick: exitPar }, '↩️ رجوع')),
      dom('a', { href: 'login.html#forgot', target: '_blank', rel: 'noopener' }, 'نسيت كلمة المرور؟')));
    inp.focus();
  },
  async logout() {
    await this.flush();
    await Api.post('/api/auth/logout');
    try { Object.keys(localStorage).filter((k) => k.startsWith('alam_cloud_')).forEach((k) => localStorage.removeItem(k)); sessionStorage.clear(); } catch (e) { /* ignore */ }
    location.replace('login.html');
  },
};

// ---- add / edit a child (used by the first-child screen and the parent "Children" page) ----
function childForm(host, { child, onDone }) {
  const f = {
    name: dom('input', { value: child ? child.name : '', maxlength: 60, placeholder: 'اسم الطفل', style: 'width:100%' }),
    birth: dom('input', { type: 'date', value: child && child.birthDate ? child.birthDate : '', max: new Date().toISOString().slice(0, 10), style: 'width:100%' }),
    avatar: dom('select', { style: 'width:100%;font-size:22px' }, AVATARS.map((a) => dom('option', { value: a, selected: child ? child.avatar === a : a === '🧒' }, a))),
    notes: dom('textarea', { maxlength: 500, rows: 2, placeholder: 'ملاحظات (اختياري)', style: 'width:100%;font:inherit' }, child && child.notes ? child.notes : ''),
  };
  const locals = child ? [] : localProfiles();
  const imp = dom('select', { style: 'width:100%' }, dom('option', { value: '' }, 'لا، ابدأ من الصفر'), locals.map((l) => dom('option', { value: l.k }, `${l.name} (⭐ ${l.stars})`)));
  const msg = dom('div', { style: 'color:#c92a2a;font-weight:700;min-height:22px' });
  const L = (t) => dom('label', { style: 'display:block;text-align:right;margin:8px 0 2px;font-weight:700' }, t);
  const save = dom('button', { class: 'btn', onclick: async () => {
    save.disabled = true; msg.textContent = '';
    const body = { name: f.name.value, birthDate: f.birth.value || null, avatar: f.avatar.value, notes: f.notes.value };
    const r = child ? await Api.patch('/api/children/' + child.id, body) : await Api.post('/api/children', body);
    if (!r.ok) { save.disabled = false; msg.textContent = r.data.error === 'password_required' ? errText(r) : errText(r); return; }
    if (!child && imp.value) { // import this device's old progress into the new child
      try { const data = JSON.parse(localStorage.getItem(imp.value)); await Api.put('/api/children/' + r.data.child.id + '/progress', { version: 0, data }); } catch (e) { /* ignore */ }
    }
    host.replaceChildren(); await onDone(r.data.child);
  } }, child ? '💾 حفظ' : '➕ إضافة');
  host.replaceChildren(L('الاسم'), f.name, L('تاريخ الميلاد'), f.birth, L('الصورة الرمزية'), f.avatar, L('ملاحظات'), f.notes, locals.length ? [L('استيراد تقدم محفوظ على هذا الجهاز؟'), imp] : null, msg, dom('div', { class: 'row' }, save));
}
