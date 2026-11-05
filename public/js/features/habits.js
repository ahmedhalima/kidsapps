/* Good habits and daily habit checklist */
const hb=()=>{
  if(S.hab.d!==today())S.hab={
    d:today(),v:[],q:[]
  };
  return S.hab
};

function habits(){
  view='hab';
  app.innerHTML='<h2>🌈 عادات جميلة</h2><p class="q">اختر عادة واستمع للقصة ثم أجب</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">'+HB.map((h,i)=>'<div class="card" data-i="'+i+'"><div class="L">'+h[0]+'</div><small>'+h[1]+'</small></div>').join('')+'</div><div class="row"><button class="btn" id="ck">📋 عاداتي اليوم</button></div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>hab(+c.dataset.i));
  $('#ck').onclick=chk
}

function hab(i){
  const h=HB[i];
  sfx.pop();
  app.innerHTML='<div class="big">'+h[0]+'</div><h2>'+h[1]+'</h2><p class="q">'+h[2]+'</p><button class="btn" id="sp">🔊 اسمع</button><p class="q" style="margin-top:20px">🤔 '+h[3]+'</p><div class="opts">'+shuf([[h[4],1],[h[5],0]]).map(o=>'<button class="btn" style="font-size:24px" data-g="'+o[1]+'">'+o[0]+'</button>').join('')+'</div><div id="tp" class="q" style="margin-top:16px"></div>';
  const sp=()=>say(h[2]+' ... '+h[3]);
  setTimeout(sp,300);
  $('#sp').onclick=sp;
  app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{
    if(b.dataset.g==='1'){
      b.classList.add('good');
      sfx.ok();
      const H=hb();
      let m='';
      if(!H.q.includes(i)){
        H.q.push(i);
        addStar(2);
        m='+٢ ⭐'
      }
      setTimeout(praise,300);
      $('#tp').innerHTML='✅ أحسنت '+m+'<br><small>💬 نقاش مع بابا: لماذا هذا مهم؟ ومتى فعلت ذلك؟</small><br><button class="btn" id="bk">رجوع</button>';
      $('#bk').onclick=habits
    } else{
      b.classList.add('bad');
      sfx.no();
      say('فكّر مرة أخرى')
    }
  })
}

function chk(){
  view='hab';
  const H=hb();
  app.innerHTML='<h2>📋 عاداتي اليوم</h2><p>(بمساعدة بابا أو ماما)</p>'+DL.map((d,i)=>'<button class="btn" style="display:block;margin:10px auto;width:90%;font-size:24px;'+(H.v.includes(i)?'background:#b2f2bb':'')+'" data-i="'+i+'">'+(H.v.includes(i)?'✅ ':'⬜ ')+d+'</button>').join('')+(H.v.length==5?'<div class="big">🌟</div>':'')+'<div class="row"><button class="btn" id="bk">رجوع</button></div>';
  app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    if(!H.v.includes(i)){
      H.v.push(i);
      addStar(1);
      if(H.v.length==5){
        addStar(3);
        sfx.win();
        say('ما شاء الله أنت بطل')
      } else{
        sfx.ok();
        praise()
      }
    }
    chk()
  });
  $('#bk').onclick=habits
}
