/* Learn programming by dragging arrow blocks */
const CL=[{
  s:[2,0],g:[2,3],w:[]
},{
  s:[4,0],g:[0,0],w:[]
},{
  s:[2,0],g:[2,4],w:[[2,2]]
},{
  s:[4,0],g:[0,4],w:[[2,1],[2,2],[2,3]]
},{
  s:[4,0],g:[4,4],w:[[4,1],[3,1],[3,2]]
},{
  s:[0,0],g:[4,4],w:[[1,0],[1,1],[1,2],[3,2],[3,3],[3,4]]
}];

function code(){
  view='code';
  app.innerHTML='<h2>🤖 تعلّم البرمجة</h2><p class="q">اسحب الأسهم لتصنع برنامجًا يوصل الروبوت إلى النجمة ⭐</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">'+CL.map((l,i)=>{
    const lk=i>0&&!S.rd['c'+(i-1)];
    return '<div class="card'+(lk?' lock':'')+'" data-i="'+i+'"><div class="E">'+(lk?'🔒':S.rd['c'+i]?'✅':'🤖')+'</div><small>مستوى '+nm(i+1)+'</small></div>'
  }).join('')+'</div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>c.classList.contains('lock')?sfx.no():codeLv(+c.dataset.i))
}

function codeLv(i){
  view='code';
  const L=CL[i],D={
    U:[-1,0,'⬆️'],D:[1,0,'⬇️'],L:[0,-1,'⬅️'],R:[0,1,'➡️']
  };
  let prog=[],run=false;
  const cell=(r,c,p)=>L.w.some(w=>w[0]===r&&w[1]===c)?'🧱':p&&p[0]===r&&p[1]===c?'🤖':L.g[0]===r&&L.g[1]===c?'⭐':'';
  const gh=p=>Array.from({
    length:25
  },(_,k)=>{
    const r=Math.floor(k/5),c=k%5;
    return '<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:34px;background:'+((r+c)%2?'#c5f6fa':'#e3fafc')+';border-radius:8px">'+cell(r,c,p)+'</div>'
  }).join('');
  app.innerHTML='<h2>🤖 مستوى '+nm(i+1)+'</h2><div id="gr" dir="ltr" style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;max-width:320px;margin:auto">'+gh(L.s)+'</div><p class="q">اسحب الأسهم (أو اضغط عليها) إلى البرنامج</p><div class="pal" dir="ltr">'+Object.keys(D).map(k=>'<span class="btn" draggable="true" data-k="'+k+'" style="font-size:30px">'+D[k][2]+'</span>').join('')+'</div><div id="pz" dir="ltr" style="min-height:70px;border:4px dashed #888;border-radius:18px;padding:8px;max-width:420px;margin:auto"></div><div class="row"><button class="btn" id="rn">▶️ شغّل</button> <button class="btn" id="cl">🗑️ امسح</button></div><div id="msg" class="q"></div>';
  const pr=()=>{
    $('#pz').innerHTML=prog.map((k,j)=>'<span class="btn" style="padding:6px 12px;margin:3px;display:inline-block;font-size:28px" data-j="'+j+'">'+D[k][2]+'</span>').join('')||'<span style="opacity:.6">أسقط الأسهم هنا ⬇️</span>'
  };
  const add=k=>{
    if(run||prog.length>=20)return;
    prog.push(k);
    sfx.pop();
    pr()
  };
  app.querySelectorAll('[data-k]').forEach(b=>{
    b.onclick=()=>add(b.dataset.k);
    b.ondragstart=e=>e.dataTransfer.setData('text',b.dataset.k)
  });
  const pz=$('#pz');
  pz.ondragover=e=>e.preventDefault();
  pz.ondrop=e=>{
    e.preventDefault();
    const k=e.dataTransfer.getData('text');
    if(D[k])add(k)
  };
  pz.onclick=e=>{
    const j=e.target.dataset.j;
    if(j!==undefined&&!run){
      prog.splice(+j,1);
      pr()
    }
  };
  $('#cl').onclick=()=>{
    if(!run){
      prog=[];
      pr()
    }
  };
  $('#rn').onclick=()=>{
    if(run||!prog.length)return;
    run=true;
    let p=L.s.slice(),j=0;
    $('#gr').innerHTML=gh(p);
    const st=()=>{
      if(view!=='code'||!$('#gr'))return;
      if(j>=prog.length){
        run=false;
        if(p[0]===L.g[0]&&p[1]===L.g[1]){
          S.rd['c'+i]=1;
          addStar(3);
          sfx.win();
          say('أحسنت، وصل الروبوت');
          $('#msg').innerHTML='🎉 وصل! +٣ ⭐ <button class="btn" id="nx">التالي ▶️</button>';
          $('#nx').onclick=()=>i<CL.length-1?codeLv(i+1):code()
        } else{
          sfx.no();
          say('لم يصل بعد، حاول مرة أخرى');
          $('#msg').textContent='لم يصل الروبوت بعد. عدّل البرنامج وجرّب!'
        }
        return
      }
      const d=D[prog[j++]],n=[p[0]+d[0],p[1]+d[1]];
      if(n[0]<0||n[0]>4||n[1]<0||n[1]>4||L.w.some(w=>w[0]===n[0]&&w[1]===n[1])){
        run=false;
        sfx.no();
        say('اصطدم الروبوت');
        $('#msg').textContent='💥 اصطدم الروبوت! جرّب طريقًا آخر';
        return
      }
      p=n;
      sfx.pop();
      $('#gr').innerHTML=gh(p);
      setTimeout(st,550)
    };
    st()
  };
  pr()
}
