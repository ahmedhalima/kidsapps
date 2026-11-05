/* Shared by the app, the login pages and the admin dashboard: tiny fetch wrapper, error texts, safe DOM builder */
const Api = {
  async call(method, path, body, opt = {}) {
    let res;
    try {
      res = await fetch(path, {
        method, credentials: 'same-origin', keepalive: !!opt.keepalive,
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) { return { ok: false, status: 0, data: { error: 'network' } }; }
    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    return { ok: res.ok, status: res.status, data: data || {} };
  },
  get: (p) => Api.call('GET', p),
  post: (p, b) => Api.call('POST', p, b === undefined ? {} : b),
  put: (p, b, o) => Api.call('PUT', p, b, o),
  patch: (p, b) => Api.call('PATCH', p, b),
  del: (p) => Api.call('DELETE', p),
};

const ERR_AR = {
  network: 'تعذّر الاتصال بالخادم. تأكد أنه يعمل.',
  invalid_credentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  account_locked: 'الحساب مقفل مؤقتًا بسبب محاولات خاطئة كثيرة',
  account_disabled: 'تم تعطيل هذا الحساب. تواصل مع المسؤول',
  email_taken: 'هذا البريد مسجّل مسبقًا',
  email_invalid: 'البريد الإلكتروني غير صحيح',
  name_invalid: 'الاسم غير صحيح (من ٢ إلى ١٠٠ حرف)',
  name_required: 'الاسم مطلوب',
  password_too_short: 'كلمة المرور يجب ألا تقل عن ٨ أحرف',
  password_too_long: 'كلمة المرور طويلة جدًا',
  password_too_common: 'كلمة المرور شائعة وسهلة التخمين',
  password_same_as_email: 'لا تجعل كلمة المرور مثل البريد',
  password_needs_letter_and_digit: 'يجب أن تحتوي كلمة المرور على حروف وأرقام',
  registration_closed: 'إنشاء الحسابات الجديدة متوقف حاليًا',
  too_many_requests: 'محاولات كثيرة، انتظر قليلًا ثم حاول',
  invalid_or_expired_token: 'الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا',
  not_authenticated: 'انتهت الجلسة، سجّل الدخول من جديد',
  forbidden: 'غير مسموح',
  password_required: 'أعد إدخال كلمة المرور للمتابعة',
  too_many_children: 'وصلت للحد الأقصى من الأطفال',
  child_not_found: 'الطفل غير موجود',
  date_invalid: 'تاريخ الميلاد غير صحيح',
  cannot_remove_last_admin: 'لا يمكن إزالة آخر مدير',
  cannot_delete_self: 'لا يمكنك حذف حسابك',
  user_not_found: 'المستخدم غير موجود',
  version_conflict: 'تعارض في الحفظ',
  csrf_header_missing: 'طلب غير صالح',
  bad_origin: 'طلب غير صالح',
};
function errText(r) {
  const e = r && r.data && r.data.error;
  let t = ERR_AR[e] || 'حدث خطأ غير متوقع';
  if (r && r.data && r.data.retryAfter) t += ' (بعد ' + Math.max(1, Math.ceil(r.data.retryAfter / 60)) + ' دقيقة)';
  return t;
}
// dom('button', {class:'btn', onclick: fn}, 'text', child...) -> element. Text is never parsed as HTML (safe for names/emails).
function dom(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v !== null && v !== undefined) e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) { if (k === null || k === undefined || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(String(k))); }
  return e;
}
