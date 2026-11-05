/* Home page (tiles can be reordered or hidden from the parent area) */
const htiles=()=>[...Object.keys(SJ).map(k=>[k,SJ[k].i,SJ[k].t,SJ[k].c]),['color','🎨','التلوين','#ff922b'],['mem','🧩','لعبة الذاكرة','#20c997'],['read','📖','معلّم القراءة','#d6336c'],['habits','🌈','عادات جميلة','#e8590c'],['nums','🔢','الأرقام الكبيرة','#2b8a3e'],['calc','🧮','مسائل بالماوس','#1971c2'],['puz','🧩','ألغاز وذكاء','#862e9c'],['diy','🛠️','اصنع بنفسك','#c2255c'],['anl','🔬','حلّل الكلمات','#0b7285'],['code','🤖','تعلّم البرمجة','#5f3dc4'],['hub','🌍','اكتشف','#0b7285'],['trace','✍️','تتبّع الكتابة','#d9480f'],['pet','🐾','حيواني الأليف','#e67700'],['certs','🏅','شهاداتي','#f08c00'],['fun','🎈','ألعاب مرحة','#1c7ed6'],['prt','🖨️','أنشطة ومطبوعات','#7048e8'],['rew','🏆','مكافآتي','#f59f00'],['feel','😊','مشاعري','#e64980'],['safe','🛡️','سلامتي','#2f9e44'],['tasks','✅','مهامي','#1098ad'],['calm','🌬️','استرخاء','#4dabf7'],['dq','❓','سؤال اليوم','#e67700'],['ach','🎖️','أوسمتي','#fab005'],['cbn','🎨','لوّن بالأرقام','#f03e3e']];

function horder(){
  const all=htiles().map(t=>t[0]),o=(S.hord||[]).filter(k=>all.includes(k));
  all.forEach(k=>{
    if(!o.includes(k))o.push(k)
  });
  return o
}

function home(){
  view='home';
  hdr();
  sfx.pop();
  const m={};
  htiles().forEach(t=>m[t[0]]=t);
  const st=Math.floor(S.stars/10),hid=S.hhide||{};
  app.innerHTML='<h1>🌟 أهلاً يا بطل! 🌟</h1>'+goalBar()+'<div class="grid">'+horder().filter(k=>!hid[k]).map(k=>{
    const t=m[k];
    return '<button class="tile" style="background:'+t[3]+'" data-k="'+k+'"><b>'+t[1]+'</b>'+t[2]+'</button>'
  }).join('')+'</div><h3>ملصقاتي (كل ١٠ نجوم ملصق جديد)</h3><div class="big" style="font-size:44px">'+(st?STK.slice(0,Math.min(st,12)).join(' '):'🥚')+'</div>';
  const F={
    color,mem,habits,fun,prt,rew,read,nums,calc,puz,diy,anl,code,hub,trace,pet,certs,feel,safe,tasks,calm,dq,ach,cbn
  };
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k;
    sfx.pop();
    (F[k]||(k==='math'?()=>play(k):()=>sub(k)))()
  })
}

function goalBar(){
  setTimeout(()=>{
    const b=$('#pfb');
    if(b)b.onclick=profiles;
    const m=$('#mgs');
    if(m)m.onclick=()=>say(S.msg)
  },0);
  const g=S.goal||0,p=g?Math.min(100,Math.round(gain()/g*100)):0,bar=(v,c)=>'<div style="background:#ddd;border-radius:10px;height:12px"><div style="width:'+v+'%;height:100%;border-radius:10px;background:'+c+'"></div></div>';
  let h='<div class="row"><button class="btn" id="pfb">👶 '+esc(PN()||'طفلي')+'</button></div>';
  if(achNew())h+='<div class="card" style="padding:10px;margin:8px;background:#e7f5ff;color:#0b4a6f">🎖️ لديك وسام جديد! افتح «أوسمتي»</div>';
  if(S.msg)h+='<div class="card" id="mgs" style="padding:10px;margin:8px;background:#fff3bf;color:#5f3b00">💌 '+esc(S.msg)+' 🔊</div>';
  const G=S.gift;
  if(G&&G.n){
    const sc=Math.max(0,S.stars-G.s0);
    h+='<div class="card" style="padding:8px;margin:8px;cursor:default"><small>🎁 هديتي: '+esc(G.n)+' — '+nm(Math.min(sc,G.t))+' / '+nm(G.t)+' ⭐'+(sc>=G.t?' 🎉 حصلت عليها! أخبر بابا':'')+'</small>'+bar(Math.min(100,Math.round(sc/G.t*100)),'#ff922b')+'</div>'
  }
  if(g)h+='<div class="card" style="padding:8px;margin:8px;cursor:default"><small>🎯 هدف اليوم: '+nm(Math.min(gain(),g))+' / '+nm(g)+' نجمة'+(gain()>=g?' 🎉 أنجزته! العب بحرية':'')+'</small>'+bar(p,'#51cf66')+'</div>';
  return h
}
