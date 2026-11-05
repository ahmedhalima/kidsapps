/* Make-it-yourself: paint studio, character, sentence and word builders */
function diy(){
  view='diy';
  const T=[['#e64980','🎨','استوديو الرسم',paint],['#f76707','🦁','اصنع شخصيتك',chara],['#15aabf','📝','اصنع جملتك',sentm],['#37b24d','✍️','ركّب كلمتك',wordb]];
  app.innerHTML='<h2>🛠️ اصنع بنفسك</h2><div class="grid">'+T.map((t,i)=>'<button class="tile" style="background:'+t[0]+'" data-i="'+i+'"><b>'+t[1]+'</b>'+t[2]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>T[b.dataset.i][3]())
}

async function saveCv(c,btn){
  try{
    const b=await new Promise(r=>c.toBlob(r,'image/png'));
    if(await saveFile(b,'my-drawing.png')){sfx.ok();say('تم الحفظ')}
  } catch(e){sfx.no();btn.textContent='⚠️ تعذّر الحفظ'}
}

function paint(){
  view='paint';
  let col='#ff6b6b',sz=6,st='',er=false;
  const C=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac','#a0522d','#212529'],ST=['⭐','🌸','🐱','🐶','🌳','☀️','🏠','🚗','🦋','❤️'];
  app.innerHTML='<h2>🎨 استوديو الرسم</h2><div class="pal">'+C.map(c=>'<div class="sw" style="background:'+c+'" data-c="'+c+'"></div>').join('')+'</div><div class="pal"><button class="btn" data-z="4">✏️ رفيع</button><button class="btn" data-z="12">🖌️ سميك</button><button class="btn" data-z="e">🧽 ممحاة</button></div><div class="pal">'+ST.map(s=>'<button class="btn" data-s="'+s+'">'+s+'</button>').join('')+'</div><canvas id="cv" width="600" height="420" style="width:100%;max-width:600px;background:#fff;border-radius:20px;touch-action:none"></canvas><div class="row"><button class="btn" id="cl">🗑️ مسح</button> <button class="btn" id="sv3">💾 احفظ</button></div>';
  const cv=$('#cv'),cx=cv.getContext('2d');
  cx.fillStyle='#fff';
  cx.fillRect(0,0,600,420);
  cx.lineCap='round';
  cx.lineJoin='round';
  let dr=false;
  const pt=e=>{
    const r=cv.getBoundingClientRect();
    return[(e.clientX-r.left)*600/r.width,(e.clientY-r.top)*420/r.height]
  };
  cv.onpointerdown=e=>{
    cv.setPointerCapture(e.pointerId);
    const[x,y]=pt(e);
    if(st){
      cx.font='64px serif';
      cx.textAlign='center';
      cx.textBaseline='middle';
      cx.fillText(st,x,y);
      sfx.pop();
      return
    }
    dr=true;
    cx.strokeStyle=er?'#fff':col;
    cx.lineWidth=er?26:sz;
    cx.beginPath();
    cx.moveTo(x,y);
    cx.lineTo(x+.1,y+.1);
    cx.stroke()
  };
  cv.onpointermove=e=>{
    if(!dr)return;
    const[x,y]=pt(e);
    cx.lineTo(x,y);
    cx.stroke()
  };
  cv.onpointerup=cv.onpointerleave=()=>{
    dr=false
  };
  app.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
    col=b.dataset.c;
    er=false;
    st='';
    sfx.pop()
  });
  app.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{
    st='';
    const z=b.dataset.z;
    if(z==='e')er=true;
    else{
      er=false;
      sz=+z
    }
    sfx.pop()
  });
  app.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
    st=b.dataset.s;
    sfx.pop()
  });
  $('#cl').onclick=()=>{
    cx.fillStyle='#fff';
    cx.fillRect(0,0,600,420)
  };
  $('#sv3').onclick=()=>{
    addStar(1);
    saveCv(cv,$('#sv3'))
  }
}

