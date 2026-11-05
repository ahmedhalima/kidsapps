/* Memory card game */
function mem(){
  view='mem';
  const E=shuf(['🐶','🐱','🦁','🐼','🦄','🐙','🦋','🐳']).slice(0,6),cs=shuf([...E,...E]);
  let open=[],ok=0,busy=false;
  app.innerHTML='<h2>🧩 اعثر على الأزواج</h2><div class="mem">'+cs.map((c,i)=>'<button class="mc" data-i="'+i+'">❓</button>').join('')+'</div>';
  app.querySelectorAll('.mc').forEach(b=>b.onclick=()=>{
    if(busy||b.classList.contains('up'))return;
    b.classList.add('up');
    b.textContent=cs[b.dataset.i];
    sfx.pop();
    open.push(b);
    if(open.length==2){
      busy=true;
      const[a,c]=open;
      if(cs[a.dataset.i]===cs[c.dataset.i]){
        ok++;
        sfx.ok();
        open=[];
        busy=false;
        if(ok==6){
          S.stars+=5;
          save();
          hdr();
          sfx.win();
          say('برافو');
          setTimeout(()=>{
            app.insertAdjacentHTML('beforeend','<h2>🏆 +٥ نجوم!</h2><button class="btn" id="r">🔁 مرة أخرى</button>');
            $('#r').onclick=mem
          },500)
        }
      } else setTimeout(()=>{
        [a,c].forEach(x=>{
          x.classList.remove('up');
          x.textContent='❓'
        });
        sfx.no();
        open=[];
        busy=false
      },900)
    }
  })
}
