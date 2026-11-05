/* Login / register / forgot-password page */
const $ = (s) => document.querySelector(s);
const msg = $('#msg');
const say = (t, kind) => { msg.textContent = t || ''; msg.className = kind || ''; };
const forms = { login: $('#f-login'), register: $('#f-register'), forgot: $('#f-forgot') };
const titles = { login: 'أهلًا بك', register: 'إنشاء حساب جديد', forgot: 'استعادة كلمة المرور' };

function show(name) {
  Object.entries(forms).forEach(([k, f]) => f.classList.toggle('hidden', k !== name));
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  $('#tabs').classList.toggle('hidden', name === 'forgot');
  $('#title').textContent = titles[name];
  say('');
}
document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
$('#to-forgot').addEventListener('click', () => { $('#f-email').value = $('#l-email').value; show('forgot'); });
$('#to-login').addEventListener('click', () => show('login'));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { const i = document.getElementById(b.dataset.toggle); i.type = i.type === 'password' ? 'text' : 'password'; }));

// where to go after login (only local pages are allowed)
function nextUrl() {
  const n = new URLSearchParams(location.search).get('next');
  return n && /^[a-z0-9._-]+\.html$/i.test(n) ? n : 'index.html';
}

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++; if (pw.length >= 12) s++;
  if (/[A-Za-z\u0600-\u06FF]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9\u0600-\u06FF]/.test(pw)) s++;
  return s;
}
$('#r-pass').addEventListener('input', (e) => {
  const s = strength(e.target.value), m = $('#meter');
  m.style.width = (s * 25) + '%'; m.style.background = ['#fa5252', '#fa5252', '#fab005', '#51cf66', '#2b8a3e'][s];
});

async function submit(form, fn) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button.primary'); btn.disabled = true; say('');
    try { await fn(); } finally { btn.disabled = false; }
  });
}

submit(forms.login, async () => {
  const r = await Api.post('/api/auth/login', { email: $('#l-email').value, password: $('#l-pass').value });
  if (!r.ok) return say(errText(r), 'err');
  say('تم تسجيل الدخول ✅', 'ok');
  location.replace(nextUrl());
});
submit(forms.register, async () => {
  if ($('#r-pass').value !== $('#r-pass2').value) return say('كلمتا المرور غير متطابقتين', 'err');
  const r = await Api.post('/api/auth/register', { name: $('#r-name').value, email: $('#r-email').value, password: $('#r-pass').value });
  if (!r.ok) return say(errText(r), 'err');
  location.replace(nextUrl());
});
submit(forms.forgot, async () => {
  const r = await Api.post('/api/auth/forgot', { email: $('#f-email').value });
  if (!r.ok) return say(errText(r), 'err');
  say('إن كان هذا البريد مسجّلًا فقد أرسلنا إليه رابط الاستعادة. (على الخادم المحلي بدون بريد، يظهر الرابط في نافذة الخادم أو يولّده المسؤول)', 'ok');
});

(async () => {
  if (location.hash === '#forgot') show('forgot');
  const cfg = await Api.get('/api/public-config');
  if (cfg.status === 0 || (!cfg.ok && cfg.status !== 429)) return say('الخادم غير متاح. شغّل الخادم (npm start) ثم أعد تحميل الصفحة.', 'err');
  if (!cfg.data.allowRegistration) $('#tab-register').classList.add('hidden');
  const me = await Api.get('/api/auth/me');
  if (me.ok) location.replace(nextUrl());
})();
