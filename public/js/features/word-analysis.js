/* Break words into letters */
const lnm=c=>c==='ة'?'التاء المربوطة':c==='ئ'||c==='ء'?'الهمزة':AN[ABJ.indexOf(c)]||c;

function anl(){
  view='anl';
  app.innerHTML='<h2>🔬 حلّل الكلمات</h2><p class="q">اختر كلمة لنفككها إلى حروفها</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">'+WD.map((w,i)=>'<div class="card" data-i="'+i+'"><div class="E">'+w[2]+'</div><div class="L" style="font-size:28px">'+w[0]+'</div></div>').join('')+'</div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>anl1(WD[c.dataset.i]))
}

function anl1(w){
  view='anl';
  const L=w[0].split('');
  app.innerHTML='<div class="big">'+w[2]+'</div><h2 class="rw" style="font-size:54px">'+w[0]+'</h2><div class="row" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">'+L.map((c,i)=>'<button class="btn" style="font-size:40px;min-width:64px" data-i="'+i+'">'+c+'</button>').join('')+'</div><p class="q">عدد الحروف: '+nm(L.length)+' — أول حرف: '+L[0]+' — آخر حرف: '+L[L.length-1]+'</p><div class="row"><button class="btn" id="aw">🔊 الكلمة</button> <button class="btn" id="ag">🧩 ركّب الكلمة</button> <button class="btn" id="aq">❓ اختبار</button></div>';
  app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
    sfx.pop();
    say('حرف '+lnm(L[b.dataset.i]))
  });
  $('#aw').onclick=()=>say(w[0]);
  $('#ag').onclick=()=>{
    let k=0;
    const sh=shuf(L.map((c,i)=>[c,i]));
    app.innerHTML='<div class="big">'+w[2]+'</div><div class="pill" id="tg" style="font-size:44px;min-width:160px;display:inline-block;min-height:64px">&nbsp;</div><p class="q">اضغط الحروف بالترتيب الصحيح</p><div class="row" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">'+sh.map(x=>'<button class="btn" style="font-size:40px;min-width:64px" data-c="'+x[0]+'">'+x[0]+'</button>').join('')+'</div>';
    let cur='';
    app.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
      if(b.dataset.c===L[k]&&!b.disabled){
        b.disabled=true;
        b.style.opacity=.3;
        cur+=L[k];
        k++;
        $('#tg').textContent=cur;
        sfx.ok();
        if(k===L.length){
          sfx.win();
          say(w[0]);
          addStar(2);
          app.insertAdjacentHTML('beforeend','<h2>🎉 أحسنت +٢ ⭐</h2><button class="btn" id="bk2">↩️ كلمات أخرى</button>');
          $('#bk2').onclick=anl
        }
      } else if(!b.disabled)sfx.no()
    })
  };
  $('#aq').onclick=()=>qz([{
    big:w[2],q:'كم حرفًا في كلمة «'+w[0]+'»؟',say:'كم حرفا في كلمة '+w[0],o:opts(nm(L.length),[2,3,4,5,6].filter(x=>x!==L.length).map(nm)),a:nm(L.length)
  },{
    big:w[2],q:'ما أول حرف في «'+w[0]+'»؟',say:'ما أول حرف في كلمة '+w[0],o:opts(L[0],'ابتجدرسملنو'.split('').filter(x=>x!==L[0])),a:L[0]
  },{
    big:w[2],q:'ما آخر حرف في «'+w[0]+'»؟',say:'ما آخر حرف في كلمة '+w[0],o:opts(L[L.length-1],'ابتجدرسملنوة'.split('').filter(x=>x!==L[L.length-1])),a:L[L.length-1]
  }],sc=>fz(sc,3,()=>anl1(w)))
}
