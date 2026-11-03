/* Science and shapes quizzes */
function science(){
  view='sci';
  app.innerHTML='<h2>🔬 علوم مبسطة</h2><div class="grid">'+SCI.map((t,i)=>'<button class="tile" style="background:#1098ad" data-i="'+i+'"><b>'+t[1]+'</b>'+t[0]+'</button>').join('')+'</div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    const t=SCI[b.dataset.i],qs=t[2].split(';').map(x=>x.split('|'));
    qz(shuf(qs).map(q=>({
      big:t[1],q:q[0],say:q[0],o:shuf(q.slice(1)),a:q[1]
    })),sc=>fz(sc,qs.length,science))
  })
}

function shapes(){
  qz(Array.from({
    length:8
  },(_,i)=>{
    if(i<4){
      const s=pk(SHP);
      return{
        big:'📐',q:'أين ال'+s[1]+'؟',say:'أين ال'+s[1],o:opts(s[0],SHP.map(x=>x[0])),a:s[0]
      }
    }
    if(i<6){
      const p=pk([['🐘','🐭'],['🚌','🚲'],['🌳','🌱'],['🐋','🐟'],['🏠','🧱']]),b=Math.random()<.5;
      return{
        big:'↕️',q:'أيهما '+(b?'أكبر':'أصغر')+'؟',say:'أيهما '+(b?'أكبر':'أصغر'),o:shuf(p.slice()),a:b?p[0]:p[1]
      }
    }
    const d=pk([['⬆️','فوق'],['⬇️','تحت'],['⬅️','يسار'],['➡️','يمين']]);
    return{
      big:d[0],q:'إلى أين يشير السهم؟',say:'إلى أين يشير السهم',o:opts(d[1],['فوق','تحت','يمين','يسار']),a:d[1]
    }
  }),sc=>fz(sc,8,shapes))
}
