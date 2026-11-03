/* Riddles, patterns and memory puzzles */
function puz(){
  view='puz';
  const T=[['#7950f2','🤔','ألغاز ذكية',riddle],['#e8590c','🧐','الشيء الغريب',oddout],['#12b886','🔁','أكمل النمط',pattern],['#f03e3e','👀','ما الذي اختفى؟',vanish],['#1c7ed6','🎵','كرّر التسلسل',simon]];
  app.innerHTML='<h2>🧩 ألغاز الذكاء والذاكرة</h2><div class="grid">'+T.map((t,i)=>'<button class="tile" style="background:'+t[0]+'" data-i="'+i+'"><b>'+t[1]+'</b>'+t[2]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>T[b.dataset.i][3]())
}

function riddle(){
  qz(shuf(RID.slice()).slice(0,5).map(r=>{
    const s=r.split('|');
    return{
      big:'🤔',q:s[0],say:s[0],o:shuf(s.slice(1)),a:s[1]
    }
  }),sc=>fz(sc,5,riddle))
}

function oddout(){
  qz(Array.from({
    length:5
  },()=>{
    const[a,b]=shuf(CAT.slice()).slice(0,2),g=shuf(a.slice()).slice(0,3),x=pk(b);
    return{
      big:'🧐',q:'أيها لا ينتمي للمجموعة؟',say:'أيها لا ينتمي للمجموعة',o:shuf([...g,x]),a:x
    }
  }),sc=>fz(sc,5,oddout))
}

function pattern(){
  qz(Array.from({
    length:5
  },()=>{
    const e=shuf(['🔴','🔵','🟡','🟢','⭐','🍎','🐟','🌸']).slice(0,3),u=pk(['AB','AAB','ABC']).split('').map(c=>e['ABC'.indexOf(c)]),s=Array.from({
      length:7
    },(_,i)=>u[i%u.length]);
    return{
      big:s.slice(0,6).join(' ')+' ❓',q:'ما الشكل التالي في النمط؟',say:'ما الشكل التالي في النمط',o:opts(s[6],e.concat(['🔶'])),a:s[6]
    }
  }),sc=>fz(sc,5,pattern))
}

function vanish(){
  view='vn';
  const E=shuf(['🐶','🐱','🐘','🦁','🐴','🐰','🦆','🐟','🍎','🚗','⚽','🌳']),S6=E.slice(0,6),miss=pk(S6);
  let t=5;
  app.innerHTML='<h2>تذكّر هذه الأشياء 👀</h2><div class="big" style="font-size:56px">'+S6.join(' ')+'</div><div class="pill" id="tm">٥</div>';
  say('تذكر هذه الأشياء');
  const iv=setInterval(()=>{
    if(view!=='vn'){
      clearInterval(iv);
      return
    }
    t--;
    $('#tm').textContent=nm(t);
    if(t<=0){
      clearInterval(iv);
      app.innerHTML='<h2>ما الذي اختفى؟ 🤔</h2><div class="big" style="font-size:56px">'+S6.filter(x=>x!==miss).join(' ')+'</div><div class="opts">'+shuf([miss,E[6],E[7]]).map(x=>'<button class="btn opt" data-v="'+x+'">'+x+'</button>').join('')+'</div>';
      say('ما الذي اختفى');
      app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        if(b.dataset.v===miss){
          sfx.win();
          addStar(2);
          say('أحسنت');
          b.classList.add('good');
          setTimeout(vanish,1500)
        } else{
          sfx.no();
          b.classList.add('bad')
        }
      })
    }
  },1000)
}

function simon(){
  view='sim';
  const C=['#ff6b6b','#51cf66','#4dabf7','#ffd43b'],F=[262,330,392,523];
  let seq=[],pos=0,busy=true;
  app.innerHTML='<h2>🎵 كرّر التسلسل</h2><div class="pill" id="sl">المستوى ١</div><div class="mem" style="grid-template-columns:1fr 1fr;max-width:300px;margin:12px auto">'+C.map(c=>'<button class="mc" style="background:'+c+';opacity:.55"></button>').join('')+'</div>';
  const B=[...app.querySelectorAll('.mc')],fq=i=>{
    B[i].style.opacity=1;
    tone(F[i],.3,'sine',.25);
    setTimeout(()=>B[i].style.opacity=.55,350)
  };
  const pl=()=>{
    busy=true;
    pos=0;
    seq.push(rnd(4));
    $('#sl').textContent='المستوى '+nm(seq.length);
    seq.forEach((x,k)=>setTimeout(()=>fq(x),700+k*600));
    setTimeout(()=>busy=false,700+seq.length*600)
  };
  B.forEach((b,i)=>b.onclick=()=>{
    if(busy)return;
    fq(i);
    if(i===seq[pos]){
      pos++;
      if(pos===seq.length){
        if(seq.length>=3)addStar(1);
        busy=true;
        sfx.ok();
        setTimeout(pl,900)
      }
    } else{
      sfx.no();
      busy=true;
      say('حاول مرة أخرى');
      app.insertAdjacentHTML('beforeend','<div class="row"><button class="btn" id="r">🔁 مرة أخرى</button></div>');
      $('#r').onclick=simon
    }
  });
  setTimeout(pl,600)
}
