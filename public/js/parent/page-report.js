/* Parent page: child report dashboard */
const ring=(p,c,ic,lb)=>{
  const r=34,L=2*Math.PI*r;
  return '<div style="text-align:center;width:104px"><svg viewBox="0 0 90 90" width="90" height="90"><circle cx="45" cy="45" r="'+r+'" fill="none" stroke="#e9ecef" stroke-width="10"/><circle cx="45" cy="45" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+(L*p/100).toFixed(1)+' '+L.toFixed(1)+'" transform="rotate(-90 45 45)"/><text x="45" y="53" text-anchor="middle" font-size="22">'+ic+'</text></svg><div style="font-weight:800;font-size:14px">'+lb+'</div><small>'+nm(Math.round(p))+'٪</small></div>'
};

const sp=k=>{
  const j=SJ[k],t=Math.ceil((j.d.length-j.s)/j.st);
  return Math.min(100,(S.rounds[k]||0)/t*100)
};

const cntK=(pre,a,b)=>{
  let c=0;
  for(let i=a;i<=b;i++)if(S.rd[pre+i])c++;
  return c
};

PG.rp=h=>{
  const lv=(()=>{
    let li=0;
    LV.forEach((l,i)=>{
      if(S.stars>=l[0])li=i
    });
    return LV[li]
  })(),pe=S.pet||'🐱';
  let sk=0,d=new Date();
  while(S.days[d.toISOString().slice(0,10)]){
    sk++;
    d.setDate(d.getDate()-1)
  }
  const days=[];
  for(let i=6;i>=0;i--){
    const dd=new Date();
    dd.setDate(dd.getDate()-i);
    const x=(S.hist||{})[dd.toISOString().slice(0,10)];
    days.push([['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'][dd.getDay()],x?x.m:0,x?Math.max(0,x.s-x.s0):0])
  }
  const mxm=Math.max(10,...days.map(x=>x[1])),mxs=Math.max(5,...days.map(x=>x[2]));
  const chart='<svg viewBox="0 0 350 140" style="width:100%">'+days.map((x,i)=>{
    const X=i*50+8,a=x[1]/mxm*80,b=x[2]/mxs*80;
    return '<rect x="'+X+'" y="'+(100-a)+'" width="16" height="'+a+'" rx="3" fill="#4dabf7"/><rect x="'+(X+18)+'" y="'+(100-b)+'" width="16" height="'+b+'" rx="3" fill="#ff922b"/><text x="'+(X+17)+'" y="118" font-size="11" text-anchor="middle" fill="currentColor">'+x[0]+'</text><text x="'+(X+8)+'" y="'+(96-a)+'" font-size="9" text-anchor="middle" fill="currentColor">'+nm(x[1])+'</text><text x="'+(X+26)+'" y="'+(96-b)+'" font-size="9" text-anchor="middle" fill="currentColor">'+nm(x[2])+'</text>'
  }).join('')+'<line x1="0" y1="100" x2="350" y2="100" stroke="#adb5bd"/></svg>';
  const RG=[['ar','أ','#ff6b6b','الحروف'],['en','Ab','#4dabf7','English'],['num','١٢٣','#51cf66','الأرقام'],['wd','📚','#f06595','الكلمات'],['sen','💬','#15aabf','الجمل']].map(x=>[sp(x[0]),x[2],x[1],x[3]]);
  RG.push([(cntK('L',1,14)+cntK('s',0,11))/26*100,'#d6336c','📖','قراءة ١'],[(cntK('t',0,6)+cntK('h',0,9))/17*100,'#7048e8','📗','قراءة ٢'],[cntK('c',0,5)/6*100,'#5f3dc4','🤖','برمجة'],[Math.min(100,(S.rounds.calc||0)/5*100),'#1971c2','🧮','حساب']);
  const weak=Object.entries(S.err).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>{
    const p=e[0].split(':'),x=SJ[p[0]]&&SJ[p[0]].d[p[1]];
    return x?(x[2]&&p[0]!=='num'?x[2]+' ':'')+x[0]:''
  }).filter(Boolean);
  const strong=RG.filter(r=>r[0]>=70).map(r=>r[3]);
  let nxt='';
  for(let i=1;i<=14&&!nxt;i++)if(!S.rd['L'+i])nxt='درس الحروف رقم '+nm(i);
  for(let i=0;i<RS.length&&!nxt;i++)if(!S.rd['s'+i])nxt='مرحلة «'+RS[i][0]+'»';
  for(let i=0;i<TS.length&&!nxt;i++)if(!S.rd['t'+i])nxt='درس «'+TS[i][0]+'» (الجزء الثاني)';
  for(let i=0;i<HS.length&&!nxt;i++)if(!S.rd['h'+i])nxt='حكاية «'+HS[i][0]+'»';
  const rec=[];
  if(sk===0)rec.push('لم يلعب اليوم بعد؛ شجّعه على جلسة قصيرة.');
  if(weak.length)rec.push('راجع معه: '+weak.slice(0,4).join('، ')+'.');
  if(nxt)rec.push('الخطوة القادمة في القراءة: '+nxt+'.');
  if(sk>=3)rec.push('أحسن! يواظب منذ '+nm(sk)+' أيام متتالية 🔥');
  if(!rec.length)rec.push('كل شيء رائع، استمر!');
  const K=(ic,v,l,c)=>'<div style="flex:1;min-width:105px;background:'+c+';color:#fff;border-radius:18px;padding:12px;text-align:center"><div style="font-size:26px">'+ic+'</div><div style="font-size:26px;font-weight:800">'+v+'</div><div style="font-size:13px;opacity:.95">'+l+'</div></div>',T=t=>'<h3 style="margin:22px 0 8px;border-right:6px solid #7048e8;padding-right:10px">'+t+'</h3>',chip=(t,c)=>'<span style="display:inline-block;background:'+c+';border-radius:20px;padding:4px 12px;margin:3px;font-weight:700">'+t+'</span>';
  h.innerHTML='<div style="background:linear-gradient(135deg,#7048e8,#f06595);color:#fff;border-radius:24px;padding:18px;display:flex;align-items:center;gap:16px"><div style="font-size:72px">'+pe+'</div><div style="flex:1"><div style="font-size:26px;font-weight:800">تقرير '+esc(PN()||'الطفل')+'</div><div>المستوى: '+lv[1]+' '+lv[2]+' · '+new Date().toLocaleDateString('ar-EG')+'</div></div><button class="btn np" id="pr" style="padding:6px 14px;font-size:16px">🖨️ اطبع</button></div>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+K('⭐',nm(S.stars),'إجمالي النجوم','#f59f00')+K('🔥',nm(sk),'أيام متتالية','#e8590c')+K('⏱️',nm(Math.floor(S.used/60))+' د','اليوم','#1c7ed6')+K('🎯',nm(gain()),'نجوم اليوم','#2f9e44')+K('💰',nm(bal()),'الرصيد','#ae3ec9')+'</div>'
  +T('📈 هذا الأسبوع')+'<div style="font-size:13px"><span style="color:#4dabf7">■</span> الدقائق &nbsp; <span style="color:#ff922b">■</span> النجوم</div>'+chart
  +T('🎓 إتقان المواد')+'<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">'+RG.map(r=>ring(r[0],r[1],r[2],r[3])).join('')+'</div>'
  +T('💪 نقاط القوة')+(strong.length?strong.map(x=>chip('✅ '+x,'#d3f9d8')).join(''):'<span style="opacity:.7">ستظهر هنا عندما يتقن مادة بنسبة ٧٠٪ أو أكثر</span>')
  +T('🔎 يحتاج دعمًا')+(weak.length?weak.map(x=>chip(x,'#ffe3e3')).join(''):'<span style="opacity:.7">لا توجد أخطاء متكررة 🎉</span>')
  +T('💡 توصيات')+'<div style="background:#fff9db;border-radius:14px;padding:10px 16px">'+rec.map(x=>'<div style="margin:6px 0">• '+x+'</div>').join('')+'</div>';
  $('#pr').onclick=()=>window.print()
};
