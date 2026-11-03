/* Fun games menu and action games (bubbles, mole, race...) */
function fun(){
  view='fun';
  if(goalLocked())return;
  const T=[['#339af0','🫧','فقاعات',bub],['#f76707','🔍','الشكل المختلف',odd],['#37b24d','🐮','أصوات الحيوانات',snd],['#e64980','🔢','رتّب الأرقام',ordg],['#7048e8','🌑','من صاحب الظل؟',shd],['#15aabf','🔤','أين الحرف؟',fl],['#f59f00','🐹','اضرب الخلد',mole],['#d6336c','🎨','تعلّم الألوان',colg],['#2f9e44','⚖️','أيهما أكثر؟',more],['#e8590c','🧩','رتّب الصورة',jig],['#364fc7','🐭','المتاهة',maze],['#c92a2a','🏁','سباق السيارات',race],['#0ca678','🧺','صنّف الأشياء',sortg],['#e64980','✏️','وصّل النقاط',dots],['#7950f2','🔤','فقاعات الحروف',bub2],['#1098ad','📝','رتّب الجملة',sentOrd]];
  app.innerHTML='<h2>🎈 ألعاب مرحة</h2><div class="grid">'+T.map((t,i)=>'<button class="tile" style="background:'+t[0]+'" data-i="'+i+'"><b>'+t[1]+'</b>'+t[2]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>T[b.dataset.i][3]())
}

function bub(){
  view='bub';
  const E=['🍎','🐟','🌟','🎈','🍌'],t=E[Math.floor(Math.random()*5)];
  let sc=0,n=0;
  say('فرقع كل '+({
    '🍎':'التفاح','🐟':'السمك','🌟':'النجوم','🎈':'البالونات','🍌':'الموز'
  })[t]);
  app.innerHTML='<h2>فرقع كل '+t+'</h2><div class="pill" id="bs">⭐ ٠</div><div id="bx" style="position:relative;height:380px;overflow:hidden;border-radius:24px;background:rgba(255,255,255,.35);margin-top:10px"></div>';
  const iv=setInterval(()=>{
    if(view!=='bub'||locked){
      clearInterval(iv);
      return
    }
    if(n++>=30){
      clearInterval(iv);
      const g=Math.min(5,Math.floor(sc/3));
      addStar(g);
      sfx.win();
      say('برافو');
      $('#bx').innerHTML='<div class="big">🎉</div><h2>جمعت '+nm(sc)+' (+'+nm(g)+' ⭐)</h2><button class="btn" id="r">🔁 مرة أخرى</button>';
      $('#r').onclick=bub;
      return
    }
    const b=document.createElement('button');
    b.className='bb';
    const e=Math.random()<.45?t:E[Math.floor(Math.random()*5)];
    b.textContent=e;
    b.style.left=Math.random()*80+'%';
    b.onclick=()=>{
      b.remove();
      if(e===t){
        sc++;
        sfx.ok();
        $('#bs').textContent='⭐ '+nm(sc)
      } else sfx.no()
    };
    $('#bx').appendChild(b);
    setTimeout(()=>b.remove(),5200)
  },700)
}

function snd(){
  view='snd';
  const A=[['🐶','هاو هاو'],['🐱','مياو'],['🐮','موو'],['🐑','ماع ماع'],['🦆','كواك كواك'],['🐓','كوكو كوكو'],['🦁','غرررر'],['🐴','ايهيهي']];
  app.innerHTML='<h2>اضغط على الحيوان واسمع صوته 🔊</h2><div class="grid">'+A.map((a,i)=>'<button class="tile" style="background:#74b816" data-i="'+i+'"><b>'+a[0]+'</b></button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    sfx.pop();
    say(A[b.dataset.i][1])
  })
}

function ordg(){
  view='ordg';
  let n=6;
  function s(){
    const a=shuf(Array.from({
      length:n
    },(_,i)=>i+1));
    let nx=1;
    app.innerHTML='<h2>اضغط الأرقام من الأصغر إلى الأكبر</h2><div class="mem" style="grid-template-columns:repeat(3,1fr)">'+a.map(x=>'<button class="mc" style="background:#7048e8" data-v="'+x+'">'+nm(x)+'</button>').join('')+'</div>';
    say('رتب الأرقام');
    app.querySelectorAll('.mc').forEach(b=>b.onclick=()=>{
      if(b.classList.contains('up'))return;
      if(+b.dataset.v===nx){
        b.classList.add('up');
        b.style.color='var(--ink)';
        sfx.ok();
        nx++;
        if(nx>n){
          addStar(n>6?2:1);
          sfx.win();
          say('برافو');
          n=Math.min(12,n+3);
          app.insertAdjacentHTML('beforeend','<h2>🎉 أحسنت!</h2><button class="btn" id="nx">▶️ التالي</button>');
          $('#nx').onclick=s
        }
      } else sfx.no()
    })
  }
  s()
}

