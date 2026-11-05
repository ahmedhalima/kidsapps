/* Parent pages that only make sense with an account: children management and the account page */

// extra buttons in the parent navigation bar
PX.extra = () => (Cloud.on ? '<button class="btn" id="pxo" style="padding:6px 12px;font-size:16px;background:#ffa8a8">🚪 خروج</button>' + (Cloud.user && Cloud.user.role === 'admin' ? '<button class="btn" id="pxa" style="padding:6px 12px;font-size:16px;background:#b197fc">🛠️ لوحة الإدارة</button>' : '') : '');
PX.bind = (P) => {
  const o = P.querySelector('#pxo'), a = P.querySelector('#pxa');
  if (o) o.onclick = () => Cloud.logout();
  if (a) a.onclick = () => { location.href = 'admin.html'; };
};

// ---- children (cloud version replaces the local-only page) ----
const _localKids = PG.kd;
PG.kd = (h) => (Cloud.on ? cloudKids(h) : _localKids(h));

async function cloudKids(h) {
  h.replaceChildren(dom('p', {}, 'جارٍ التحميل…'));
  if (!(await Cloud.loadChildren())) return;
  const refresh = () => cloudKids(h);
  const msg = dom('p', { style: 'min-height:22px;font-weight:700' });
  const locals = localProfiles();
  const cards = Cloud.children.map((c) => {
    const cur = Cloud.child && Cloud.child.id === c.id, extra = dom('div', {});
    const btn = (label, fn, bg) => dom('button', { class: 'btn', style: 'padding:6px 12px;font-size:15px' + (bg ? ';background:' + bg : ''), onclick: fn }, label);
    const del = btn('🗑️ حذف', async () => {
      if (del.dataset.c !== '1') { del.dataset.c = '1'; del.textContent = 'اضغط للتأكيد'; return; }
      const r = await Api.del('/api/children/' + c.id);
      if (r.status === 403 && r.data.error === 'password_required') { Cloud.askPassword(() => pp('kd')); return; }
      if (!r.ok) { msg.textContent = errText(r); return; }
      await Cloud.loadChildren();
      if (cur) { if (Cloud.children.length) await Cloud.selectChild(Cloud.children[0].id); else { Cloud.child = null; await Cloud.firstChild(); Cloud.enter(); parentPage(); return; } }
      refresh();
    }, '#ffa8a8');
    const imp = locals.length ? btn('📥 استيراد تقدم الجهاز', () => {
      const sel = dom('select', {}, locals.map((l) => dom('option', { value: l.k }, `${l.name} (⭐ ${l.stars})`)));
      extra.replaceChildren(dom('div', { class: 'row' }, 'استبدال تقدم ' + c.name + ' بتقدم محفوظ على هذا الجهاز: ', sel, ' ', btn('تأكيد الاستيراد', async () => {
        const data = JSON.parse(localStorage.getItem(sel.value));
        const cur2 = await Api.get('/api/children/' + c.id + '/progress');
        const r = await Api.put('/api/children/' + c.id + '/progress', { version: cur2.data.version || 0, force: true, data });
        if (!r.ok) { msg.textContent = errText(r); return; }
        if (cur) await Cloud.selectChild(c.id);
        msg.textContent = '✅ تم الاستيراد'; refresh();
      })));
    }) : null;
    return dom('div', { class: 'card', style: 'padding:12px;margin:8px 0;cursor:default;text-align:right' },
      dom('div', { style: 'display:flex;align-items:center;gap:10px;flex-wrap:wrap' },
        dom('span', { style: 'font-size:38px' }, c.avatar),
        dom('div', { style: 'flex:1;min-width:140px' }, dom('b', {}, c.name + (cur ? ' ✅' : '')), dom('div', { style: 'font-size:13px;opacity:.8' }, [ageText(c.birthDate), '⭐ ' + c.stars].filter(Boolean).join(' · '))),
        cur ? null : btn('▶️ اللعب', async () => { await Cloud.selectChild(c.id); refresh(); }, '#69db7c'),
        btn('✏️ التفاصيل', () => childForm(extra, { child: c, onDone: async () => { await Cloud.loadChildren(); if (Cloud.child && Cloud.child.id === c.id) Cloud.child = Cloud.children.find((x) => x.id === c.id); refresh(); } })),
        imp, del),
      extra);
  });
  const addHost = dom('div', {});
  h.replaceChildren(dom('h2', {}, '👶 الأطفال'), msg, cards, dom('h3', {}, '➕ إضافة طفل'), addHost, dom('p', { style: 'font-size:13px;opacity:.8' }, 'لكل طفل نجومه وتقدمه ووقته، ويُحفظ على الخادم فتجده على أي جهاز بعد تسجيل الدخول.'));
  childForm(addHost, { onDone: async () => { msg.textContent = '✅ تمت الإضافة'; refresh(); } });
}

