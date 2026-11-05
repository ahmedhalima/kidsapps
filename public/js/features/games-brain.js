/* Thinking games (odd one, shadow, find letter, sort, dots, jigsaw, maze...) */
function odd(){
  view='odd';
  let r=0,sc=0;
  const P2=[['🍎','🍅'],['🐶','🐺'],['🌞','🌝'],['🐱','🐯'],['🚗','🚕'],['🍊','🍋'],['🐸','🐢']];
  function s(){
    if(r>=5){
      addStar(sc);
      sfx.win();
      say('برافو');
      app.innerHTML='<div class="big">🏆</div><h2>+'+nm(sc)+' ⭐</h2><button class="btn" id="r">🔁 مرة أخرى</button>';
      $('#r').onclick=odd;
      return
    }
    const p=shuf(P2[Math.floor(Math.random()*P2.length)]),m=3+(r>2?1:0),c=Math.floor(Math.random()*m*m);
    let ok=true;
    app.innerHTML='<h2>أين الشكل المختلف؟</h2><div class="mem" style="grid-template-columns:repeat('+m+',1fr)">'+Array.from({
      length:m*m
    },(_,i)=>'<button class="mc up" data-i="'+i+'">'+(i===c?p[1]:p[0])+'</button>').join('')+'</div>';
    say('أين الشكل المختلف');
    app.querySelectorAll('.mc').forEach(b=>b.onclick=()=>{
      if(+b.dataset.i===c){
        if(ok)sc++;
        r++;
        sfx.ok();
        praise();
        setTimeout(s,1300)
      } else{
        ok=false;
        sfx.no();
        b.style.opacity=.3
      }
    })
  }
  s()
}

function shd(){
  const E=['🐘','🐱','🐶','🦁','🐴','🐰','🦆','🐟','🍎','🚗','✈️','🌳','⚽','🏠'];
  qz(Array.from({
    length:5
  },()=>{
    const a=pk(E);
    return{
      big:'<span style="filter:brightness(0) drop-shadow(0 0 3px #fff)">'+a+'</span>',q:'من صاحب هذا الظل؟',say:'من صاحب هذا الظل',o:opts(a,E),a
    }
  }),sc=>fz(sc,5,shd))
}

function fl(){
  view='fl';
  let r=0,sc=0;
  const L='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
  function s(){
    if(r>=3){
      addStar(sc);
      return fz(sc,3,fl)
    }
    const t=pk(L),k=3,g=Array.from({
      length:15
    },()=>{
      let x;
      do x=pk(L);
      while(x===t);
      return x
    });
    shuf(Array.from({
      length:15
    },(_,i)=>i)).slice(0,k).forEach(i=>g[i]=t);
    let f=0;
    app.innerHTML='<h2>اعثر على كل حرف «'+t+'» 🔍</h2><div class="mem" style="grid-template-columns:repeat(5,1fr);max-width:480px">'+g.map((x,i)=>'<button class="mc" style="background:#15aabf;font-size:40px" data-i="'+i+'">'+x+'</button>').join('')+'</div>';
    say('اعثر على حرف '+AN[ABJ.indexOf(t)]);
    app.querySelectorAll('.mc').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;
      if(g[i]!==t){
        sfx.no();
        return
      }
      if(!b.classList.contains('up')){
        b.classList.add('up');
        b.style.color='var(--ink)';
        sfx.ok();
        f++;
        if(f===k){
          r++;
          sc++;
          setTimeout(s,900)
        }
      }
    })
  }
  s()
}

function colg(){
  qz(Array.from({
    length:6
  },()=>{
    const c=pk(COL);
    return{
      big:'🎨',q:'أين اللون '+c[1]+'؟',say:'أين اللون '+c[1],o:opts(c[0],COL.map(x=>x[0])),a:c[0]
    }
  }),sc=>fz(sc,6,colg))
}

function more(){
  qz(Array.from({
    length:5
  },()=>{
    const a=1+rnd(9);
    let b=1+rnd(9);
    if(b===a)b=a%9+1;
    const A=pk(['🍎','🍌','⭐','🐟','🎈']).repeat(a),B=pk(['🚗','🐱','🌸','⚽']).repeat(b);
    return{
      big:'⚖️',q:'أيهما أكثر؟',say:'أيهما أكثر',o:shuf([A,B]),a:a>b?A:B
    }
  }),sc=>fz(sc,5,more))
}