function mole(){
  view='mole';
  let sc=0,n=0,up=-1;
  app.innerHTML='<h2>اضرب الخلد 🐹</h2><div class="pill" id="ms">⭐ ٠</div><div class="mem" style="grid-template-columns:repeat(3,1fr);max-width:360px;margin-top:10px">'+Array.from({
    length:9
  },()=>'<button class="mc" style="background:#8d6e63">🕳️</button>').join('')+'</div>';
  const B=[...app.querySelectorAll('.mc')];
  B.forEach((b,i)=>b.onclick=()=>{
    if(i===up){
      sc++;
      up=-1;
      b.textContent='💥';
      sfx.ok();
      $('#ms').textContent='⭐ '+nm(sc)
    }
  });
  const iv=setInterval(()=>{
    if(view!=='mole'||locked){
      clearInterval(iv);
      return
    }
    if(up>=0)B[up].textContent='🕳️';
    if(n++>=25){
      clearInterval(iv);
      const g=Math.floor(sc/3);
      addStar(g);
      sfx.win();
      app.insertAdjacentHTML('beforeend','<h2>🎉 '+nm(sc)+' (+'+nm(g)+' ⭐)</h2><button class="btn" id="r">🔁 مرة أخرى</button>');
      $('#r').onclick=mole;
      return
    }
    up=rnd(9);
    B[up].textContent='🐹';
    sfx.pop()
  },850)
}

function bub2(){
  view='bub2';
  const L='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),t=pk(L);
  let sc=0,n=0;
  say('فرقع حرف '+AN[ABJ.indexOf(t)]);
  app.innerHTML='<h2>فرقع كل حرف «'+t+'» 🫧</h2><div class="pill" id="bs">⭐ ٠</div><div id="bx" style="position:relative;height:380px;overflow:hidden;border-radius:24px;background:rgba(255,255,255,.35);margin-top:10px"></div>';
  const iv=setInterval(()=>{
    if(view!=='bub2'||locked){
      clearInterval(iv);
      return
    }
    if(n++>=30){
      clearInterval(iv);
      const g=Math.min(5,Math.floor(sc/3));
      addStar(g);
      sfx.win();
      say('برافو');
      $('#bx').innerHTML='<div class="big">🎉</div><h2>جمعت '+nm(sc)+' (+'+nm(g)+' ⭐)</h2><button class="btn" id="r">🔁 مرة أخرى</button>';
      $('#r').onclick=bub2;
      return
    }
    const b=document.createElement('button');
    b.className='bb';
    const e=Math.random()<.4?t:pk(L);
    b.textContent=e;
    b.style.left=Math.random()*80+'%';
    b.onclick=()=>{
      b.remove();
      if(e===t){
        sc++;
        sfx.ok();
        $('#bs').textContent='⭐ '+nm(sc)
      } else sfx.no()
    };
    $('#bx').appendChild(b);
    setTimeout(()=>b.remove(),5200)
  },700)
}

function race(){
  view='race';
  let me=0,cp=0,done=false;
  const TOT=10;
  app.innerHTML='<h2>🏁 سباق السيارات</h2><div id="tr" style="text-align:right"></div><div id="rq"></div>';
  const tr=()=>{
    $('#tr').innerHTML='<div>🚗 أنت: <progress value="'+me+'" max="'+TOT+'" style="width:60%"></progress></div><div>🚙 المنافس: <progress value="'+cp+'" max="'+TOT+'" style="width:60%"></progress></div>'
  };
  const end=w=>{
    done=true;
    clearInterval(iv);
    addStar(w?3:1);
    sfx.win();
    say(w?'فزت بالسباق':'حاول مرة أخرى');
    $('#rq').innerHTML='<div class="big">'+(w?'🏆':'🚙')+'</div><h2>'+(w?'فزت! +٣ ⭐':'فاز المنافس، +١ ⭐')+'</h2><button class="btn" id="ra">🔁 سباق جديد</button>';
    $('#ra').onclick=race
  };
  const nq=()=>{
    if(done)return;
    const q=mk(pk(['ar','num','math']));
    $('#rq').innerHTML='<div class="big">'+q.big+'</div><div class="q">'+q.q+' 🔊</div><div class="opts">'+q.o.map(o=>'<button class="btn opt" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div>';
    say(q.say);
    $('#rq').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      if(b.dataset.v==q.a){
        sfx.ok();
        me++;
        tr();
        if(me>=TOT)return end(true);
        nq()
      } else{
        sfx.no();
        b.classList.add('bad')
      }
    })
  };
  const iv=setInterval(()=>{
    if(view!=='race'||done){
      clearInterval(iv);
      return
    }
    cp++;
    tr();
    if(cp>=TOT)end(false)
  },4000);
  tr();
  nq()
}
