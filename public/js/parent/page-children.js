/* Parent page: children list, rename, add, delete */
PG.kd=h=>{
  const l=PL();
  h.innerHTML='<h2>👶 الأطفال</h2>'+l.map((p,i)=>'<div class="card" style="padding:10px;margin:6px 0;cursor:default"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="flex:1;font-weight:800">'+(p.k===KK?'✅ ':'')+esc(p.name)+'</span><button class="btn" style="padding:6px 12px" data-e="'+i+'">✏️ تعديل الاسم</button>'+(p.k===KK?'':'<button class="btn" style="padding:6px 12px" data-s="'+i+'">تبديل</button>')+(l.length>1?'<button class="btn" style="padding:6px 12px" data-d="'+i+'">🗑️</button>':'')+'</div><div id="ed'+i+'"></div></div>').join('')+'<div class="row"><input id="pn" placeholder="اسم الطفل" style="width:200px" maxlength="20"> <button class="btn" id="pa">➕ إضافة طفل</button></div><p style="font-size:14px">لكل طفل نجومه وتقدمه ووقته ورقمه السري. (حتى ٤ أطفال)</p>';
  h.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.e,d=$('#ed'+i);
    d.innerHTML='<div class="row"><input id="en'+i+'" value="'+esc(l[i].name)+'" maxlength="20" style="width:200px"> <button class="btn" id="es'+i+'" style="padding:6px 12px">💾 حفظ</button> <button class="btn" id="ec'+i+'" style="padding:6px 12px">إلغاء</button></div>';
    $('#ec'+i).onclick=()=>{
      d.innerHTML=''
    };
    $('#es'+i).onclick=()=>{
      const v=$('#en'+i).value.trim();
      if(!v)return;
      l[i].name=v;
      PS(l);
      hdr();
      pp('kd')
    }
  });
  h.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
    switchP(l[b.dataset.s].k);
    view='parent';
    pp('kd')
  });
  h.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
    if(b.dataset.c!=='1'){
      b.dataset.c='1';
      b.textContent='اضغط للتأكيد';
      return
    }
    const p=l[b.dataset.d];
    try{
      localStorage.removeItem(p.k)
    } catch(e){}
    const n=l.filter(x=>x.k!==p.k);
    PS(n);
    if(p.k===KK)switchP(n[0].k);
    view='parent';
    pp('kd')
  });
  $('#pa').onclick=()=>{
    const n=$('#pn').value.trim();
    if(!n||l.length>=4)return;
    const k='alam_p'+Date.now();
    l.push({
      k,name:n
    });
    PS(l);
    switchP(k);
    view='parent';
    pp('kd')
  }
};