// ---- account page ----
PG.ac = (h) => {
  if (!Cloud.on) {
    h.replaceChildren(dom('h2', {}, '👤 الحساب'), dom('div', { class: 'card', style: 'padding:14px;cursor:default;text-align:right' }, dom('p', {}, 'أنت تستخدم النسخة المحلية: التقدم محفوظ في هذا المتصفح فقط.'),
      dom('p', {}, 'لتفعيل الحسابات وقاعدة بيانات MySQL وتعدد الأطفال على كل الأجهزة، شغّل الخادم (npm start) وافتح الموقع من عنوانه، كما في ملف README.')));
    return;
  }
  const msg = dom('p', { style: 'min-height:22px;font-weight:700' });
  const name = dom('input', { value: Cloud.user.name, maxlength: 100, style: 'width:100%' });
  const cur = dom('input', { type: 'password', autocomplete: 'current-password', style: 'width:100%' }), p1 = dom('input', { type: 'password', autocomplete: 'new-password', style: 'width:100%' }), p2 = dom('input', { type: 'password', autocomplete: 'new-password', style: 'width:100%' });
  const L = (t) => dom('label', { style: 'display:block;margin:8px 0 2px;font-weight:700' }, t);
  h.replaceChildren(dom('h2', {}, '👤 الحساب'), msg,
    dom('div', { class: 'card', style: 'padding:14px;cursor:default;text-align:right' }, dom('p', { dir: 'ltr', style: 'text-align:right' }, Cloud.user.email), L('الاسم'), name,
      dom('button', { class: 'btn', style: 'margin-top:8px', onclick: async () => { const r = await Api.patch('/api/auth/me', { name: name.value }); if (r.ok) { Cloud.user.name = r.data.user.name; msg.textContent = '✅ تم الحفظ'; } else msg.textContent = errText(r); } }, '💾 حفظ الاسم')),
    dom('h3', {}, '🔑 تغيير كلمة المرور'),
    dom('div', { class: 'card', style: 'padding:14px;cursor:default;text-align:right' }, L('كلمة المرور الحالية'), cur, L('الجديدة (٨ أحرف على الأقل، حروف وأرقام)'), p1, L('أعد كتابتها'), p2,
      dom('button', { class: 'btn', style: 'margin-top:8px', onclick: async () => {
        if (p1.value !== p2.value) { msg.textContent = 'كلمتا المرور غير متطابقتين'; return; }
        const r = await Api.post('/api/auth/change-password', { current: cur.value, password: p1.value });
        msg.textContent = r.ok ? '✅ تم التغيير وتسجيل الخروج من الأجهزة الأخرى' : errText(r); if (r.ok) { cur.value = p1.value = p2.value = ''; }
      } }, 'تغيير')),
    dom('div', { class: 'row' }, dom('button', { class: 'btn', onclick: () => Cloud.logout() }, '🚪 تسجيل الخروج'), ' ',
      dom('button', { class: 'btn', onclick: async () => { await Api.post('/api/auth/logout-all'); location.replace('login.html'); } }, '🚪 خروج من كل الأجهزة'),
      Cloud.user.role === 'admin' ? [' ', dom('a', { class: 'btn', href: 'admin.html', style: 'text-decoration:none;display:inline-block' }, '🛠️ لوحة الإدارة')] : null));
};
