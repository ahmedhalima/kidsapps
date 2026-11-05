/* Printable certificates */
const CERT=[['إتمام تعلّم الحروف','L14'],['إتمام الحركات والمدود','s10'],['إتمام معلّم القراءة ١','s11'],['إتمام الجزء الثاني من القراءة','h9'],['بطل البرمجة','c5'],['حفظ سورة الإخلاص','q0']];

function certs(){
  view='cert';
  app.innerHTML='<h2>🏅 الشهادات</h2><div class="row">اسم الطفل: <input id="cn" value="'+(PN()||'')+'" style="width:160px"></div><div class="grid">'+CERT.map((c,i)=>{
    const ok=S.rd[c[1]];
    return '<button class="tile" style="background:'+(ok?'#f59f00':'#adb5bd')+'" data-i="'+i+'"><b>'+(ok?'🏅':'🔒')+'</b>'+c[0]+'</button>'
  }).join('')+'<button class="tile" style="background:#f59f00" data-i="x"><b>⭐</b>بطل النجوم ('+nm(S.stars)+')</button></div>';
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    const i=b.dataset.i,c=i==='x'?['جمع '+nm(S.stars)+' نجمة','x']:CERT[i];
    if(i!=='x'&&!S.rd[c[1]]){
      sfx.no();
      return
    }
    const nmv=$('#cn').value||'البطل';
    shell('','<div style="border:10px double #f59f00;border-radius:20px;padding:40px;text-align:center;font-size:30px;line-height:2;margin:20px"><div style="font-size:70px">🏅</div><h1 style="font-size:50px">شهادة تقدير</h1><p>تُمنح هذه الشهادة إلى البطل / البطلة</p><p style="font-size:46px;font-weight:800;color:#e03131">'+nmv+'</p><p>تقديرًا لـ '+c[0]+'</p><p style="font-size:22px">بتاريخ '+new Date().toLocaleDateString('ar-EG')+' — عالم الصغار 🌟</p></div>')
  })
}
