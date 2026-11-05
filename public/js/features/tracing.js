/* Finger tracing of letters and digits */
function trace(){
  view='trace';
  const T=[['حروف عربية',AR.map(x=>x[0])],['English',EN.map(x=>x[0])],['أرقام','٠١٢٣٤٥٦٧٨٩'.split('')]];
  app.innerHTML='<h2>✍️ تتبّع الكتابة</h2>'+T.map(t=>'<h3>'+t[0]+'</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(70px,1fr))">'+t[1].map(c=>'<div class="card" data-c="'+c+'"><div class="L">'+c+'</div></div>').join('')+'</div>').join('');
  app.querySelectorAll('[data-c]').forEach(c=>c.onclick=()=>trace1(c.dataset.c))
}

function trace1(ch){
  view='trace';
  app.innerHTML='<h2>تتبّع الحرف بإصبعك أو بالماوس</h2><canvas id="cv" width="400" height="400" style="width:100%;max-width:400px;background:#fff;border-radius:20px;touch-action:none"></canvas><div class="row"><button class="btn" id="tk">✅ تحقق</button> <button class="btn" id="tc">🗑️ امسح</button> <button class="btn" id="tb">↩️ حرف آخر</button></div><div id="tm" class="q"></div>';
  const cv=$('#cv'),cx=cv.getContext('2d'),m1=document.createElement('canvas'),u1=document.createElement('canvas');
  m1.width=m1.height=u1.width=u1.height=400;
  const mx=m1.getContext('2d'),ux=u1.getContext('2d');
  const F=c=>{
    c.font='bold 300px Amiri,Cairo,serif';
    c.textAlign='center';
    c.textBaseline='middle'
  };
  const base=()=>{
    cx.clearRect(0,0,400,400);
    F(cx);
    cx.fillStyle='#d0d7de';
    cx.fillText(ch,200,210);
    ux.clearRect(0,0,400,400)
  };
  F(mx);
  mx.fillText(ch,200,210);
  base();
  for(const c of[cx,ux]){
    c.lineCap='round';
    c.lineJoin='round'
  }
  const pt=e=>{
    const r=cv.getBoundingClientRect();
    return[(e.clientX-r.left)*400/r.width,(e.clientY-r.top)*400/r.height]
  };
  let dr=false;
  const stroke=(f,x,y)=>{
    for(const c of[cx,ux]){
      c.strokeStyle=c===cx?'#e64980':'#000';
      c.lineWidth=26;
      f(c,x,y)
    }
  };
  cv.onpointerdown=e=>{
    cv.setPointerCapture(e.pointerId);
    dr=true;
    const[x,y]=pt(e);
    stroke((c,x,y)=>{
      c.beginPath();
      c.moveTo(x,y);
      c.lineTo(x+.1,y+.1);
      c.stroke()
    },x,y)
  };
  cv.onpointermove=e=>{
    if(!dr)return;
    const[x,y]=pt(e);
    stroke((c,x,y)=>{
      c.lineTo(x,y);
      c.stroke()
    },x,y)
  };
  cv.onpointerup=cv.onpointerleave=()=>{
    dr=false
  };
  $('#tc').onclick=base;
  $('#tb').onclick=trace;
  $('#tk').onclick=()=>{
    const a=mx.getImageData(0,0,400,400).data,b=ux.getImageData(0,0,400,400).data;
    let m=0,u=0,c=0;
    for(let i=3;i<a.length;i+=4){
      const A=a[i]>128,B=b[i]>128;
      if(A)m++;
      if(B)u++;
      if(A&&B)c++
    }
    const cov=m?c/m:0,sp=u?(u-c)/u:1;
    if(cov>.5&&sp<.55){
      addStar(1);
      sfx.win();
      say('أحسنت');
      $('#tm').textContent='🎉 ممتاز! +١ ⭐'
    } else{
      sfx.no();
      say('حاول مرة أخرى');
      $('#tm').textContent=cov<=.5?'لوّن فوق الحرف كله 🖍️':'ابقَ داخل الحرف قدر الإمكان'
    }
  }
}
