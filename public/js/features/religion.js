/* Duas and surah memorising */
function duas(){
  view='duas';
  const G='<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">';
  app.innerHTML='<h2>🤲 أدعية وقيم</h2>'+G+DU.map((d,i)=>'<div class="card" data-d="'+i+'"><div class="E">'+d[1]+'</div><small>'+d[0]+'</small></div>').join('')+'</div><h3>📖 سور قصيرة للحفظ</h3>'+G+SU2.map((d,i)=>'<div class="card" data-s="'+i+'"><div class="E">📖</div><small>'+d[0]+'</small></div>').join('')+'</div><p style="font-size:14px">يُفضّل أن يسمع الطفل القرآن من تلاوة صحيحة أو من والديه، ولذلك لا يستخدم الموقع الصوت الآلي مع السور.</p>';
  app.querySelectorAll('[data-d]').forEach(c=>c.onclick=()=>{
    const d=DU[c.dataset.d];
    app.innerHTML='<div class="big">'+d[1]+'</div><h2>'+d[0]+'</h2><div class="card rw" style="padding:16px;font-size:44px;cursor:default">'+d[2]+'</div><div class="row"><button class="btn" id="ds">🔊 اسمع</button> <button class="btn" id="db">↩️ رجوع</button></div>';
    $('#ds').onclick=()=>say(d[2]);
    $('#db').onclick=duas;
    say(d[2])
  });
  app.querySelectorAll('[data-s]').forEach(c=>c.onclick=()=>sura(+c.dataset.s))
}

function sura(i,lv){
  lv=lv||0;
  const d=SU2[i];
  let k=0;
  app.innerHTML='<h2>📖 '+d[0]+'</h2><div class="card rw" style="padding:16px;font-size:38px;line-height:2.2;cursor:default">'+d[1].split(';').map(a=>a.split(' ').map(w=>{
    const h=lv===1?k%3===2:lv===2?k%3!==0:lv===3;
    k++;
    return h?'<span class="hw" data-w="'+w+'" style="cursor:pointer;border-bottom:3px dashed #888">＿＿</span>':w
  }).join(' ')+' ۝').join('<br>')+'</div><div class="row">'+['كامل','أخفِ بعض الكلمات','أخفِ أكثر','أخفِ الكل'].map((t,j)=>'<button class="btn" data-l="'+j+'"'+(j===lv?' style="background:#ffd43b"':'')+'>'+t+'</button>').join(' ')+'</div><p style="font-size:14px">اضغط على ＿＿ لتظهر الكلمة</p><div class="row"><button class="btn" id="sd">✔ حفظتها</button> <button class="btn" id="sb">↩️ رجوع</button></div>';
  app.querySelectorAll('.hw').forEach(s=>s.onclick=()=>{
    s.outerHTML=s.dataset.w
  });
  app.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>sura(i,+b.dataset.l));
  $('#sd').onclick=()=>{
    if(!S.rd['q'+i]){
      S.rd['q'+i]=1;
      addStar(5)
    }
    sfx.win();
    say('ما شاء الله')
  };
  $('#sb').onclick=duas
}