function chara(){
  view='chara';
  const A=[['🐱','قطة',1],['🐶','كلب',0],['🦁','أسد',0],['🐰','أرنب',0],['🐼','باندا',0],['🐸','ضفدع',0]],H=[['','بدون قبعة'],['🎩','قبعة'],['👑','تاجًا'],['🎓','قبعة التخرج'],['🧢','كاب']],I=[['','بدون شيء'],['⚽','كرة'],['📖','كتابًا'],['🎈','بالونًا'],['🌹','وردة'],['🎨','ألوانًا']];
  let a=0,h=1,it=1;
  const dr=()=>{
    const x=A[a],f=x[2];
    app.innerHTML='<h2>🦁 اصنع شخصيتك</h2><div style="position:relative;display:inline-block;font-size:130px;margin:50px 40px 20px">'+x[0]+'<span style="position:absolute;top:-45px;left:50%;transform:translateX(-50%);font-size:70px">'+H[h][0]+'</span><span style="position:absolute;bottom:-10px;right:-45px;font-size:60px">'+I[it][0]+'</span></div><div class="row"><button class="btn" data-w="a">🔄 الشخصية</button> <button class="btn" data-w="h">🔄 القبعة</button> <button class="btn" data-w="i">🔄 الشيء</button></div><div class="row"><button class="btn" id="sy">🔊 احكِ عنها</button></div>';
    app.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{
      const w=b.dataset.w;
      if(w==='a')a=(a+1)%A.length;
      else if(w==='h')h=(h+1)%H.length;
      else it=(it+1)%I.length;
      sfx.pop();
      dr()
    });
    $('#sy').onclick=()=>say((f?'هذه ':'هذا ')+x[1]+(H[h][0]?(f?' تلبس ':' يلبس ')+H[h][1]:'')+(I[it][0]?(f?' وتحمل ':' ويحمل ')+I[it][1]:'')+'. ما أجمله!')
  };
  dr()
}

function sentm(){
  view='sm';
  const SU=[['الْوَلَدُ',0,'👦'],['الْبِنْتُ',1,'👧'],['الْقِطَّةُ',1,'🐱'],['الْكَلْبُ',0,'🐶']],AC=[['يَأْكُلُ|تَأْكُلُ','🍽️',[['تُفَّاحَةً','🍎'],['مَوْزَةً','🍌'],['خُبْزًا','🍞']]],['يَقْرَأُ|تَقْرَأُ','📖',[['كِتَابًا','📖'],['قِصَّةً','📚']]],['يَلْعَبُ|تَلْعَبُ','🎮',[['بِالْكُرَةِ','⚽'],['بِالدُّمْيَةِ','🧸']]],['يَشْرَبُ|تَشْرَبُ','🥤',[['لَبَنًا','🥛'],['مَاءً','💧']]]];
  let s=0,a=0,o=0;
  const dr=()=>{
    const sn=SU[s][0]+' '+AC[a][0].split('|')[SU[s][1]]+' '+AC[a][2][o][0]+'.';
    app.innerHTML='<h2>📝 اصنع جملتك</h2><div class="big" style="font-size:64px">'+SU[s][2]+' '+AC[a][1]+' '+AC[a][2][o][1]+'</div><div class="card rw" id="sn" style="padding:16px;font-size:40px">'+sn+'</div><p>اضغط على الجملة لتسمعها 🔊</p><div class="row"><button class="btn" data-w="s">🔄 مَنْ؟</button> <button class="btn" data-w="a">🔄 ماذا يفعل؟</button> <button class="btn" data-w="o">🔄 ماذا؟</button></div>';
    app.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{
      const w=b.dataset.w;
      if(w==='s')s=(s+1)%SU.length;
      else if(w==='a'){
        a=(a+1)%AC.length;
        o=0
      } else o=(o+1)%AC[a][2].length;
      sfx.pop();
      dr()
    });
    $('#sn').onclick=()=>say(sn)
  };
  dr()
}

function wordb(){
  view='wb';
  let w='';
  const L='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
  app.innerHTML='<h2>✍️ ركّب كلمتك</h2><div class="pill" id="wd" style="min-width:160px;display:inline-block;font-size:48px;min-height:70px">&nbsp;</div><div id="we" class="big"></div><div class="row"><button class="btn" id="wr">🔊 اقرأ</button> <button class="btn" id="wb2">⌫</button> <button class="btn" id="wc">🗑️</button></div><div class="opts" style="gap:8px">'+L.map(x=>'<button class="btn" style="font-size:30px;min-width:60px" data-v="'+x+'">'+x+'</button>').join('')+'</div>';
  const up=()=>{
    $('#wd').innerHTML=w||'&nbsp;';
    const f=WD.find(x=>x[0]===w);
    $('#we').textContent=f?f[2]:'';
    if(f){
      sfx.win();
      say(w);
      if(!S.wf)S.wf={};
      if(!S.wf[w]){
        S.wf[w]=1;
        addStar(1)
      }
    }
  };
  app.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{
    if(w.length<8){
      w+=b.dataset.v;
      sfx.pop();
      up()
    }
  });
  $('#wb2').onclick=()=>{
    w=w.slice(0,-1);
    up()
  };
  $('#wc').onclick=()=>{
    w='';
    up()
  };
  $('#wr').onclick=()=>say(w||'اكتب كلمة')
}
