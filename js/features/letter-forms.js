/* Arabic letter forms: isolated, initial, medial, final */
const NJ='ادذرزوأإآةء',fm=c=>NJ.includes(c)?[c,c,'ـ'+c,'ـ'+c]:[c,c+'ـ','ـ'+c+'ـ','ـ'+c];

function forms(){
  view='forms';
  app.innerHTML='<h2>🔤 أشكال الحرف</h2><p class="q">الحرف يتغير شكله في أول الكلمة ووسطها وآخرها</p><p style="font-size:14px">من اليمين: منفصل · أول · وسط · آخر</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">'+ABJ.split('').map((c,i)=>'<div class="card" data-i="'+i+'"><div class="rw" style="font-size:34px;direction:rtl;white-space:nowrap">'+fm(c).join(' &nbsp;')+'</div><small>'+AN[i]+'</small></div>').join('')+'</div><div class="row"><button class="btn" id="g">🎮 اختبرني</button></div>';
  app.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    sfx.pop();
    say('حرف '+AN[c.dataset.i])
  });
  $('#g').onclick=()=>qz(Array.from({
    length:6
  },()=>{
    const L=ABJ.split(''),c=pk(L),f=fm(c)[1+rnd(3)];
    return{
      big:'<span class="rw" style="font-size:70px">'+f+'</span>',q:'أي حرف هذا؟',say:'أي حرف هذا',o:opts(c,L),a:c
    }
  }),sc=>fz(sc,6,forms))
}
