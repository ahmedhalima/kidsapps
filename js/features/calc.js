/* Math with mouse: choices, on-screen keypad, drag and drop */
function calc(){
  view='calc';
  let op='+',md='c';
  const ops=[['+','➕ جمع'],['-','➖ طرح'],['*','✖️ ضرب'],['m','🔀 مختلط']],mds=[['c','✅ اختياري'],['p','🔢 لوحة أرقام'],['d','🖱️ سحب وإفلات']];
  const hl=(v,x)=>v===x?' style="background:#ffd43b"':'';
  const ui=()=>{
    app.innerHTML='<h2>🧮 مسائل بالماوس</h2><p class="q">نوع المسألة</p><div class="row">'+ops.map(o=>'<button class="btn" data-o="'+o[0]+'"'+hl(op,o[0])+'>'+o[1]+'</button>').join(' ')+'</div><p class="q">طريقة الحل</p><div class="row">'+mds.map(o=>'<button class="btn" data-m="'+o[0]+'"'+hl(md,o[0])+'>'+o[1]+'</button>').join(' ')+'</div><button class="btn" id="go" style="font-size:26px">▶️ ابدأ</button>';
    app.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{
      op=b.dataset.o;
      ui()
    });
    app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{
      md=b.dataset.m;
      ui()
    });
    $('#go').onclick=run
  };
  function run(){
    let i=0,sc=0;
    const lv=S.rounds.calc||0;
    const gen=()=>{
      const o=op==='m'?pk(['+','-','*']):op;
      let a,b,r;
      if(o==='*'){
        a=1+rnd(5+Math.min(5,lv));
        b=1+rnd(5);
        r=a*b
      } else{
        const m=lv>1?20:10;
        a=1+rnd(m);
        b=1+rnd(m);
        if(o==='-'&&b>a)[a,b]=[b,a];
        if(o==='+'&&a+b>m)b=Math.max(1,m-a);
        r=o==='+'?a+b:a-b
      }
      return{
        t:nm(a)+(o==='*'?' × ':o==='+'?' + ':' − ')+nm(b)+' = ؟',r
      }
    };
    const step=()=>{
      if(i>=8){
        if(sc>=6)S.rounds.calc=lv+1;
        save();
        return fz(sc,8,run)
      }
      const q=gen(),pool=Array.from({
        length:q.r+6
      },(_,k)=>k);
      let f=1;
      const done=()=>{
        sfx.ok();
        setTimeout(praise,300);
        if(f){
          sc++;
          S.stars++;
          save();
          hdr()
        }
        i++;
        setTimeout(step,1400)
      },chk=v=>{
        if(+v===q.r)done();
        else{
          f=0;
          sfx.no()
        }
      };
      app.innerHTML='<div class="pill">سؤال '+nm(i+1)+' / ٨</div><div class="big" style="font-size:56px">'+q.t+'</div>'+(md==='c'?'<div class="opts">'+opts(q.r,pool).map(x=>'<button class="btn opt" data-v="'+x+'">'+nm(x)+'</button>').join('')+'</div>':md==='p'?'<div class="pill" id="ans" style="font-size:50px;min-width:140px;display:inline-block">؟</div><div class="opts" style="max-width:340px;margin:12px auto" dir="ltr">'+[1,2,3,4,5,6,7,8,9,'⌫',0,'✔'].map(k=>'<button class="btn" style="width:90px;font-size:32px" data-k="'+k+'">'+k+'</button>').join('')+'</div>':'<div id="dz" class="pill" style="font-size:44px;min-width:160px;display:inline-block;padding:20px;border:4px dashed #888">؟ أسقط الإجابة هنا</div><div class="opts">'+opts(q.r,pool).map(x=>'<button class="btn opt" draggable="true" data-v="'+x+'">'+nm(x)+'</button>').join('')+'</div>');
      say(q.t.replace('= ؟','يساوي كام').replace('×','ضرب في').replace('−','ناقص').replace('+','زائد'));
      if(md==='c')app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        if(+b.dataset.v!==q.r)b.classList.add('bad');
        chk(b.dataset.v)
      });
      else if(md==='p'){
        let v='';
        app.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
          const k=b.dataset.k;
          sfx.pop();
          if(k==='⌫')v=v.slice(0,-1);
          else if(k==='✔'){
            if(v!=='')chk(v);
            v=''
          } else if(v.length<3)v+=k;
          $('#ans').textContent=v===''?'؟':nm(+v)
        })
      }
      else{
        const dz=$('#dz'),drop=x=>{
          dz.textContent=nm(+x);
          chk(x)
        };
        dz.ondragover=e=>e.preventDefault();
        dz.ondrop=e=>{
          e.preventDefault();
          drop(e.dataTransfer.getData('text'))
        };
        app.querySelectorAll('.opt').forEach(b=>{
          b.ondragstart=e=>e.dataTransfer.setData('text',b.dataset.v);
          b.onclick=()=>drop(b.dataset.v)
        })
      }
    };
    step()
  }
  ui()
}
