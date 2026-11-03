/* Letters, numbers, math basics: subject menu, learn cards and quizzes */
function sub(k){
  view=k;
  const j=SJ[k];
  app.innerHTML='<h1>'+j.t+'</h1><div class="grid"><button class="tile" style="background:'+j.c+'" id="l"><b>📖</b>تعلّم</button><button class="tile" style="background:#fd7e14" id="p"><b>🎮</b>العب</button></div>';
  $('#l').onclick=()=>learn(k);
  $('#p').onclick=()=>play(k)
}

function learn(k){
  const j=SJ[k],n=un(k);
  sfx.pop();
  app.innerHTML='<h2>'+j.t+' — المفتوح '+nm(n)+' من '+nm(j.d.length)+'</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">'+j.d.map((x,i)=>i<n?'<div class="card" data-i="'+i+'"><div class="L"'+(x[0].length>4?' style="font-size:20px"':'')+'>'+x[0]+'</div><div class="E">'+(k==='num'?x[2].repeat(x[3]):x[2])+'</div><small>'+x[1]+'</small></div>':'<div class="card lock"><div class="L">🔒</div></div>').join('')+'</div><p>العب وأجب صح لتفتح المزيد! 🔓</p><button class="btn" id="g">🎮 العب</button>';
  app.querySelectorAll('.card[data-i]').forEach(c=>c.onclick=()=>{
    const x=j.d[c.dataset.i];
    sfx.pop();
    c.style.transform='scale(1.15)';
    setTimeout(()=>c.style.transform='',250);
    k==='ar'?say('حرف '+AN[c.dataset.i]+'، '+x[1]):k==='en'?say(x[0]+'. '+x[1],'en-US'):k==='wd'||k==='sen'?say2(x[0],x[1]):say(x[1])
  });
  $('#g').onclick=()=>play(k)
}

function opts(c,pool){
  const s=new Set([c]);
  let t=0;
  while(s.size<3&&t++<99)s.add(pool[Math.floor(Math.random()*pool.length)]);
  return shuf([...s])
}

function mk(k){
  const j=SJ[k],r=S.rounds[k]||0;
  if(k==='math'){
    const mx=Math.min(9,3+r),sub=r>=2&&Math.random()<.5;
    let a=1+Math.floor(Math.random()*mx),b=1+Math.floor(Math.random()*mx);
    if(sub&&a<b)[a,b]=[b,a];
    const ans=sub?a-b:a+b;
    const pool=[];
    for(let i=0;i<=mx*2;i++)pool.push(i);
    return{
      big:'🍎'.repeat(a)+(sub?' ➖ ':' ➕ ')+'🍎'.repeat(b),q:nm(a)+(sub?' − ':' + ')+nm(b)+' = ؟',say:nm(a)+(sub?' ناقص ':' زائد ')+nm(b)+' يساوي كام',o:opts(ans,pool).map(x=>[x,nm(x)]),a:ans
    }
  }
  const n=un(k),w=Object.keys(S.err).filter(z=>z.indexOf(k+':')==0&&S.err[z]>0&&+z.split(':')[1]<n),ix=w.length&&Math.random()<.5?+w[Math.floor(Math.random()*w.length)].split(':')[1]:Math.floor(Math.random()*n),x=j.d[ix],id=k+':'+ix;
  if(k==='wd'||k==='sen'){
    const pl=j.d.slice(0,n);
    if(k==='wd'&&Math.random()<.5)return{
      id,big:x[2],q:'ما اسم هذه الصورة؟',say:'ما اسم هذه الصورة',o:opts(x[0],pl.map(y=>y[0])).map(y=>[y,y]),a:x[0]
    };
    return{
      id,big:'🔊',q:'اسمع واختر الصورة الصحيحة',say:x[0],o:opts(x[2],pl.map(y=>y[2])).map(y=>[y,y]),a:x[2]
    }
  }
  if(k==='num'){
    const pool=j.d.slice(0,n).map(y=>y[3]);
    return{
      id,big:x[2].repeat(x[3]),q:'كم عددها؟',say:'كم عددها',o:opts(x[3],pool).map(y=>[y,nm(y)]),a:x[3]
    }
  }
  const pool=j.d.slice(0,n).map(y=>y[0]);
  return{
    id,big:x[2],q:k==='ar'?'بأي حرف تبدأ كلمة «'+x[1]+'»؟':'«'+x[1]+'» تبدأ بحرف؟',say:k==='ar'?'بأي حرف تبدأ كلمة '+x[1]:x[1],o:opts(x[0],pool).map(y=>[y,y]),a:x[0],en:k==='en'
  }
}

function play(k){
  view=k;
  let i=0,sc=0,qs=Array.from({
    length:5
  },()=>mk(k));
  function show(){
    if(i>=5)return fin(k,sc);
    const q=qs[i];
    let first=true;
    app.innerHTML='<div class="pill">سؤال '+nm(i+1)+' / ٥</div><div class="big">'+q.big+'</div><div class="q">'+q.q+' 🔊</div><div class="opts">'+q.o.map(o=>'<button class="btn opt" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div>';
    const sp=()=>say(q.say,q.en?'en-US':'ar-SA');
    setTimeout(sp,300);
    app.querySelector('.q').onclick=sp;
    app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      if(b.dataset.v==q.a){
        b.classList.add('good');
        sfx.ok();
        setTimeout(praise,300);
        if(first){
          sc++;
          S.stars++;
          if(q.id&&S.err[q.id])S.err[q.id]--;
          S.days[today()]=1;
          save();
          hdr()
        }
        i++;
        app.querySelectorAll('.opt').forEach(x=>x.onclick=null);
        setTimeout(show,1500)
      } else{
        first=false;
        if(q.id)S.err[q.id]=(S.err[q.id]||0)+1;
        b.classList.add('bad');
        sfx.no()
      }
    })
  }
  show()
}

function fin(k,sc){
  let up='';
  if(sc>=3){
    S.rounds[k]=(S.rounds[k]||0)+1;
    save();
    up='<p class="q">🔓 فتحت مستوى جديدًا!</p>'
  }
  app.innerHTML='<div class="big">'+(sc>=3?'🏆':'💪')+'</div><h1>'+(sc>=3?'أحسنت يا بطل!':'حاول مرة أخرى!')+'</h1><div class="big" style="font-size:50px">'+'⭐'.repeat(sc)+'</div>'+up+'<div class="row"><button class="btn" id="a">🔁 مرة أخرى</button> <button class="btn" id="h">🏠 الرئيسية</button></div>';
  sfx.win();
  say(sc>=3?'برافو':'حاول مرة أخرى');
  hdr();
  $('#a').onclick=()=>play(k);
  $('#h').onclick=home
}
