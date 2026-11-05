/* Set a new password using the one-time token from the e-mailed link */
const $ = (s) => document.querySelector(s);
const msg = $('#msg');
const say = (t, kind) => { msg.textContent = t || ''; msg.className = kind || ''; };
const token = new URLSearchParams(location.search).get('token') || '';
history.replaceState(null, '', location.pathname); // remove the token from the address bar / history

document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { const i = document.getElementById(b.dataset.toggle); i.type = i.type === 'password' ? 'text' : 'password'; }));
$('#p1').addEventListener('input', (e) => {
  const v = e.target.value; let s = 0;
  if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Za-z\u0600-\u06FF]/.test(v) && /\d/.test(v)) s++; if (/[^A-Za-z0-9\u0600-\u06FF]/.test(v)) s++;
  $('#meter').style.width = s * 25 + '%'; $('#meter').style.background = ['#fa5252', '#fa5252', '#fab005', '#51cf66', '#2b8a3e'][s];
});
if (!token) { say('الرابط غير صالح. اطلب رابطًا جديدًا من صفحة الدخول.', 'err'); $('#f-reset').classList.add('hidden'); $('#to-login').classList.remove('hidden'); }

$('#f-reset').addEventListener('submit', async (e) => {
  e.preventDefault();
  if ($('#p1').value !== $('#p2').value) return say('كلمتا المرور غير متطابقتين', 'err');
  const btn = e.target.querySelector('button.primary'); btn.disabled = true;
  const r = await Api.post('/api/auth/reset', { token, password: $('#p1').value });
  btn.disabled = false;
  if (!r.ok) return say(errText(r), 'err');
  e.target.classList.add('hidden'); $('#to-login').classList.remove('hidden');
  say('تم تغيير كلمة المرور بنجاح ✅ وتم تسجيل الخروج من كل الأجهزة.', 'ok');
});