function sortg(){
  view='sortg';
  let i=0,sc=0;
  const ci=shuf([0,1,2,3]).slice(0,2),items=shuf([...CAT[ci[0]].slice(0,4).map(x=>[x,0]),...CAT[ci[1]].slice(0,4).map(x=>[x,1])]);
  const s=()=>{
    if(i>=items.length){
      addStar(Math.floor(sc/2));
      return fz(sc,items.length,sortg)
    }
    const it=items[i];
    app.innerHTML='<h2>ضع كل شيء في سلته 🧺</h2><div class="pill">'+nm(i+1)+' / '+nm(items.length)+'</div><div id="itm" draggable="true" class="big" style="cursor:grab">'+it[0]+'</div><div class="opts">'+ci.map((c,j)=>'<button class="btn opt" data-j="'+j+'" style="font-size:30px">🧺 '+CNM[c]+'</button>').join('')+'</div>';
    const ch=j=>{
      if(+j===it[1]){
        sfx.ok();
        sc++
      } else sfx.no();
      i++;
      s()
    };
    app.querySelectorAll('.opt').forEach(b=>{
      b.onclick=()=>ch(b.dataset.j);
      b.ondragover=e=>e.preventDefault();
      b.ondrop=e=>{
        e.preventDefault();
        ch(b.dataset.j)
      }
    });
    $('#itm').ondragstart=e=>e.dataTransfer.setData('text','x')
  };
  s()
}

const DOTS=[['🏠',[[20,85],[20,50],[50,20],[80,50],[80,85],[60,85],[60,62],[40,62],[40,85]]],['⭐',Array.from({
  length:10
},(_,i)=>{
  const a=(-90+i*36)*Math.PI/180,r=i%2?20:45;
  return[Math.round(50+r*Math.cos(a)),Math.round(52+r*Math.sin(a))]
})],['🐟',[[12,50],[32,28],[58,28],[80,45],[92,28],[92,72],[80,55],[58,72],[32,72]]]];

function dots(){
  view='dots';
  const d=pk(DOTS);
  let k=0;
  const dr=()=>{
    const P=d[1],dn=k>=P.length;
    app.innerHTML='<h2>وصّل النقاط بالترتيب ✏️</h2><svg viewBox="0 0 100 100" style="width:100%;max-width:380px;background:#fff;border-radius:20px">'+(k>1?'<polyline points="'+P.slice(0,k).map(p=>p.join(',')).join(' ')+(dn?' '+P[0].join(','):'')+'" fill="'+(dn?'#ffd43b':'none')+'" stroke="#e64980" stroke-width="2" stroke-linejoin="round"/>':'')+P.map((p,i)=>'<g data-i="'+i+'" style="cursor:pointer"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="'+(i<k?'#51cf66':'#4dabf7')+'"/><text x="'+p[0]+'" y="'+(p[1]+2)+'" font-size="5" text-anchor="middle" fill="#fff" font-weight="bold">'+nm(i+1)+'</text></g>').join('')+'</svg>'+(dn?'<div class="big">'+d[0]+'</div><h2>🎉 أحسنت! +٢ ⭐</h2><button class="btn" id="nx">▶️ صورة جديدة</button>':'');
    if(dn){
      sfx.win();
      say('أحسنت');
      addStar(2);
      $('#nx').onclick=dots;
      return
    }
    app.querySelectorAll('g').forEach(g=>g.onclick=()=>{
      if(+g.dataset.i===k){
        k++;
        sfx.ok();
        dr()
      } else sfx.no()
    })
  };
  dr()
}

const SCN=[['☁️','☀️','🌈','🌳','🏠','🌴','🌷','🐇','🌻'],['🐦','🦋','🌈','🌲','⛺','🌳','🍄','🦊','🌼'],['⭐','🌙','🚀','🏢','🕌','🏫','🚗','🚌','🚕']];

function jig(){
  view='jig';
  const sc=pk(SCN);
  let a=shuf(sc.map((x,i)=>i)),sel=-1;
  const dr=()=>{
    app.innerHTML='<h2>🧩 رتّب الصورة</h2><p class="q">اضغط قطعتين لتبديلهما (أو اسحب قطعة فوق أخرى)</p><div class="mem" style="grid-template-columns:repeat(3,1fr);max-width:330px">'+a.map((v,i)=>'<button class="mc up" draggable="true" data-i="'+i+'" style="font-size:52px;'+(sel===i?'outline:5px solid #ffd43b':'')+'">'+sc[v]+'</button>').join('')+'</div>';
    const sw=(x,y)=>{
      [a[x],a[y]]=[a[y],a[x]];
      sel=-1;
      sfx.pop();
      dr();
      if(a.every((v,i)=>v===i)){
        sfx.win();
        say('أحسنت');
        addStar(2);
        app.insertAdjacentHTML('beforeend','<h2>🎉 +٢ ⭐</h2><button class="btn" id="nx">▶️ صورة جديدة</button>');
        $('#nx').onclick=jig
      }
    };
    app.querySelectorAll('.mc').forEach(b=>{
      const i=+b.dataset.i;
      b.onclick=()=>{
        if(sel<0){
          sel=i;
          dr()
        } else if(sel===i){
          sel=-1;
          dr()
        } else sw(sel,i)
      };
      b.ondragstart=e=>e.dataTransfer.setData('text',i);
      b.ondragover=e=>e.preventDefault();
      b.ondrop=e=>{
        e.preventDefault();
        const f=+e.dataTransfer.getData('text');
        if(f!==i)sw(f,i)
      }
    })
  };
  dr()
}

