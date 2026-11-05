/* Generic multiple-choice quiz engine and result screen */
function qz(qs,fin){
  let i=0,sc=0;
  function s(){
    if(i>=qs.length)return fin(sc);
    const q=qs[i];
    let f=1;
    app.innerHTML='<div class="pill">سؤال '+nm(i+1)+' / '+nm(qs.length)+'</div><div class="big">'+q.big+'</div><div class="q">'+q.q+' 🔊</div><div class="opts">'+q.o.map(o=>'<button class="btn opt'+(q.rw?' rw':'')+'" data-v="'+o+'">'+o+'</button>').join('')+'</div>';
    const sp=()=>say(q.say,q.en?'en-US':'ar-SA');
    setTimeout(sp,300);
    app.querySelector('.q').onclick=sp;
    app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      if(b.dataset.v===q.a){
        b.classList.add('good');
        sfx.ok();
        setTimeout(praise,300);
        if(f){
          sc++;
          S.stars++;
          S.days[today()]=1;
          save();
          hdr()
        }
        i++;
        app.querySelectorAll('.opt').forEach(x=>x.onclick=null);
        setTimeout(s,1500)
      } else{
        f=0;
        b.classList.add('bad');
        sfx.no()
      }
    })
  }
  s()
}

function fz(sc,tot,again){
  S.days[today()]=1;
  save();
  app.innerHTML='<div class="big">'+(sc>=tot*.6?'🏆':'💪')+'</div><h1>'+nm(sc)+' / '+nm(tot)+'</h1><div class="big" style="font-size:44px">'+'⭐'.repeat(Math.min(sc,8))+'</div><div class="row"><button class="btn" id="fa">🔁 مرة أخرى</button> <button class="btn" id="fh">🏠 الرئيسية</button></div>';
  sfx.win();
  say(sc>=tot*.6?'أحسنت':'حاول مرة أخرى');
  $('#fa').onclick=again;
  $('#fh').onclick=home
}
