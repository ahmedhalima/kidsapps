/* Parent page: voice choice and speed */
function vopts(){
  try{
    const vs=speechSynthesis.getVoices(),mk=(p,cur)=>vs.filter(v=>v.lang.replace('_','-').slice(0,2)===p).map(v=>'<option value="'+v.name+'"'+(v.name===cur?' selected':'')+'>'+v.name+' ('+v.lang+')</option>').join('');
    return{
      ar:'<option value="">تلقائي (الأفضل)</option>'+mk('ar',S.va),en:'<option value="">تلقائي</option>'+mk('en',S.ve)
    }
  } catch(e){
    return{
      ar:'',en:''
    }
  }
}

PG.vc=h=>{
  const vo=vopts();
  h.innerHTML='<h2>🔊 الصوت</h2><div class="row">صوت العربية:<br><select id="va" style="max-width:100%">'+vo.ar+'</select> <button class="btn" id="vta">🔊 جرّب</button></div><div class="row">English voice:<br><select id="ve" style="max-width:100%">'+vo.en+'</select> <button class="btn" id="vte">🔊 Try</button></div><div class="row">سرعة الصوت: <input type="range" id="vr" min="60" max="110" value="'+(S.vr||90)+'" style="width:160px"></div><p style="font-size:14px">للحصول على أصوات أقرب للبشر استخدم متصفح Microsoft Edge واختر صوتًا فيه كلمة Natural. أو سجّل صوتك من صفحة «تسجيل صوتك».</p><button class="btn" id="sv">💾 حفظ</button> <span id="ok"></span>';
  const sv=()=>{
    S.va=$('#va').value;
    S.ve=$('#ve').value;
    S.vr=+$('#vr').value;
    save()
  };
  $('#vta').onclick=()=>{
    sv();
    say('مرحبًا يا بطل، هذا هو صوتي')
  };
  $('#vte').onclick=()=>{
    sv();
    say('Hello! This is my voice.','en-US')
  };
  $('#sv').onclick=()=>{
    sv();
    $('#ok').textContent='✅ تم الحفظ'
  }
};
