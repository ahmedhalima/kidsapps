/* Daily time limit, allowed hours, daily goal, eye-rest reminder, lock screen */
const left=()=>outW()?0:(S.limit+S.extra)*60-S.used;

function hdr(){
  $('#bStars').textContent='⭐ '+nm(S.stars);
  const m=Math.max(0,Math.ceil(left()/60));
  $('#bTime').textContent='⏰ '+nm(m)+' د'
}

setInterval(()=>{
  if(document.hidden||locked||view==='parent')return;
  S.used++;
  hs();
  if(S.used%1200===0)eyeRest();
  if(S.used%10===0)save();
  hdr();
  if(left()<=0)lock()
},1000);

function lock(){
  locked=true;
  save();
  ov.innerHTML='<div class="ov"><div class="box"><div class="big">😴</div><h2>انتهى وقت اللعب اليوم!</h2><p>نراك غدًا يا بطل. اطلب من بابا إذا أردت وقتًا إضافيًا.</p><button class="btn" id="dad">👨 بابا</button></div></div>';
  sfx.no();
  say('انتهى وقت اللعب');
  $('#dad').onclick=()=>askPin(parentPage)
}

const outW=()=>{
  if(S.h1==null||S.h2==null||S.h1===S.h2)return false;
  const h=new Date().getHours();
  return !(S.h1<S.h2?h>=S.h1&&h<S.h2:h>=S.h1||h<S.h2)
};

const gain=()=>{
  const h=S.hist&&S.hist[S.day];
  return h?Math.max(0,S.stars-h.s0):0
};

function goalLocked(){
  if(S.goal&&S.glock&&gain()<S.goal){
    app.innerHTML='<div class="big">🔒</div><h2>أنجز هدف اليوم أولًا</h2><p class="q">اجمع '+nm(S.goal-gain())+' نجمة من الدروس ثم العب بحرية 🌟</p><button class="btn" id="gh">🏠 الرئيسية</button>';
    $('#gh').onclick=home;
    return true
  }
  return false
}

function hs(){
  const h=S.hist=S.hist||{};
  if(!h[S.day])h[S.day]={
    s0:S.stars,s:S.stars,m:0
  };
  h[S.day].s=S.stars;
  h[S.day].m=Math.floor(S.used/60)
}

function eyeRest(){
  if(S.eye===0)return;
  locked=true;
  let t=20;
  ov.innerHTML='<div class="ov"><div class="box"><div class="big">👀</div><h2>استرح قليلًا!</h2><p>انظر إلى شيء بعيد لمدة ٢٠ ثانية</p><div class="pill" id="et">٢٠</div></div></div>';
  say('استرح قليلا وانظر إلى شيء بعيد');
  const iv=setInterval(()=>{
    t--;
    const e=$('#et');
    if(e)e.textContent=nm(t);
    if(t<=0){
      clearInterval(iv);
      ov.innerHTML='';
      locked=false;
      if(left()<=0)lock()
    }
  },1000)
}
