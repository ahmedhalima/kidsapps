/* Admin dashboard (plain JS; all user-provided text is inserted with textContent, never as HTML) */
const $ = (s) => document.querySelector(s);
const view = $('#view');
const fmt = (ms) => (ms ? new Date(Number(ms)).toLocaleString('ar-EG') : '—');
const num = (n) => Number(n || 0).toLocaleString('ar-EG');
let me = null, tab = 'overview';

function toast(t, bad) { const e = dom('div', { class: 'toast' }, t); if (bad) e.style.background = '#c92a2a'; document.body.append(e); setTimeout(() => e.remove(), 3200); }
async function call(p) { const r = await p; if (r.status === 401) { location.replace('login.html?next=admin.html'); throw new Error('auth'); } if (!r.ok) { toast(errText(r), true); throw new Error('api'); } return r.data; }
function modal(title, ...content) {
  const m = dom('div', { class: 'modal', onclick: (e) => { if (e.target === m) m.remove(); } }, dom('div', { class: 'box' }, dom('h2', {}, title), content, dom('div', { style: 'margin-top:12px' }, dom('button', { class: 'btn alt', onclick: () => m.remove() }, 'إغلاق'))));
  document.body.append(m); return m;
}

/* ---------- overview ---------- */
async function overview() {
  const d = await call(Api.get('/api/admin/overview'));
  const card = (v, l) => dom('div', { class: 'stat' }, dom('b', {}, num(v)), dom('span', {}, l));
  const maxM = Math.max(10, ...d.daily.map((x) => x.minutes)), maxS = Math.max(5, ...d.daily.map((x) => x.stars));
  view.replaceChildren(
    dom('div', { class: 'cards' }, card(d.users, 'المستخدمون'), card(d.activeUsers, 'نشطون'), card(d.disabledUsers, 'معطّلون'), card(d.admins, 'مديرون'), card(d.newUsers7d, 'جدد (٧ أيام)'), card(d.loggedIn7d, 'سجّلوا دخولًا (٧ أيام)'), card(d.children, 'الأطفال'), card(d.totalStars, 'إجمالي النجوم')),
    dom('div', { class: 'panel' }, dom('h2', {}, 'نشاط الأطفال آخر ١٤ يومًا'), dom('div', { class: 'note' }, '🟦 دقائق اللعب   🟧 النجوم'),
      dom('div', { class: 'chart' }, d.daily.length ? d.daily.map((x) => dom('div', { class: 'day' }, dom('div', { class: 'bars' }, dom('i', { style: `height:${x.minutes / maxM * 100}%;background:#4dabf7`, title: x.minutes + ' د' }), dom('i', { style: `height:${x.stars / maxS * 100}%;background:#ff922b`, title: x.stars + ' نجمة' })), x.day.slice(5))) : dom('p', { class: 'note' }, 'لا يوجد نشاط مسجّل بعد.'))),
  );
}

