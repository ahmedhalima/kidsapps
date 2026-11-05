/* Stars, levels and the rewards page */
const addStar=n=>{
  S.stars+=n;
  S.days[today()]=1;
  save();
  hdr()
};

const LV=[[0,'🥚','بيضة'],[20,'🐥','كتكوت'],[50,'🐰','أرنب'],[100,'🐯','نمر'],[200,'🦁','أسد'],[400,'🐲','تنين']],STK=['🐶','🐱','🦁','🐼','🦄','🐙','🦋','🐳','🚀','🌈','🏆','👑'];

const bal=()=>S.stars-(S.spent||0);

function rew(){
  view='rew';
  let li=0;
  LV.forEach((l,i)=>{
    if(S.stars>=l[0])li=i
  });
  const nx=LV[li+1],pc=nx?Math.round((S.stars-LV[li][0])/(nx[0]-LV[li][0])*100):100,st=Math.floor(S.stars/10);
  let sk=0,d=new Date();
  while(S.days[d.toISOString().slice(0,10)]){
    sk++;
    d.setDate(d.getDate()-1)
  }
  const bars=['ar','en','num','wd','sen'].map(k=>{
    const j=SJ[k],t=Math.ceil((j.d.length-j.s)/j.st),p=Math.min(100,Math.round((S.rounds[k]||0)/t*100));
    return '<div style="text-align:right;margin:6px"><small>'+j.t+' — '+nm(p)+'٪</small><div style="background:#ddd;border-radius:10px;height:14px"><div style="width:'+p+'%;height:100%;border-radius:10px;background:'+j.c+'"></div></div></div>'
  }).join('');
  app.innerHTML='<h2>🏆 مكافآتي</h2><div class="card" style="padding:16px"><div class="big">'+LV[li][1]+'</div><div class="q">أنا '+LV[li][2]+' ('+nm(S.stars)+' ⭐)</div><div style="background:#ddd;border-radius:20px;height:22px;margin:10px"><div style="width:'+pc+'%;height:100%;border-radius:20px;background:linear-gradient(90deg,#ffd43b,#ff922b)"></div></div><small>'+(nx?'باقي '+nm(nx[0]-S.stars)+' نجمة لتصبح '+nx[2]+' '+nx[1]:'وصلت لأعلى مستوى! 🎉')+'</small></div><div class="q" style="margin:12px">🔥 أيام متتالية: '+nm(sk)+'</div>'+(S.chest===today()?'<div class="q">🎁 فتحت صندوق اليوم</div>':'<button class="btn" id="ch">🎁 افتح صندوق اليوم</button>')+'<h3>ملصقاتي (كل ١٠ نجوم ملصق)</h3><div class="grid" style="grid-template-columns:repeat(6,1fr)">'+STK.map((s,i)=>'<div class="card" style="font-size:30px">'+(i<st?s:'🔒')+'</div>').join('')+'</div><h3>تقدّمي</h3>'+bars;
  const c=$('#ch');
  if(c)c.onclick=()=>{
    S.chest=today();
    const n=2+Math.floor(Math.random()*4);
    addStar(n);
    sfx.win();
    say('هدية رائعة');
    c.outerHTML='<div class="q">🎁 +'+nm(n)+' ⭐!</div>'
  }
}
