/* Breathing and relaxation */
function calm(){
  view='calm';
  let n=0,ph=0;
  app.innerHTML='<h2>🌬️ استرخاء</h2><p class="q">تنفّس معي ببطء</p><div style="height:260px;display:flex;align-items:center;justify-content:center"><div id="bl" style="width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#a5d8ff,#4dabf7);animation:br 8s ease-in-out infinite;display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;font-weight:800">شهيق</div></div><div class="pill" id="cn">٠ / ٥</div>';
  say('خذ شهيقا ببطء');
  const iv=setInterval(()=>{
    if(view!=='calm'){
      clearInterval(iv);
      return
    }
    ph++;
    const b=$('#bl');
    if(!b){
      clearInterval(iv);
      return
    }
    if(ph%2){
      b.textContent='زفير';
      say('زفير')
    } else{
      b.textContent='شهيق';
      say('شهيق');
      n++;
      $('#cn').textContent=nm(n)+' / ٥';
      if(n>=5){
        clearInterval(iv);
        addStar(2);
        sfx.win();
        say('أحسنت، أنت هادئ الآن')
      }
    }
  },4000)
}
