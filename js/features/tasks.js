/* Daily tasks set by the parent */
function tasks(){
  view='tasks';
  const T=S.tasks||DT;
  if(!S.td||S.td.d!==today())S.td={
    d:today(),v:[]
  };
  const D=S.td;
  app.innerHTML='<h2>✅ مهامي اليوم</h2><p class="q">كل مهمة = ٢ ⭐ (بمساعدة بابا أو ماما)</p>'+T.map((t,i)=>'<button class="btn" style="display:block;margin:10px auto;width:90%;font-size:24px;'+(D.v.includes(i)?'background:#b2f2bb':'')+'" data-i="'+i+'">'+(D.v.includes(i)?'✅ ':'⬜ ')+esc(t)+'</button>').join('')+(D.v.length>=T.length?'<div class="big">🌟</div><h2>أنجزت كل المهام!</h2>':'');
  app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    if(!D.v.includes(i)){
      D.v.push(i);
      addStar(2);
      if(D.v.length===T.length){
        addStar(5);
        sfx.win();
        say('ما شاء الله، أنجزت كل مهامك')
      } else{
        sfx.ok();
        praise()
      }
      save();
      tasks()
    }
  })
}
