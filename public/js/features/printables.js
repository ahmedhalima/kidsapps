/* Printable worksheets */
const SV=s=>'<svg viewBox="0 0 300 220" style="width:48%;min-width:250px;margin:4px" fill="#fff" stroke="#333" stroke-width="3">'+s+'</svg>';

const PCOL=[SV('<circle cx="250" cy="40" r="25"/><rect x="60" y="100" width="110" height="80"/><polygon points="50,100 115,50 180,100"/><rect x="100" y="135" width="25" height="45"/><rect x="210" y="130" width="12" height="50"/><circle cx="216" cy="115" r="30"/><rect x="0" y="180" width="300" height="30"/>'),SV('<ellipse cx="130" cy="110" rx="80" ry="45"/><polygon points="210,110 270,60 270,160"/><circle cx="85" cy="100" r="8"/><circle cx="60" cy="40" r="8"/><circle cx="85" cy="25" r="5"/><path d="M20 210 q10 -50 20 0 M45 210 q10 -40 20 0"/>'),SV('<line x1="150" y1="90" x2="150" y2="210"/><circle cx="150" cy="60" r="20"/><circle cx="150" cy="25" r="18"/><circle cx="150" cy="95" r="18"/><circle cx="115" cy="60" r="18"/><circle cx="185" cy="60" r="18"/><ellipse cx="110" cy="160" rx="30" ry="12"/><ellipse cx="195" cy="150" rx="30" ry="12"/>')];

function shell(ti,h,cls){
  ov.innerHTML='<div class="ov" style="background:#fff;color:#000;display:block"><div class="np"><button class="btn" id="pb">🖨️ اطبع</button> <button class="btn" id="px">✖ إغلاق</button></div><h2 style="text-align:center">'+ti+'</h2><div class="'+(cls||'')+'">'+h+'</div></div>';
  $('#px').onclick=()=>ov.innerHTML='';
  $('#pb').onclick=()=>window.print()
}

const tb=(rows,w)=>'<table style="margin:auto;border-collapse:collapse">'+rows.map(r=>'<tr>'+r.map(c=>'<td style="border:2px solid #888;width:'+(w||54)+'px;height:'+(w||54)+'px;text-align:center;font-size:22px">'+c+'</td>').join('')+'</tr>').join('')+'</table>';

function sheet(t){
  let h='',ti;
  if(t==='ar'||t==='en'){
    const D=t==='ar'?AR:EN;
    ti=t==='ar'?'تتبّع الحروف العربية ✏️':'Trace the letters ✏️';
    h=D.map(x=>'<div class="pc"><span class="tr">'+x[0]+'</span><span class="tr">'+x[0]+'</span><span class="tr">'+x[0]+'</span> '+x[2]+'</div>').join('')
  }
  else if(t==='num'){
    ti='تتبّع الأرقام وعدّ الصور 🔢';
    h=NUM.map(x=>'<div class="pc"><span class="tr">'+x[0]+'</span><span class="tr">'+x[0]+'</span> <small>'+x[2].repeat(x[3])+'</small></div>').join('')
  }
  else{
    ti='حلّ المسائل ➕';
    for(let i=0;i<12;i++){
      const a=1+Math.floor(Math.random()*9),b=1+Math.floor(Math.random()*9);
      h+='<div class="pc">'+nm(a)+' + '+nm(b)+' = ____</div>'
    }
  }
  ov.innerHTML='<div class="ov" style="background:#fff;color:#000;display:block"><div class="np"><button class="btn" id="pb">🖨️ اطبع</button> <button class="btn" id="px">✖ إغلاق</button></div><h2 style="text-align:center">'+ti+'</h2><div class="pg">'+h+'</div></div>';
  $('#px').onclick=()=>ov.innerHTML='';
  $('#pb').onclick=()=>window.print()
}

