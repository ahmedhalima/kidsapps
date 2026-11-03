/* Achievement badges */
const streakN=()=>{
  let sk=0,d=new Date();
  while(S.days[d.toISOString().slice(0,10)]){
    sk++;
    d.setDate(d.getDate()-1)
  }
  return sk
};

const ACH=[['s1','⭐','أول نجمة','اجمع نجمة واحدة',()=>S.stars>=1],['s50','🌟','٥٠ نجمة','اجمع ٥٠ نجمة',()=>S.stars>=50],['s100','🏅','١٠٠ نجمة','اجمع ١٠٠ نجمة',()=>S.stars>=100],['s300','🏆','٣٠٠ نجمة','اجمع ٣٠٠ نجمة',()=>S.stars>=300],['k3','🔥','٣ أيام متتالية','العب ٣ أيام وراء بعض',()=>streakN()>=3],['k7','🚀','أسبوع كامل','العب ٧ أيام متتالية',()=>streakN()>=7],['rd1','🔤','أتقن الحروف','أنهِ دروس الحروف',()=>S.rd.L14],['rd2','📖','معلّم القراءة ١','أنهِ الجزء الأول',()=>S.rd.s11],['rd3','📗','معلّم القراءة ٢','أنهِ الجزء الثاني',()=>S.rd.h9],['cd','🤖','بطل البرمجة','أنهِ مستويات الروبوت',()=>S.rd.c5],['qr','🕌','حافظ سورة','احفظ سورة الإخلاص',()=>S.rd.q0],['pt','🐾','مربّي الحيوان','أطعم حيوانك ٣٠ مرة',()=>(S.pf||0)>=30],['cl','🧮','عبقري الحساب','أنهِ ٥ جولات حساب',()=>(S.rounds.calc||0)>=5],['sh','🛍️','تاجر صغير','اشترِ ٣ أشياء',()=>Object.keys(S.own||{}).length>=3],['dq','❓','سائل ذكي','أجب سؤال اليوم',()=>!!S.dq]];

const achNew=()=>ACH.filter(a=>a[4]()&&!(S.ach||[]).includes(a[0])).length;

function ach(){
  view='ach';
  const have=S.ach||[],nu=ACH.filter(a=>a[4]()&&!have.includes(a[0]));
  if(nu.length){
    S.ach=have.concat(nu.map(a=>a[0]));
    addStar(nu.length*2);
    sfx.win();
    say('مبروك، حصلت على وسام جديد')
  }
  app.innerHTML='<h2>🎖️ أوسمتي ('+nm(ACH.filter(a=>a[4]()).length)+' / '+nm(ACH.length)+')</h2>'+(nu.length?'<div class="card" style="background:#fff3bf;color:#5f3b00;padding:10px;margin:8px;cursor:default">🎉 وسام جديد! +'+nm(nu.length*2)+' ⭐</div>':'')+'<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">'+ACH.map(a=>{
    const ok=a[4]();
    return '<div class="card" style="'+(ok?'':'filter:grayscale(1);opacity:.55')+'"><div class="E" style="font-size:44px">'+(ok?a[1]:'🔒')+'</div><b>'+a[2]+'</b><small>'+a[3]+'</small></div>'
  }).join('')+'</div>'
}
