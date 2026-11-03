/* Multiple children profiles */
const PL=()=>{
  try{
    const l=JSON.parse(localStorage.getItem('alam_profiles')||'null');
    if(l&&l.length)return l
  } catch(e){}
  return[{
    k:'alam_v1',name:'طفلي'
  }]
};

const PS=l=>{
  try{
    localStorage.setItem('alam_profiles',JSON.stringify(l))
  } catch(e){}
};

const PN=()=>{
  const c=PL().find(x=>x.k===KK);
  return c?c.name:''
};

function switchP(k){
  save();
  KK=k;
  try{
    localStorage.setItem('alam_cur',k)
  } catch(e){}
  let o=null;
  try{
    o=JSON.parse(localStorage.getItem(k))
  } catch(e){}
  S=Object.assign({
    pin:'1234',limit:30,extra:0,day:today(),used:0,stars:0,rounds:{},err:{},days:{},hab:{},chest:'',cd:'',rd:{}
  },o||{});
  if(S.day!==today()){
    S.day=today();
    S.used=0;
    S.extra=0
  }
  locked=false;
  ov.innerHTML='';
  NH=[];
  hdr();
  if(left()<=0)lock();
  else home()
}

function profiles(){
  view='prof';
  const l=PL();
  app.innerHTML='<h2>👨‍👩‍👧 الأطفال</h2><div class="grid">'+l.map((p,i)=>'<button class="tile" style="background:'+(p.k===KK?'#2b8a3e':'#4263eb')+'" data-i="'+i+'"><b>'+(p.k===KK?'✅':'👶')+'</b>'+p.name+'</button>').join('')+'</div><div class="row"><input id="pn" placeholder="اسم الطفل" style="width:200px"> <button class="btn" id="pa">➕ إضافة طفل</button></div><p style="font-size:14px">لكل طفل نجومه وتقدمه ووقت لعبه.</p>';
  app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>switchP(l[b.dataset.i].k));
  $('#pa').onclick=()=>{
    const n=$('#pn').value.trim();
    if(!n||l.length>=4)return;
    const k='alam_p'+Date.now();
    l.push({
      k,name:n
    });
    PS(l);
    switchP(k)
  }
}
