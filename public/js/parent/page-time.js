/* Parent page: time limit, allowed hours, daily goal */
PG.tm=h=>{
  h.innerHTML='<h2>⏱️ الوقت والهدف</h2><p>استخدم اليوم: '+nm(Math.floor(S.used/60))+' دقيقة من '+nm(S.limit+S.extra)+'</p><div class="row">الوقت اليومي (دقائق): <input id="lm" type="number" min="5" max="600" value="'+S.limit+'"></div><div class="row">زيادة الوقت اليوم:<br>'+[5,10,15,30].map(a=>'<button class="btn" data-a="'+a+'">+'+nm(a)+'</button>').join(' ')+'</div><div class="row">🌙 ساعات السماح باللعب: من <input id="h1" type="number" min="0" max="23" value="'+(S.h1==null?'':S.h1)+'" style="width:70px"> إلى <input id="h2" type="number" min="1" max="24" value="'+(S.h2==null?'':S.h2)+'" style="width:70px"><br><small>الساعة بتوقيت الجهاز (مثلًا من ٨ إلى ٢٠). اتركهما فارغين للسماح طوال اليوم.</small></div><div class="row">🎯 الهدف اليومي (نجوم): <input id="gl" type="number" min="0" max="200" value="'+(S.goal||0)+'" style="width:80px"><br><label><input type="checkbox" id="gk"'+(S.glock?' checked':'')+' style="width:auto"> اقفل الألعاب حتى يتحقق الهدف</label><br><label><input type="checkbox" id="ey"'+(S.eye===0?'':' checked')+' style="width:auto"> 👀 تنبيه راحة العين كل ٢٠ دقيقة</label></div><button class="btn" id="sv">💾 حفظ</button> <span id="ok"></span>';
  h.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
    S.extra+=+b.dataset.a;
    save();
    hdr();
    b.textContent='✔ تمت الإضافة'
  });
  $('#sv').onclick=()=>{
    const l=+$('#lm').value;
    if(l>=5)S.limit=l;
    S.goal=+$('#gl').value;
    S.h1=$('#h1').value===''?null:+$('#h1').value;
    S.h2=$('#h2').value===''?null:+$('#h2').value;
    S.glock=$('#gk').checked;
    S.eye=$('#ey').checked?1:0;
    save();
    hdr();
    $('#ok').textContent='✅ تم الحفظ'
  }
};
