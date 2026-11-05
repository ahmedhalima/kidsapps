/* Parent page: backup and restore */
PG.bk=h=>{
  save();
  let code='';
  try{
    const d={};
    PL().forEach(p=>{
      d[p.k]=localStorage.getItem(p.k)
    });
    code=btoa(unescape(encodeURIComponent(JSON.stringify({
      v:1,p:PL(),d
    }))))
  } catch(e){}
  h.innerHTML='<h2>💾 نسخة احتياطية</h2><p style="font-size:14px">تقدم الأطفال محفوظ في هذا المتصفح فقط. انسخ الكود التالي واحفظه في مكان آمن (رسالة لنفسك مثلًا)، وألصقه في الخانة الثانية لاستعادته على أي جهاز.</p><div class="row">📤 كود النسخة:<br><textarea id="ex" readonly style="width:100%;height:90px;font-size:12px">'+code+'</textarea><button class="btn" id="cp">📋 نسخ</button> <span id="ok"></span></div><div class="row">📥 استعادة من كود:<br><textarea id="im" style="width:100%;height:90px;font-size:12px" placeholder="ألصق الكود هنا"></textarea><button class="btn" id="rs">♻️ استعادة</button> <span id="ok2"></span></div><p style="font-size:13px;opacity:.8">ملاحظة: تسجيلات صوتك لا تدخل في النسخة.</p>';
  $('#cp').onclick=()=>{
    const t=$('#ex');
    t.select();
    try{
      document.execCommand('copy');
      $('#ok').textContent='✅ تم النسخ'
    } catch(e){
      $('#ok').textContent='حدّد النص وانسخه يدويًا'
    }
  };
  $('#rs').onclick=()=>{
    const b=$('#rs');
    try{
      const o=JSON.parse(decodeURIComponent(escape(atob($('#im').value.trim()))));
      if(!o.p||!o.d)throw 0;
      if(!b.dataset.c){
        b.dataset.c='1';
        b.textContent='⚠️ سيستبدل البيانات الحالية. اضغط للتأكيد';
        return
      }
      Object.keys(o.d).forEach(k=>{
        if(o.d[k]!=null)localStorage.setItem(k,o.d[k])
      });
      PS(o.p);
      switchP(o.p[0].k);
      view='parent';
      pp('bk');
      $('#ok2').textContent='✅ تمت الاستعادة'
    } catch(e){
      $('#ok2').textContent='❌ الكود غير صالح'
    }
  }
};
