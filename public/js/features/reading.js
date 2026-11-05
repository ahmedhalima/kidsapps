/* Reading Teacher: part 1 (letters, vowels) and part 2 (words, stories) */
function rf(sc,tot,pass,key){
  const ok=sc>=pass;
  if(ok){
    if(!S.rd[key])addStar(3);
    S.rd[key]=1;
    save()
  }
  app.innerHTML='<div class="big">'+(ok?'🏆':'💪')+'</div><h1>'+(ok?'أحسنت! انفتح الدرس التالي 🔓':'حاول مرة أخرى!')+'</h1><div class="big" style="font-size:50px">'+'⭐'.repeat(sc)+'</div><div class="row"><button class="btn" id="b1">📖 رجوع للطريق</button></div>';
  sfx.win();
  say(ok?'برافو':'حاول مرة أخرى');
  $('#b1').onclick=()=>RB()
}

function read(){
  view='read';
  RB=read;
  const ok=k=>S.rd[k];
  app.innerHTML='<h2>📖 معلّم القراءة</h2><p class="q">اتبع الطريق خطوة بخطوة 🌟</p><h3>🔤 الحروف (١٤ درسًا)</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">'+Array.from({
    length:14
  },(_,i)=>{
    const n=i+1,lk=n>1&&!ok('L'+(n-1));
    return '<div class="card'+(lk?' lock':'')+'" data-l="'+n+'"><div class="L">'+(lk?'🔒':BKL[2*n-2][0]+' '+BKL[2*n-1][0])+'</div><small>درس '+nm(n)+(ok('L'+n)?' ✅':'')+'</small></div>'
  }).join('')+'</div><h3>🧩 الحركات والمدود والجمل</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">'+RS.map((r,i)=>{
    const lk=!(i?ok('s'+(i-1)):ok('L14'));
    return '<div class="card'+(lk?' lock':'')+'" data-s="'+i+'"><div class="E">'+(lk?'🔒':ok('s'+i)?'✅':'⭐')+'</div><small>'+r[0]+'</small></div>'
  }).join('')+'</div>';
  app.insertAdjacentHTML('beforeend','<h3>📗 الجزء الثاني</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))"><div class="card'+(ok('s11')?'':' lock')+'" id="p2"><div class="E">'+(ok('s11')?'📗':'🔒')+'</div><small>معلّم القراءة ٢</small></div></div>');
  $('#p2').onclick=()=>ok('s11')?read2():sfx.no();
  app.querySelectorAll('[data-l]').forEach(c=>c.onclick=()=>c.classList.contains('lock')?sfx.no():lesson(+c.dataset.l));
  app.querySelectorAll('[data-s]').forEach(c=>c.onclick=()=>c.classList.contains('lock')?sfx.no():stage(+c.dataset.s))
}

function lesson(n){
  view='read';
  const A=[BKL[2*n-2],BKL[2*n-1]],pool=BKL.slice(0,2*n);
  app.innerHTML='<h2>درس '+nm(n)+'</h2><div class="grid" style="grid-template-columns:1fr 1fr">'+A.map((x,i)=>'<div class="card" data-i="'+i+'" style="padding:14px"><div class="L" style="font-size:90px">'+x[0]+'</div><div class="big" style="font-size:70px">'+x[2]+'</div><div class="q">'+x[1]+'</div></div>').join('')+'</div><p>اضغط على البطاقة لتسمع 🔊</p><button class="btn" id="g">🎮 اختبرني</button>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    const x=A[c.dataset.i];
    sfx.pop();
    say('حرف '+AN[ABJ.indexOf(x[0])]+'، '+x[1])
  });
  $('#g').onclick=()=>qz(Array.from({
    length:4
  },(_,j)=>{
    const x=j<3?A[j%2]:pool[Math.floor(Math.random()*pool.length)];
    return{
      big:x[2],q:'بأي حرف تبدأ «'+x[1]+'»؟',say:'بأي حرف تبدأ كلمة '+x[1],o:opts(x[0],pool.map(y=>y[0])),a:x[0]
    }
  }),sc=>rf(sc,4,3,'L'+n))
}

function stage(i){
  view='read';
  const r=RS[i],sen=r[2].indexOf('|')>0,it=r[2].split(sen?';':',').map(x=>x.split('|'));
  app.innerHTML='<h2>'+r[0]+'</h2><p class="q">'+r[1]+'</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax('+(sen?260:130)+'px,1fr))">'+it.map((x,j)=>'<div class="card" data-j="'+j+'"><div class="rw">'+x[0]+'</div>'+(x[1]?'<div class="E">'+x[1]+'</div>':'')+'</div>').join('')+'</div><p>اضغط على الكلمة لتسمعها 🔊</p><button class="btn" id="g">🎮 اختبرني</button>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    sfx.pop();
    say(it[c.dataset.j][0])
  });
  $('#g').onclick=()=>qz(Array.from({
    length:5
  },()=>{
    const x=it[Math.floor(Math.random()*it.length)];
    return sen?{
      big:'🔊',q:'اسمع الجملة واختر الصورة',say:x[0],o:opts(x[1],it.map(y=>y[1])),a:x[1]
    }:{
      big:'🔊',q:'اسمع واختر الكلمة المكتوبة',say:x[0],rw:1,o:opts(x[0],it.map(y=>y[0])),a:x[0]
    }
  }),sc=>rf(sc,5,3,'s'+i))
}