/* ---------- users ---------- */
const U = { q: '', page: 1 };
async function users() {
  const d = await call(Api.get(`/api/admin/users?q=${encodeURIComponent(U.q)}&page=${U.page}&pageSize=15`));
  const act = (label, cls, fn) => dom('button', { class: 'btn ' + cls, onclick: fn }, label);
  const patch = async (u, body, ok) => { await call(Api.patch('/api/admin/users/' + u.id, body)); toast(ok); users(); };
  const rows = d.users.map((u) => dom('tr', {},
    dom('td', { dir: 'ltr' }, u.email), dom('td', {}, u.name), dom('td', {}, dom('span', { class: 'badge ' + u.role }, u.role === 'admin' ? 'مدير' : 'ولي أمر')),
    dom('td', {}, dom('span', { class: 'badge ' + u.status }, u.status === 'active' ? 'نشط' : 'معطّل')), dom('td', {}, num(u.children)), dom('td', {}, fmt(u.lastLoginAt)), dom('td', {}, fmt(u.createdAt)),
    dom('td', {},
      u.id === me.id ? dom('span', { class: 'note' }, 'أنت') : [
        act(u.status === 'active' ? 'تعطيل' : 'تفعيل', u.status === 'active' ? 'alt' : 'good', () => patch(u, { status: u.status === 'active' ? 'disabled' : 'active' }, 'تم')),
        act(u.role === 'admin' ? 'جعله ولي أمر' : 'جعله مديرًا', 'alt', () => { if (confirm('تغيير صلاحية ' + u.email + '؟')) patch(u, { role: u.role === 'admin' ? 'parent' : 'admin' }, 'تم'); }),
        act('حذف', 'bad', async () => { if (confirm('حذف ' + u.email + ' وكل أطفاله وتقدمهم نهائيًا؟')) { await call(Api.del('/api/admin/users/' + u.id)); toast('تم الحذف'); users(); } }),
      ],
      act('رابط استعادة', '', async () => { const r = await call(Api.post(`/api/admin/users/${u.id}/reset-link`)); const inp = dom('input', { readonly: true, value: r.link, dir: 'ltr', style: 'width:100%' }); modal('رابط إعادة تعيين كلمة المرور', dom('p', { class: 'note' }, 'أرسله لصاحب الحساب. صالح لمدة ' + r.expiresInMinutes + ' دقيقة ويُستخدم مرة واحدة.'), inp); inp.select(); }),
      act('فك القفل', 'alt', async () => { await call(Api.post(`/api/admin/users/${u.id}/unlock`)); toast('تم فك القفل'); }),
    )));
  const search = dom('input', { type: 'search', placeholder: 'ابحث بالبريد أو الاسم', value: U.q, onkeydown: (e) => { if (e.key === 'Enter') { U.q = e.target.value; U.page = 1; users(); } } });
  view.replaceChildren(dom('div', { class: 'panel' }, dom('div', { class: 'tools' }, search, dom('button', { class: 'btn', onclick: () => { U.q = search.value; U.page = 1; users(); } }, 'بحث'), dom('button', { class: 'btn good', onclick: createUser }, '➕ مستخدم جديد'), dom('span', { class: 'note' }, 'الإجمالي: ' + num(d.total))),
    dom('table', {}, dom('thead', {}, dom('tr', {}, ['البريد', 'الاسم', 'الدور', 'الحالة', 'الأطفال', 'آخر دخول', 'التسجيل', 'إجراءات'].map((h) => dom('th', {}, h)))), dom('tbody', {}, rows)),
    pager(d.total, 15, U, users)));
}
function pager(total, size, st, reload) {
  const pages = Math.max(1, Math.ceil(total / size));
  return dom('div', { class: 'tools', style: 'margin-top:10px' }, dom('button', { class: 'btn alt', disabled: st.page <= 1, onclick: () => { st.page--; reload(); } }, '→ السابق'), dom('span', {}, `${num(st.page)} / ${num(pages)}`), dom('button', { class: 'btn alt', disabled: st.page >= pages, onclick: () => { st.page++; reload(); } }, 'التالي ←'));
}
function createUser() {
  const f = { email: dom('input', { type: 'email', dir: 'ltr' }), name: dom('input', {}), pass: dom('input', { type: 'text', dir: 'ltr', placeholder: '٨ أحرف على الأقل، حروف وأرقام' }), role: dom('select', {}, dom('option', { value: 'parent' }, 'ولي أمر'), dom('option', { value: 'admin' }, 'مدير')) };
  const m = modal('مستخدم جديد', dom('label', {}, 'البريد'), f.email, dom('label', {}, 'الاسم'), f.name, dom('label', {}, 'كلمة المرور'), f.pass, dom('label', {}, 'الدور'), f.role,
    dom('button', { class: 'btn good', style: 'margin-top:10px', onclick: async () => { await call(Api.post('/api/admin/users', { email: f.email.value, name: f.name.value, password: f.pass.value, role: f.role.value })); m.remove(); toast('تم إنشاء المستخدم'); users(); } }, 'إنشاء'));
}

