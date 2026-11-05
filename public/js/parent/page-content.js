/* Parent page: unlock or relock lessons */
PG.ct=h=>{
  h.innerHTML='<h2>📚 المحتوى</h2><p>الدروس مرتبة ومقفلة بالتدريج. يمكنك فتحها كلها لو كان طفلك يعرفها.</p><div class="row"><button class="btn" id="ul">🔓 فتح كل دروس القراءة والبرمجة</button></div><div class="row"><button class="btn" id="lk">🔒 إعادة قفل الدروس</button></div><p id="ok"></p>';
  $('#ul').onclick=()=>{
    for(let i=1;i<=14;i++)S.rd['L'+i]=1;
    RS.forEach((x,i)=>S.rd['s'+i]=1);
    for(let i=0;i<20;i++){
      S.rd['t'+i]=1;
      S.rd['h'+i]=1;
      S.rd['c'+i]=1
    }
    save();
    $('#ok').textContent='✅ تم الفتح'
  };
  $('#lk').onclick=()=>{
    S.rd={};
    save();
    $('#ok').textContent='✅ تمت إعادة القفل'
  }
};
