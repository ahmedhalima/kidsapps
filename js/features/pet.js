/* Virtual pet and reward shop */
const PETS=['🐱','🐶','🐰','🐼','🦊'],ITM=[['🎩','قبعة',10,'h'],['👑','تاج',20,'h'],['🎀','فيونكة',8,'h'],['🕶️','نظارة',15,'g'],['🌈','قوس قزح',12,'b'],['🏰','قلعة',25,'b'],['🌳','حديقة',18,'b'],['🌊','بحر',18,'b']];

function pet(){
  view='pet';
  const pe=S.pet||'🐱',f=S.pf||0,sz=f<5?70:f<15?100:f<30?130:160,own=S.own||{},eq=S.eq||{};
  app.innerHTML='<h2>🐾 حيواني الأليف</h2><div class="pill">رصيدك: ⭐ '+nm(bal())+'</div><div style="position:relative;display:inline-block;margin:40px 60px 20px;font-size:'+sz+'px">'+(eq.b?'<span style="position:absolute;top:-10px;left:-60px;font-size:50px">'+eq.b+'</span>':'')+pe+(eq.h?'<span style="position:absolute;top:-'+Math.round(sz*.35)+'px;left:50%;transform:translateX(-50%);font-size:'+Math.round(sz*.55)+'px">'+eq.h+'</span>':'')+(eq.g?'<span style="position:absolute;top:'+Math.round(sz*.2)+'px;left:50%;transform:translateX(-50%);font-size:'+Math.round(sz*.5)+'px">'+eq.g+'</span>':'')+'</div><div class="q">'+(f<5?'صغير':f<15?'يكبر':f<30?'كبير':'عملاق')+' — أطعمته '+nm(f)+' مرة</div><div class="row"><button class="btn" id="fd">🍎 أطعمه (٢ ⭐)</button> <button class="btn" id="ch">🔄 غيّر الحيوان</button></div><h3>🛍️ المتجر</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">'+ITM.map((x,i)=>'<div class="card" data-i="'+i+'"><div class="E">'+x[0]+'</div><small>'+x[1]+'<br>'+(own[x[0]]?(eq[x[3]]===x[0]?'✅ يلبسه':'🎒 ألبسه'):'⭐ '+nm(x[2]))+'</small></div>').join('')+'</div>';
  $('#fd').onclick=()=>{
    if(bal()<2){
      sfx.no();
      say('اجمع نجومًا أكثر');
      return
    }
    S.spent=(S.spent||0)+2;
    S.pf=f+1;
    save();
    sfx.ok();
    say('شكرا، لذيذ');
    pet()
  };
  $('#ch').onclick=()=>{
    S.pet=PETS[(PETS.indexOf(pe)+1)%PETS.length];
    save();
    pet()
  };
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    const x=ITM[c.dataset.i];
    S.own=S.own||{};
    S.eq=S.eq||{};
    if(!S.own[x[0]]){
      if(bal()<x[2]){
        sfx.no();
        say('نجومك لا تكفي');
        return
      }
      S.spent=(S.spent||0)+x[2];
      S.own[x[0]]=1;
      S.eq[x[3]]=x[0];
      sfx.win()
    } else S.eq[x[3]]=S.eq[x[3]]===x[0]?'':x[0];
    save();
    pet()
  })
}
