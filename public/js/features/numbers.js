/* Big numbers 1-100 and number games */
function nums(){
  view='nums';
  const G=[['ba','⏮️','قبل وبعد'],['bg','⚔️','الأكبر'],['sk','🦘','العد بالقفز'],['pv','🔟','العشرات'],['hr','🔊','اسمع واختر']];
  app.innerHTML='<h2>🔢 الأرقام الكبيرة</h2><div class="grid"><button class="tile" style="background:#51cf66" data-a="1"><b>١–٢٠</b>تعلّم</button><button class="tile" style="background:#20c997" data-a="21"><b>٢١–٥٠</b>تعلّم</button><button class="tile" style="background:#339af0" data-a="51"><b>٥١–١٠٠</b>تعلّم</button></div><h3>🎮 ألعاب الأرقام</h3><div class="grid">'+G.map(g=>'<button class="tile" style="background:#f76707" data-g="'+g[0]+'"><b>'+g[1]+'</b>'+g[2]+'</button>').join('')+'</div>';
  app.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>numLearn(+b.dataset.a));
  app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>numGame(b.dataset.g))
}

function numLearn(a){
  view='nums';
  const z=a===1?20:a===21?50:100;
  app.innerHTML='<h2>الأرقام من '+nm(a)+' إلى '+nm(z)+'</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr))">'+Array.from({
    length:z-a+1
  },(_,i)=>{
    const n=a+i;
    return '<div class="card" data-n="'+n+'"><div class="L">'+nm(n)+'</div><small>'+nw(n)+'</small></div>'
  }).join('')+'</div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    sfx.pop();
    say(nw(+c.dataset.n))
  })
}

function numGame(t){
  const q=()=>{
    const n=2+rnd(97);
    if(t==='ba'){
      const af=Math.random()<.5,a=af?n+1:n-1;
      return{
        big:nm(n),q:'ما العدد الذي يأتي '+(af?'بعد':'قبل')+' '+nm(n)+'؟',say:'ما العدد الذي يأتي '+(af?'بعد ':'قبل ')+nw(n),o:opts(nm(a),[n-2,n-1,n+1,n+2].filter(x=>x>0&&x<=100&&x!==a).map(nm)),a:nm(a)
      }
    }
    if(t==='bg'){
      let b=2+rnd(97);
      if(b===n)b=n>2?n-1:n+1;
      return{
        big:nm(n)+'  ⚔️  '+nm(b),q:'أي عدد أكبر؟',say:'أي عدد أكبر',o:shuf([nm(n),nm(b)]),a:nm(Math.max(n,b))
      }
    }
    if(t==='sk'){
      const st=pk([2,5,10]),s=1+rnd(5),r=(s+3)*st;
      return{
        big:[0,1,2].map(i=>nm((s+i)*st)).join(' ، ')+' ، ❓',q:'أكمل العدّ بالقفز '+nm(st),say:'أكمل العد',o:opts(nm(r),[r-st,r+st,r+1,r-1,r+2*st].filter(x=>x>0&&x!==r).map(nm)),a:nm(r)
      }
    }
    if(t==='pv'){
      const d=1+rnd(9),v=d*10+rnd(10);
      return{
        big:nm(v),q:'كم عشرة في هذا العدد؟',say:'كم عشرة في العدد '+nw(v),o:opts(nm(d),[1,2,3,4,5,6,7,8,9].filter(x=>x!==d).map(nm)),a:nm(d)
      }
    }
    return{
      big:'🔊',q:'اسمع واختر العدد',say:nw(n),o:opts(nm(n),[n-1,n+1,n+10,n-10].filter(x=>x>0&&x<=100&&x!==n).map(nm)),a:nm(n)
    }
  };
  qz(Array.from({
    length:6
  },q),sc=>fz(sc,6,()=>numGame(t)))
}