/* ---------- children ---------- */
const C = { q: '', page: 1 };
async function children() {
  const d = await call(Api.get(`/api/admin/children?q=${encodeURIComponent(C.q)}&page=${C.page}&pageSize=15`));
  const rows = d.children.map((c) => dom('tr', {}, dom('td', {}, c.avatar + ' ' + c.name + (c.deleted ? ' (محذوف)' : '')), dom('td', { dir: 'ltr' }, c.parentEmail), dom('td', {}, c.birthDate || '—'), dom('td', {}, num(c.stars)), dom('td', {}, fmt(c.progressAt)),
    dom('td', {}, dom('button', { class: 'btn', onclick: () => childDetail(c.id) }, 'تفاصيل'))));
  const search = dom('input', { type: 'search', placeholder: 'اسم الطفل أو بريد ولي الأمر', value: C.q, onkeydown: (e) => { if (e.key === 'Enter') { C.q = e.target.value; C.page = 1; children(); } } });
  view.replaceChildren(dom('div', { class: 'panel' }, dom('div', { class: 'tools' }, search, dom('button', { class: 'btn', onclick: () => { C.q = search.value; C.page = 1; children(); } }, 'بحث'), dom('span', { class: 'note' }, 'الإجمالي: ' + num(d.total))),
    dom('table', {}, dom('thead', {}, dom('tr', {}, ['الطفل', 'ولي الأمر', 'الميلاد', 'النجوم', 'آخر حفظ', ''].map((h) => dom('th', {}, h)))), dom('tbody', {}, rows)), pager(d.total, 15, C, children)));
}
async function childDetail(id) {
  const d = await call(Api.get('/api/admin/children/' + id)), c = d.child, p = d.progress;
  modal(c.avatar + ' ' + c.name, dom('p', {}, 'ولي الأمر: ', dom('span', { dir: 'ltr' }, c.parentEmail)), dom('p', {}, 'تاريخ الميلاد: ' + (c.birthDate || '—')), c.notes ? dom('p', {}, 'ملاحظات: ' + c.notes) : null,
    p ? dom('p', {}, `النجوم: ${num(p.stars)} · دروس القراءة المنجزة: ${num(p.readingDone)} · أيام النشاط: ${num(p.activeDays)} · نسخة الحفظ: ${p.version}`) : dom('p', { class: 'note' }, 'لا يوجد تقدم محفوظ بعد.'),
    dom('h3', {}, 'آخر الأيام'), d.stats.length ? dom('table', {}, dom('tbody', {}, d.stats.map((s) => dom('tr', {}, dom('td', {}, s.day), dom('td', {}, num(s.minutes) + ' دقيقة'), dom('td', {}, '⭐ ' + num(s.stars)))))) : dom('p', { class: 'note' }, 'لا توجد بيانات يومية.'),
    dom('p', { class: 'note' }, 'لا تعرض هذه الصفحة إعدادات الطفل الخاصة (مثل الرقم السري).'));
}

/* ---------- audit + settings ---------- */
const AR_ACTION = { login: 'دخول', login_fail: 'فشل دخول', register: 'تسجيل', account_locked: 'قفل حساب', password_changed: 'تغيير كلمة المرور', reset_requested: 'طلب استعادة', password_reset: 'استعادة كلمة المرور', child_created: 'إضافة طفل', child_deleted: 'حذف طفل', logout_all: 'خروج من كل الأجهزة', verify_fail: 'فشل التحقق', admin_user_created: 'إنشاء مستخدم (مدير)', admin_user_updated: 'تعديل مستخدم', admin_reset_link: 'رابط استعادة', admin_unlock: 'فك قفل', admin_user_deleted: 'حذف مستخدم', admin_setting: 'تغيير إعداد' };
async function audit() {
  const d = await call(Api.get('/api/admin/audit?limit=200'));
  view.replaceChildren(dom('div', { class: 'panel' }, dom('h2', {}, 'آخر ٢٠٠ حدث'), dom('table', {}, dom('thead', {}, dom('tr', {}, ['الوقت', 'الحدث', 'المستخدم', 'تفاصيل', 'IP'].map((h) => dom('th', {}, h)))),
    dom('tbody', {}, d.events.map((e) => dom('tr', {}, dom('td', {}, fmt(e.at)), dom('td', {}, AR_ACTION[e.action] || e.action), dom('td', { dir: 'ltr' }, e.email || '—'), dom('td', {}, e.detail || ''), dom('td', { dir: 'ltr' }, e.ip || '')))))));
}
async function settings() {
  const d = await call(Api.get('/api/admin/overview'));
  const cb = dom('input', { type: 'checkbox', checked: d.registrationOpen, onchange: async (e) => { await call(Api.put('/api/admin/settings', { allowRegistration: e.target.checked })); toast('تم الحفظ'); } });
  view.replaceChildren(dom('div', { class: 'panel' }, dom('h2', {}, 'الإعدادات'), dom('label', {}, cb, ' السماح بإنشاء حسابات جديدة من صفحة الدخول'), dom('p', { class: 'note' }, 'أوقفه بعد إنشاء حسابات العائلة، وأنشئ أي حساب جديد من تبويب المستخدمين.')));
}

const TABS = { overview, users, children, audit, settings };
function go(t) { tab = t; document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t)); view.replaceChildren(dom('p', { class: 'note' }, 'جارٍ التحميل…')); TABS[t]().catch(() => {}); }
document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
$('#logout').addEventListener('click', async () => { await Api.post('/api/auth/logout'); location.replace('login.html'); });

(async () => {
  const r = await Api.get('/api/auth/me');
  if (r.status === 0) return view.replaceChildren(dom('p', { class: 'err' }, 'الخادم غير متاح. شغّل الخادم (npm start).'));
  if (!r.ok) return location.replace('login.html?next=admin.html');
  me = r.data.user;
  if (me.role !== 'admin') return view.replaceChildren(dom('h2', {}, 'غير مصرّح'), dom('p', {}, 'هذه الصفحة للمسؤولين فقط.'), dom('a', { href: 'index.html' }, 'العودة للتطبيق'));
  $('#who').textContent = me.name;
  go('overview');
})();