let RB=null;

function read2(){
  view='read';
  RB=read2;
  const ok=k=>S.rd[k],G='grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))';
  app.innerHTML='<h2>📗 معلّم القراءة — الجزء الثاني</h2><p class="q">دروس الكلمات ثم حكايات للقراءة</p><h3>🔤 دروس الكلمات</h3><div class="'+G+'">'+TS.map((r,i)=>{
    const lk=i>0&&!ok('t'+(i-1));
    return '<div class="card'+(lk?' lock':'')+'" data-t="'+i+'"><div class="E">'+(lk?'🔒':ok('t'+i)?'✅':'⭐')+'</div><small>'+r[0]+'</small></div>'
  }).join('')+'</div><h3>📖 حكايات للقراءة</h3><div class="'+G+'">'+HS.map((h,i)=>{
    const lk=!(i?ok('h'+(i-1)):ok('t'+(TS.length-1)));
    return '<div class="card'+(lk?' lock':'')+'" data-h="'+i+'"><div class="E">'+(lk?'🔒':h[1])+'</div><small>'+h[0]+(ok('h'+i)?' ✅':'')+'</small></div>'
  }).join('')+'</div><div class="row"><button class="btn" id="bk">↩️ الجزء الأول</button></div>';
  app.querySelectorAll('[data-t]').forEach(c=>c.onclick=()=>c.classList.contains('lock')?sfx.no():stg(TS[+c.dataset.t],'t'+c.dataset.t));
  app.querySelectorAll('[data-h]').forEach(c=>c.onclick=()=>c.classList.contains('lock')?sfx.no():story(+c.dataset.h));
  $('#bk').onclick=read
}

function stg(r,key){
  view='read';
  const o=r[3]==='o',it=r[2].split(o?';':',').map(x=>x.split('|'));
  app.innerHTML='<h2>'+r[0]+'</h2><p class="q">'+r[1]+'</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax('+(o?200:130)+'px,1fr))">'+it.map((x,j)=>'<div class="card" data-j="'+j+'"><div class="rw">'+(o?x[0]+' ↔ '+x[1]:x[0])+'</div></div>').join('')+'</div><p>اضغط على البطاقة لتسمعها 🔊</p><div class="row"><button class="btn" id="g">🎮 اختبرني</button> <button class="btn" id="bk">↩️ رجوع</button></div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    const x=it[c.dataset.j];
    sfx.pop();
    say(o?x[0]+'، وَعَكْسُهَا '+x[1]:x[0])
  });
  $('#bk').onclick=read2;
  const pool=it.flat(),mq=()=>{
    const x=it[Math.floor(Math.random()*it.length)],f=Math.random()<.5,a=f?x[0]:x[1],b=f?x[1]:x[0];
    return{
      big:'↔️',q:'ما عكس كلمة «'+a+'»؟',say:'ما عكس كلمة '+a,rw:1,o:opts(b,pool.filter(z=>z!==a)),a:b
    }
  },
  wq=()=>{
    const x=it[Math.floor(Math.random()*it.length)];
    return{
      big:'🔊',q:'اسمع واختر الكلمة المكتوبة',say:x[0],rw:1,o:opts(x[0],it.map(y=>y[0])),a:x[0]
    }
  };
  $('#g').onclick=()=>qz(Array.from({
    length:5
  },o?mq:wq),sc=>rf(sc,5,3,key))
}

function story(i){
  const h=HS[i],ss=h[2].split(';'),qs=h[3].split(';').map(x=>x.split('|'));
  view='read';
  app.innerHTML='<h2>'+h[1]+' '+h[0]+'</h2><div class="card" style="padding:14px;text-align:right;cursor:default">'+ss.map((s,j)=>'<p class="rw sn" data-j="'+j+'" style="margin:8px 0;cursor:pointer">'+s+'</p>').join('')+'</div><p>اضغط على أي جملة لتسمعها 🔊</p><div class="row"><button class="btn" id="pl">▶️ استمع للحكاية</button> <button class="btn" id="g">🎮 أسئلة</button> <button class="btn" id="bk">↩️ رجوع</button></div>';
  const P=[...app.querySelectorAll('.sn')],hl=j=>P.forEach((p,k)=>p.style.background=k===j?'#ffe066':'');
  P.forEach((p,j)=>p.onclick=()=>{
    sfx.pop();
    hl(j);
    say(ss[j],'ar-EG',()=>hl(-1))
  });
  $('#pl').onclick=()=>{
    let j=0;
    const nx=()=>{
      if(j<ss.length&&view==='read'&&P[j]&&P[j].isConnected){
        hl(j);
        say(ss[j++],'ar-EG',nx)
      } else hl(-1)
    };
    nx()
  };
  $('#bk').onclick=read2;
  $('#g').onclick=()=>qz(qs.map(q=>({
    big:h[1],q:q[0],say:q[0],o:shuf(q.slice(1)),a:q[1]
  })),sc=>rf(sc,qs.length,1,'h'+i))
}
