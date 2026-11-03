/* Parent page: reorder or hide home tiles */
PG.hm=h=>{
  const m={};
  htiles().forEach(t=>m[t[0]]=t);
  const o=horder(),hid=S.hhide||{},rf2=()=>{
    const y=window.scrollY;
    pp('hm');
    window.scrollTo(0,y)
  };
  h.innerHTML='<h2>🧩 ترتيب الصفحة الرئيسية</h2><p style="font-size:14px">رتّب الأزرار بالأسهم، واضغط 👁️ لإخفاء أي زر عن الطفل (🚫 = مخفي).</p>'+o.map((k,i)=>'<div class="card" style="display:flex;align-items:center;gap:6px;padding:8px;margin:5px 0;cursor:default;'+(hid[k]?'opacity:.5':'')+'"><span style="font-size:28px;width:40px;text-align:center">'+m[k][1]+'</span><span style="flex:1;font-weight:800">'+m[k][2]+'</span><button class="btn" style="padding:4px 10px" data-u="'+i+'">▲</button><button class="btn" style="padding:4px 10px" data-d="'+i+'">▼</button><button class="btn" style="padding:4px 10px" data-h="'+k+'">'+(hid[k]?'🚫':'👁️')+'</button></div>').join('')+'<div class="row"><button class="btn" id="rs">↺ الترتيب الافتراضي</button></div>';
  const sv=a=>{
    S.hord=a;
    save();
    rf2()
  };
  h.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.u;
    if(i>0){
      const a=o.slice();
      [a[i-1],a[i]]=[a[i],a[i-1]];
      sv(a)
    }
  });
  h.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.d;
    if(i<o.length-1){
      const a=o.slice();
      [a[i+1],a[i]]=[a[i],a[i+1]];
      sv(a)
    }
  });
  h.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{
    S.hhide=S.hhide||{};
    S.hhide[b.dataset.h]=S.hhide[b.dataset.h]?0:1;
    save();
    rf2()
  });
  $('#rs').onclick=()=>{
    S.hord=null;
    S.hhide={};
    save();
    rf2()
  }
};
