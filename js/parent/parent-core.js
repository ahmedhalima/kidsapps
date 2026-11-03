/* Parent area: PIN page, page frame and navigation between parent pages */
let wp=0;

let PTAB='rp';

function exitPar(){
  document.body.classList.remove('pm');
  save();
  hdr();
  view='home';
  if(left()>0){
    locked=false;
    ov.innerHTML='';
    home()
  } else lock()
}

function askPin(cb){
  document.body.classList.add('pm');
  view='parent';
  $('#par').innerHTML='<div class="card" style="max-width:360px;margin:60px auto;padding:24px;cursor:default;text-align:center"><div class="big">🔒</div><h2>صفحة الأب</h2><p>أدخل الرقم السري</p><input id="pi" type="password" inputmode="numeric" maxlength="8" style="width:180px"><div class="row"><button class="btn" id="po">دخول</button> <button class="btn" id="pc">↩️ رجوع</button></div><div id="pe"></div></div>';
  const go=()=>{
    if($('#pi').value===S.pin){
      wp=0;
      cb()
    } else{
      wp++;
      $('#pe').textContent='❌ الرقم غير صحيح';
      if(wp>=3){
        $('#po').disabled=true;
        $('#pe').textContent='⏳ انتظر ٣٠ ثانية ثم حاول';
        setTimeout(()=>{
          wp=0;
          const b=$('#po');
          if(b)b.disabled=false
        },30000)
      }
    }
  };
  $('#po').onclick=go;
  $('#pi').onkeydown=e=>{
    if(e.key==='Enter')go()
  };
  $('#pc').onclick=exitPar
}

function parentPage(){
  document.body.classList.add('pm');
  view='parent';
  pp('rp')
}

function pp(t){
  PTAB=t;
  const P=$('#par');
  P.innerHTML='<div class="np" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;padding:10px;position:sticky;top:0;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,.15);z-index:5"><b style="align-self:center">⚙️ صفحات الأب</b>'+PT.map(x=>'<button class="btn" style="padding:6px 12px;font-size:16px'+(x[0]===t?';background:#ffd43b':'')+'" data-t="'+x[0]+'">'+x[1]+' '+x[2]+'</button>').join('')+'<button class="btn" id="pq" style="padding:6px 12px;font-size:16px;background:#69db7c">↩️ العودة للطفل</button></div><div id="pbd" style="max-width:720px;margin:auto;padding:16px;text-align:right"></div>';
  P.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>pp(b.dataset.t));
  $('#pq').onclick=exitPar;
  PG[t]($('#pbd'))
}

const PT=[['rp','📊','التقرير'],['tm','⏱️','الوقت والهدف'],['vc','🔊','الصوت'],['rc','🎙️','تسجيل صوتك'],['kd','👶','الأطفال'],['hm','🧩','الرئيسية'],['tk','✅','المهام'],['ms','💌','رسالة وهدايا'],['ct','📚','المحتوى'],['bk','💾','نسخ احتياطي'],['sc','🔐','الأمان']];

const PG={};
