/* Interactive stories */
function istories(){
  view='ist';
  app.innerHTML='<h2>📚 قصص تفاعلية</h2><p class="q">أنت تختار ماذا يحدث!</p><div class="grid">'+IS.map((s,i)=>'<button class="tile" style="background:#7048e8" data-i="'+i+'"><b>'+s[1]+'</b>'+s[0]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>ist(+b.dataset.i,'a'))
}

function ist(i,k){
  view='ist';
  const s=IS[i],n=s[2][k],end=n.length===1;
  app.innerHTML='<div class="big">'+s[1]+'</div><div class="card" style="padding:16px;font-size:26px;text-align:right;cursor:default">'+n[0]+'</div><div class="row"><button class="btn" id="rd">🔊 اسمع</button></div><div class="opts">'+n.slice(1).map(c=>'<button class="btn" style="font-size:24px" data-n="'+c[1]+'">'+c[0]+'</button>').join('')+'</div>'+(end?'<h2>⭐ نهاية الحكاية</h2><div class="row"><button class="btn" id="ag">🔁 اختر طريقًا آخر</button> <button class="btn" id="bk">↩️ القصص</button></div>':'');
  const sp=()=>say(n[0]);
  setTimeout(sp,300);
  $('#rd').onclick=sp;
  app.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{
    sfx.pop();
    ist(i,b.dataset.n)
  });
  if(end){
    const key='i'+i+k;
    if(!S.rd[key]){
      S.rd[key]=1;
      addStar(2)
    }
    $('#ag').onclick=()=>ist(i,'a');
    $('#bk').onclick=istories
  }
}
