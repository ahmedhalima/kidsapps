/* Parent page: daily tasks */
PG.tk=h=>{
  const T=S.tasks||DT;
  h.innerHTML='<h2>✅ مهام الطفل اليومية</h2><p style="font-size:14px">تظهر هذه المهام عند الطفل في زر «مهامي»، وكل مهمة تعطيه ٢ ⭐ وتبدأ من جديد كل يوم.</p>'+T.map((t,i)=>'<div class="card" style="display:flex;gap:8px;align-items:center;padding:8px;margin:5px 0;cursor:default"><span style="flex:1">'+esc(t)+'</span><button class="btn" style="padding:4px 10px" data-d="'+i+'">🗑️</button></div>').join('')+'<div class="row"><input id="nt" placeholder="مهمة جديدة" style="width:240px" maxlength="40"> <button class="btn" id="ad">➕ إضافة</button></div>';
  h.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
    const a=T.slice();
    a.splice(+b.dataset.d,1);
    S.tasks=a;
    save();
    pp('tk')
  });
  $('#ad').onclick=()=>{
    const v=$('#nt').value.trim();
    if(!v||T.length>=12)return;
    S.tasks=T.concat([v]);
    save();
    pp('tk')
  }
};
