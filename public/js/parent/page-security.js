/* Parent page: change PIN and reset progress */
PG.sc=h=>{
  h.innerHTML='<h2>🔐 الأمان</h2><div class="row">الرقم السري الحالي: <input id="op" type="password" inputmode="numeric" style="width:140px"></div><div class="row">الرقم الجديد (٤ إلى ٨ أرقام): <input id="np" type="password" inputmode="numeric" maxlength="8" style="width:140px"></div><button class="btn" id="cp">🔑 تغيير الرقم</button> <span id="ok"></span><hr><div class="row"><button class="btn" id="rs">🗑️ مسح تقدم الطفل</button></div>';
  $('#cp').onclick=()=>{
    const n=$('#np').value;
    if($('#op').value!==S.pin){
      $('#ok').textContent='❌ الرقم الحالي غير صحيح';
      return
    }
    if(!/^\d{4,8}$/.test(n)){
      $('#ok').textContent='❌ استخدم ٤ إلى ٨ أرقام';
      return
    }
    S.pin=n;
    save();
    $('#ok').textContent='✅ تم التغيير'
  };
  $('#rs').onclick=()=>{
    const b=$('#rs');
    if(!b.dataset.c){
      b.dataset.c='1';
      b.textContent='⚠️ اضغط مرة أخرى للتأكيد';
      return
    }
    S.stars=0;
    S.rounds={};
    S.rd={};
    S.err={};
    S.days={};
    S.hist={};
    S.spent=0;
    S.pf=0;
    S.own={};
    S.eq={};
    save();
    hdr();
    b.textContent='✔ تم المسح'
  }
};