function maze(){
  view='maze';
  const N=Math.min(8,5+(S.mz||0)),g=Array.from({
    length:N
  },()=>Array.from({
    length:N
  },()=>({
    w:[1,1,1,1],v:0
  }))),st=[[0,0]],dx=[[-1,0,0,2],[0,1,1,3],[1,0,2,0],[0,-1,3,1]];
  g[0][0].v=1;
  while(st.length){
    const[r,c]=st[st.length-1],nb=shuf(dx.slice()).filter(d=>{
      const a=r+d[0],b=c+d[1];
      return a>=0&&b>=0&&a<N&&b<N&&!g[a][b].v
    });
    if(!nb.length){
      st.pop();
      continue
    }
    const d=nb[0],a=r+d[0],b=c+d[1];
    g[r][c].w[d[2]]=0;
    g[a][b].w[d[3]]=0;
    g[a][b].v=1;
    st.push([a,b])
  }
  let p=[0,0],won=false;
  const dr=()=>{
    $('#mz').innerHTML=g.map((row,r)=>row.map((c,k)=>'<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:'+Math.round(240/N)+'px;border:0 solid #333;border-top-width:'+(c.w[0]?3:0)+'px;border-right-width:'+(c.w[1]?3:0)+'px;border-bottom-width:'+(c.w[2]?3:0)+'px;border-left-width:'+(c.w[3]?3:0)+'px">'+(p[0]===r&&p[1]===k?'🐭':r===N-1&&k===N-1?'🧀':'')+'</div>').join('')).join('')
  };
  app.innerHTML='<h2>🐭 أوصل الفأر إلى الجبن 🧀</h2><div id="mz" dir="ltr" style="display:grid;grid-template-columns:repeat('+N+',1fr);max-width:340px;margin:auto;background:#fff;border-radius:8px"></div><div class="pal" dir="ltr" style="margin-top:12px"><button class="btn" data-m="3">⬅️</button><button class="btn" data-m="0">⬆️</button><button class="btn" data-m="2">⬇️</button><button class="btn" data-m="1">➡️</button></div><div id="mm" class="q"></div>';
  dr();
  const mv=i=>{
    if(won||g[p[0]][p[1]].w[i])return sfx.no();
    p=[p[0]+dx[i][0],p[1]+dx[i][1]];
    sfx.pop();
    dr();
    if(p[0]===N-1&&p[1]===N-1){
      won=true;
      addStar(2);
      S.mz=Math.min(3,(S.mz||0)+1);
      sfx.win();
      say('أحسنت');
      $('#mm').innerHTML='🎉 وصل! +٢ ⭐ <button class="btn" id="mn">▶️ متاهة جديدة</button>';
      $('#mn').onclick=maze
    }
  };
  app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>mv(+b.dataset.m));
  document.onkeydown=e=>{
    if(view!=='maze')return;
    const i={
      ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3
    }[e.key];
    if(i!==undefined){
      e.preventDefault();
      mv(i)
    }
  }
}

function sentOrd(){
  view='so';
  const A=RS[11][2].split(';').map(x=>x.split('|')),it=pk(A),w=it[0].split(' ');
  let k=0;
  app.innerHTML='<h2>رتّب الجملة 📝</h2><div class="big">'+it[1]+'</div><div class="card rw" id="ta" style="padding:12px;min-height:64px;cursor:default;font-size:34px">&nbsp;</div><div class="opts" style="gap:8px">'+shuf(w.map((x,i)=>[x,i])).map(x=>'<button class="btn rw" style="font-size:30px" data-i="'+x[1]+'">'+x[0]+'</button>').join('')+'</div>';
  app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    if(+b.dataset.i===k){
      b.disabled=true;
      b.style.opacity=.3;
      k++;
      sfx.ok();
      $('#ta').textContent=w.slice(0,k).join(' ');
      if(k===w.length){
        say(it[0]);
        addStar(2);
        sfx.win();
        app.insertAdjacentHTML('beforeend','<h2>🎉 +٢ ⭐</h2><button class="btn" id="nx">▶️ جملة جديدة</button>');
        $('#nx').onclick=sentOrd
      }
    } else sfx.no()
  })
}
