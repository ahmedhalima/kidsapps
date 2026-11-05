/* Coloring page with save-as-image */
function color(){
  view='color';
  let cur='#ff6b6b',n=0;
  const C=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac','#a0522d','#ffffff'];
  app.innerHTML='<h2>🎨 لوّن الصورة</h2><div class="pal">'+C.map((c,i)=>'<div class="sw'+(i?'':' on')+'" style="background:'+c+'" data-c="'+c+'"></div>').join('')+'</div><svg id="cv" viewBox="0 0 300 240" style="width:100%;max-width:520px;background:#fff;border-radius:24px"><rect class="p" x="0" y="0" width="300" height="240" fill="#fff" rx="20"/><circle class="p" cx="245" cy="45" r="28" fill="#fff"/><ellipse class="p" cx="80" cy="45" rx="40" ry="18" fill="#fff"/><rect class="p" x="60" y="110" width="110" height="90" fill="#fff"/><polygon class="p" points="50,110 115,60 180,110" fill="#fff"/><rect class="p" x="102" y="150" width="26" height="50" fill="#fff"/><rect class="p" x="215" y="140" width="14" height="60" fill="#fff"/><circle class="p" cx="222" cy="120" r="34" fill="#fff"/><circle class="p" cx="30" cy="195" r="10" fill="#fff"/><circle class="p" cx="270" cy="200" r="10" fill="#fff"/></svg><div class="row"><button class="btn" id="d">✅ انتهيت</button> <button class="btn" id="sv2" style="display:none">💾 احفظ الصورة</button></div>';
  app.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{
    app.querySelectorAll('.sw').forEach(x=>x.classList.remove('on'));
    s.classList.add('on');
    cur=s.dataset.c;
    sfx.pop()
  });
  app.querySelectorAll('.p').forEach(p=>p.onclick=()=>{
    p.setAttribute('fill',cur);
    n++;
    tone(400+Math.random()*500,.15,'triangle')
  });
  $('#d').onclick=()=>{
    if(n>=4){
      S.stars+=3;
      save();
      hdr();
      sfx.win();
      say('ما أجمل الألوان');
      $('#d').textContent='🌟 +٣ نجوم!';
      $('#sv2').style.display='';
      $('#sv2').onclick=savePic
    } else say('لوّن أكثر')
  }
}

async function savePic(){
  const sv=$('#cv').cloneNode(true);
  sv.querySelectorAll('.p').forEach(p=>{
    p.setAttribute('stroke','#444');
    p.setAttribute('stroke-width','3')
  });
  sv.setAttribute('width','900');
  sv.setAttribute('height','720');
  const x=new XMLSerializer().serializeToString(sv);
  try{
    const im=new Image();
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x);
    await im.decode();
    const c=document.createElement('canvas');
    c.width=900;
    c.height=720;
    c.getContext('2d').drawImage(im,0,0);
    const b=await new Promise(r=>c.toBlob(r,'image/png'));
    if(await saveFile(b,'my-coloring.png')){sfx.ok();say('تم حفظ الصورة')}
  } catch(e){
    try{
      if(await saveFile(new Blob([x],{type:'image/svg+xml'}),'my-coloring.svg'))sfx.ok()
    } catch(e2){}
  }
}
