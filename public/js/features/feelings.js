/* Feelings cards and scenarios */
function feel(){
  view='feel';
  app.innerHTML='<h2>😊 مشاعري</h2><div class="grid"><button class="tile" style="background:#e64980" id="f1"><b>😀</b>بطاقات المشاعر</button><button class="tile" style="background:#7048e8" id="f2"><b>🤔</b>ما شعوره؟</button><button class="tile" style="background:#2f9e44" id="f3"><b>💡</b>ماذا أفعل؟</button></div>';
  $('#f1').onclick=()=>{
    app.innerHTML='<h2>اضغط لتسمع</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">'+FE.map((f,i)=>'<div class="card" data-i="'+i+'"><div class="E" style="font-size:60px">'+f[0]+'</div><b>'+f[1]+'</b></div>').join('')+'</div>';
    app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
      sfx.pop();
      say('أنا '+FE[c.dataset.i][1])
    })
  };
  $('#f2').onclick=()=>qz(Array.from({
    length:5
  },()=>{
    const f=pk(FE);
    return{
      big:f[0],q:'ما شعوره؟',say:'ما شعوره',o:opts(f[1],FE.map(x=>x[1])),a:f[1]
    }
  }),sc=>fz(sc,5,feel));
  $('#f3').onclick=()=>qz(shuf(FS.slice()).slice(0,5).map(r=>{
    const s=r.split('|');
    return{
      big:'💭',q:s[0],say:s[0],rw:1,o:shuf(s.slice(1)),a:s[1]
    }
  }),sc=>fz(sc,5,feel))
}
