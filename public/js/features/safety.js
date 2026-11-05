/* Safety scenarios, emergency numbers, my info */
function safe(){
  view='safe';
  app.innerHTML='<h2>🛡️ سلامتي</h2><div class="grid"><button class="tile" style="background:#e03131" id="s1"><b>📞</b>أرقام الطوارئ</button><button class="tile" style="background:#2f9e44" id="s2"><b>💡</b>ماذا أفعل؟</button><button class="tile" style="background:#1971c2" id="s3"><b>🪪</b>بياناتي</button></div>';
  $('#s1').onclick=()=>{
    app.innerHTML='<h2>📞 أرقام الطوارئ في مصر</h2><div class="grid">'+EM.map((e,i)=>'<div class="card" data-i="'+i+'" style="padding:16px"><div class="E" style="font-size:56px">'+e[0]+'</div><b>'+e[1]+'</b><div class="L" style="font-size:48px">'+e[2]+'</div></div>').join('')+'</div><p style="font-size:14px">للكبار: اشرح لطفلك أنه يستخدم هذه الأرقام بوجود شخص كبير، وفي الخطر الحقيقي فقط.</p><button class="btn" id="eq">🎮 اختبرني</button>';
    app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
      const e=EM[c.dataset.i];
      sfx.pop();
      say('رقم '+e[1]+' '+e[2].split('').map(d=>AW0['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).join(' '))
    });
    $('#eq').onclick=()=>qz(Array.from({
      length:3
    },()=>{
      const e=pk(EM);
      return{
        big:e[0],q:'ما رقم '+e[1]+'؟',say:'ما رقم '+e[1],o:opts(e[2],EM.map(x=>x[2])),a:e[2]
      }
    }),sc=>fz(sc,3,safe))
  };
  $('#s2').onclick=()=>qz(shuf(SF.slice()).slice(0,5).map(r=>{
    const s=r.split('|');
    return{
      big:'🛡️',q:s[0],say:s[0],rw:1,o:shuf(s.slice(1)),a:s[1]
    }
  }),sc=>fz(sc,5,safe));
  $('#s3').onclick=()=>{
    const I=S.info||{},R=[['🧒','اسمي',I.n],['👨','اسم أبي',I.f],['📱','رقم هاتف أبي',I.p]].filter(x=>x[2]);
    app.innerHTML='<h2>🪪 بياناتي</h2>'+(R.length?R.map((x,i)=>'<div class="card" data-i="'+i+'" style="padding:14px;margin:8px"><span style="font-size:40px">'+x[0]+'</span> <b>'+x[1]+':</b> <span class="rw">'+esc(x[2])+'</span> 🔊</div>').join(''):'<p class="q">اطلب من بابا أن يكتب بياناتك من صفحة الأب 💌</p>');
    app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
      const x=R[c.dataset.i];
      sfx.pop();
      say(x[1]+' '+(x[0]==='📱'?x[2].split('').join(' '):x[2]))
    })
  }
}
