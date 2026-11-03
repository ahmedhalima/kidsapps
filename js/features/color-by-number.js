/* Color by number */
const CBN=[['❤️',['00000000','01100110','11211111','11111111','11111111','01111110','00111100','00011000']],['🏠',['00011000','00111100','01111110','11111111','22222222','24222242','22255222','33355333']],['🌳',['00033000','00333300','03333330','33333333','03333330','00055000','00055000','00055000']]];

const CC={
  1:'#ff6b6b',2:'#ffd43b',3:'#51cf66',4:'#4dabf7',5:'#a0522d'
};

function cbn(){
  view='cbn';
  const p=pk(CBN),G=p[1],all=G.join('');
  let cur=1,done=0;
  const total=all.replace(/0/g,'').length,fl=new Set();
  const dr=()=>{
    app.innerHTML='<h2>لوّن بالأرقام 🎨</h2><div class="pal">'+[1,2,3,4,5].filter(c=>all.includes(c)).map(c=>'<button class="btn" style="font-size:26px;background:'+CC[c]+';color:#222;'+(cur===c?'outline:4px solid #333':'')+'" data-c="'+c+'">'+nm(c)+'</button>').join('')+'</div><p class="q">اختر لونًا ثم اضغط المربعات التي تحمل رقمه</p><div dir="ltr" style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-width:340px;margin:auto">'+G.map((r,y)=>r.split('').map((c,x)=>{
      const k=y*8+x,on=fl.has(k);
      return '<div data-k="'+k+'" data-v="'+c+'" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;border-radius:4px;cursor:pointer;background:'+(c==='0'?'transparent':on?CC[c]:'#e9ecef')+';color:#555">'+(c==='0'||on?'':nm(+c))+'</div>'
    }).join('')).join('')+'</div>'+(done>=total?'<div class="big">'+p[0]+'</div><h2>🎉 ممتاز! +٣ ⭐</h2><button class="btn" id="nx">▶️ صورة جديدة</button>':'');
    if(done>=total){
      sfx.win();
      say('أحسنت');
      addStar(3);
      $('#nx').onclick=cbn;
      return
    }
    app.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
      cur=+b.dataset.c;
      sfx.pop();
      dr()
    });
    app.querySelectorAll('[data-k]').forEach(c=>c.onclick=()=>{
      const v=c.dataset.v;
      if(v==='0')return;
      if(+v===cur){
        if(!fl.has(+c.dataset.k)){
          fl.add(+c.dataset.k);
          done++;
          sfx.pop();
          dr()
        }
      } else sfx.no()
    })
  };
  dr()
}