function sheet2(t){
  if(['ar','en','num','math'].includes(t))return sheet(t);
  let ti,h='',cls='';
  const pc=x=>'<div class="pc">'+x+'</div>',E5=['🍎','🐟','⭐','🎈','🍌','🌸'];
  if(t==='n100'){
    ti='جدول الأعداد من ١ إلى ١٠٠';
    h=tb(Array.from({
      length:10
    },(_,r)=>Array.from({
      length:10
    },(_,c)=>nm(r*10+c+1))))
  }
  else if(t==='mul'){
    ti='جدول الضرب';
    h=tb(Array.from({
      length:11
    },(_,r)=>Array.from({
      length:11
    },(_,c)=>r&&c?nm(r*c):r?'<b>'+nm(r)+'</b>':c?'<b>'+nm(c)+'</b>':'×')),46)
  }
  else if(t==='words'){
    ti='تتبّع الكلمات ✏️';
    cls='pg';
    h=WD.map(x=>pc('<span class="tr" style="font-size:36px">'+x[0]+'</span> '+x[2])).join('')
  }
  else if(t==='en2'){
    ti='Trace the words ✏️';
    cls='pg';
    h=EN.map(x=>'<div class="pc" dir="ltr"><span class="tr" style="font-size:34px">'+x[1]+'</span> '+x[2]+'</div>').join('')
  }
  else if(t==='match'){
    ti='وصّل الصورة بالكلمة 🔗';
    const a=shuf(WD.slice()).slice(0,8),b=shuf(a.slice());
    h=a.map((x,i)=>'<div class="pc" style="display:flex;justify-content:space-between;padding:10px 40px"><span style="font-size:40px">'+x[2]+' ⚪</span><span>⚪ '+b[i][0]+'</span></div>').join('')
  }
  else if(t==='count'){
    ti='عدّ واكتب العدد 🔟';
    h=Array.from({
      length:8
    },()=>{
      const n=1+rnd(12);
      return pc(pk(E5).repeat(n)+' &nbsp; = ______')
    }).join('')
  }
  else if(t==='pat'){
    ti='أكمل النمط 🧩';
    h=Array.from({
      length:8
    },()=>{
      const e=shuf(E5).slice(0,3),u=pk(['AB','AAB','ABC']).split('').map(c=>e['ABC'.indexOf(c)]);
      return pc(Array.from({
        length:5
      },(_,i)=>u[i%u.length]).join(' ')+' ______')
    }).join('')
  }
  else if(t==='color'){
    ti='لوّن الصور 🎨';
    h=PCOL.join('')
  }
  else if(t==='week'){
    ti='جدول عاداتي هذا الأسبوع';
    h=tb([['العادة','السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']].concat(DL.map(d=>[d].concat(Array(7).fill('☐')))),70).replace(/width:70px/g,'width:auto;padding:4px 8px')
  }
  else if(t==='cards'){
    ti='بطاقات الحروف (قصّها) ✂️';
    cls='pg3';
    h=AR.map(x=>'<div style="border:3px dashed #888;border-radius:14px;padding:6px;text-align:center"><div style="font-size:54px">'+x[0]+'</div><div style="font-size:40px">'+x[2]+'</div><div>'+x[1]+'</div></div>').join('')
  }
  else if(t==='sub'){
    ti='جمع وطرح حتى ٢٠ ➕➖';
    cls='pg';
    h=Array.from({
      length:16
    },()=>{
      let a=1+rnd(20),b=1+rnd(20);
      const m=Math.random()<.5;
      if(m){
        if(a+b>20)b=Math.max(1,20-a)
      } else if(b>a)[a,b]=[b,a];
      return pc(nm(a)+(m?' + ':' − ')+nm(b)+' = ____')
    }).join('')
  }
  else{
    ti='حكايات للقراءة 📖';
    h=HS.slice(0,5).map(x=>'<div class="pc" style="font-size:26px;text-align:right;line-height:2"><b>'+x[1]+' '+x[0]+'</b><br>'+x[2].split(';').join(' ')+'</div>').join('')
  }
  shell(ti,h,cls)
}

function prt(){
  view='prt';
  const ch=['اجمع ٥ أشياء حمراء من البيت 🔴','ارسم عائلتك ✏️','عدّ ١٠ خطوات وأنت تمشي 👣','قل لشخص كلمة طيبة 💬','رتب سريرك أو ألعابك 🧸','احكِ لماما قصة قصيرة 📖','ابحث عن ٣ أشياء مستديرة ⚪'],c=ch[new Date().getDate()%ch.length];
  const SH=[['ar','أ','حروف عربية','#e64980'],['en','Ab','English','#4c6ef5'],['num','١٢٣','أرقام','#12b886'],['math','➕','مسائل','#f59f00'],['sub','٢٠','جمع وطرح ٢٠','#7048e8'],['n100','١٠٠','جدول الأعداد','#d6336c'],['mul','✖️','جدول الضرب','#1c7ed6'],['words','📝','تتبّع كلمات','#2f9e44'],['en2','📘','English words','#e8590c'],['match','🔗','وصّل بالصورة','#15aabf'],['count','🔟','عدّ واكتب','#f76707'],['pat','🧩','أكمل النمط','#ae3ec9'],['color','🎨','صفحات تلوين','#f03e3e'],['week','📅','جدول عاداتي','#37b24d'],['cards','✂️','بطاقات حروف','#0ca678'],['story','📖','حكايات للقراءة','#364fc7']];
  app.innerHTML='<h2>🖨️ أنشطة ومطبوعات</h2><div class="card" style="padding:16px;margin-bottom:14px"><div class="q">⭐ تحدي اليوم</div><div class="q" style="margin:8px">'+c+'</div><button class="btn" id="cd">'+(S.cd===today()?'✅ تم':'✅ أنجزته')+'</button></div><h3>أوراق للطباعة ('+nm(SH.length)+')</h3><div class="grid">'+SH.map(s=>'<button class="tile" style="background:'+s[3]+'" data-s="'+s[0]+'"><b>'+s[1]+'</b>'+s[2]+'</button>').join('')+'</div>';
  $('#cd').onclick=()=>{
    if(S.cd!==today()){
      S.cd=today();
      addStar(3);
      sfx.win();
      say('أحسنت يا بطل');
      $('#cd').textContent='✅ +٣ ⭐'
    }
  };
  app.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>sheet2(b.dataset.s))
}
