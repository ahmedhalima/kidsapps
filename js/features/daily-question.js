/* Question of the day */
function dq(){
  view='dq';
  if(S.dq===today()){
    app.innerHTML='<div class="big">✅</div><h2>أجبت سؤال اليوم!</h2><p class="q">عُد غدًا لسؤال جديد 🌟</p>';
    return
  }
  const cv=q=>({
    big:q.big,q:q.q,say:q.say,o:q.o.map(x=>x[1]),a:(q.o.find(x=>x[0]==q.a)||[0,q.a])[1]
  });
  qz(Array.from({
    length:3
  },()=>cv(mk(pk(['ar','num','math','wd'])))),sc=>{
    S.dq=today();
    if(sc>=2)addStar(3);
    save();
    fz(sc,3,dq)
  })
}
