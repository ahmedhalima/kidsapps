/* Parent page: message, big gift, safety info */
PG.ms=h=>{
  const I=S.info||{},G=S.gift||{};
  h.innerHTML='<h2>💌 رسالة وهدايا وبيانات</h2><div class="row">💌 رسالة تظهر للطفل في الصفحة الرئيسية:<br><input id="mg" value="'+esc(S.msg)+'" style="width:100%;max-width:420px" maxlength="120"></div><div class="row">🎁 هدية كبرى حقيقية يجمع لها نجومًا:<br><input id="gn" placeholder="مثال: رحلة للحديقة" value="'+esc(G.n)+'" style="width:200px" maxlength="40"> عدد النجوم: <input id="gt" type="number" min="10" value="'+(G.t||100)+'" style="width:90px"></div><div class="row">🛡️ بيانات يحفظها الطفل في قسم «سلامتي» (تُحفظ على هذا الجهاز فقط):<br><input id="in" placeholder="اسم الطفل الكامل" value="'+esc(I.n)+'" style="width:240px"><br><input id="if" placeholder="اسم الأب" value="'+esc(I.f)+'" style="width:240px"><br><input id="ip" placeholder="رقم هاتف الأب" value="'+esc(I.p)+'" inputmode="tel" style="width:240px"></div><button class="btn" id="sv">💾 حفظ</button> <button class="btn" id="gd">🎁 تم تسليم الهدية</button> <span id="ok"></span>';
  $('#sv').onclick=()=>{
    S.msg=$('#mg').value.trim();
    const n=$('#gn').value.trim(),t=+$('#gt').value||100;
    S.gift=n?{
      n,t,s0:(G.n===n&&G.s0!==undefined?G.s0:S.stars)
    }:null;
    S.info={
      n:$('#in').value.trim(),f:$('#if').value.trim(),p:$('#ip').value.trim()
    };
    save();
    $('#ok').textContent='✅ تم الحفظ'
  };
  $('#gd').onclick=()=>{
    if(S.gift){
      S.gift.s0=S.stars;
      save()
    }
    $('#ok').textContent='✅ بدأ عدّاد الهدية من جديد'
  }
};
