/* English topics and quizzes */
function english(){
  view='eng';
  app.innerHTML='<h2>🇬🇧 English</h2><div class="grid">'+ENT.map((t,i)=>'<button class="tile" style="background:#4c6ef5" data-i="'+i+'"><b>'+t[1]+'</b>'+t[0]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>engT(+b.dataset.i))
}

function engT(i){
  view='eng';
  const t=ENT[i],it=t[2].split(';').map(x=>x.split(','));
  app.innerHTML='<h2 dir="ltr">'+t[0]+'</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">'+it.map((x,j)=>'<div class="card" data-j="'+j+'" dir="ltr"><div class="E" style="font-size:44px">'+x[1]+'</div><div class="L" style="font-size:'+(x[0].length>8?'18':'28')+'px">'+x[0]+'</div></div>').join('')+'</div><div class="row"><button class="btn" id="g">🎮 Quiz</button></div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    sfx.pop();
    say(it[c.dataset.j][0],'en-US')
  });
  $('#g').onclick=()=>qz(Array.from({
    length:5
  },()=>{
    const x=pk(it);
    return Math.random()<.5?{
      big:'🔊',q:'Listen and choose',say:x[0],en:1,o:opts(x[1],it.map(y=>y[1])),a:x[1]
    }:{
      big:x[1],q:'What is this?',say:'What is this?',en:1,o:opts(x[0],it.map(y=>y[0])),a:x[0]
    }
  }),sc=>fz(sc,5,()=>engT(i)))
}
