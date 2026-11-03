/* Learn the clock */
const OR='الأولى,الثانية,الثالثة,الرابعة,الخامسة,السادسة,السابعة,الثامنة,التاسعة,العاشرة,الحادية عشرة,الثانية عشرة'.split(',');

const tt=(h,m)=>m===0?'الساعة '+OR[h-1]:m===30?'الساعة '+OR[h-1]+' والنصف':m===15?'الساعة '+OR[h-1]+' والربع':'الساعة '+OR[h%12]+' إلا ربعًا';

const fmtT=(h,m)=>nm(h)+':'+('0'+m).slice(-2).split('').map(d=>nm(+d)).join('');

const clk=(h,m)=>'<svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="92" fill="#fff" stroke="#333" stroke-width="5"/>'+Array.from({
  length:12
},(_,i)=>{
  const t=(i+1)*30*Math.PI/180;
  return '<text x="'+(100+72*Math.sin(t)).toFixed(1)+'" y="'+(108-72*Math.cos(t)).toFixed(1)+'" text-anchor="middle" font-size="20" fill="#333">'+(i+1)+'</text>'
}).join('')+'<line x1="100" y1="100" x2="100" y2="55" stroke="#e03131" stroke-width="8" stroke-linecap="round" transform="rotate('+((h%12+m/60)*30)+' 100 100)"/><line x1="100" y1="100" x2="100" y2="30" stroke="#1971c2" stroke-width="5" stroke-linecap="round" transform="rotate('+(m*6)+' 100 100)"/><circle cx="100" cy="100" r="6" fill="#333"/></svg>';

function clock(){
  view='clock';
  let h=3,m=0;
  const dr=()=>{
    app.innerHTML='<h2>🕒 تعلّم الساعة</h2><div>'+clk(h,m)+'</div><div class="q">'+tt(h,m)+' — '+fmtT(h,m)+'</div><p style="font-size:14px">🔴 العقرب القصير للساعات، 🔵 الطويل للدقائق</p><div class="row"><button class="btn" data-a="h">⏩ الساعات</button> <button class="btn" data-a="m">⏩ ١٥ دقيقة</button></div><div class="row"><button class="btn" id="cs">🔊 اسمع</button> <button class="btn" id="cg">🎮 اختبرني</button> <button class="btn" id="cu">🎯 اضبط الساعة</button></div>';
    app.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
      if(b.dataset.a==='h')h=h%12+1;
      else m=(m+15)%60;
      sfx.pop();
      dr()
    });
    $('#cs').onclick=()=>say(tt(h,m));
    $('#cu').onclick=setClock;
    $('#cg').onclick=()=>qz(Array.from({
      length:5
    },()=>{
      const H=1+rnd(12),M=pk([0,30,15,45]),a=tt(H,M);
      return{
        big:clk(H,M),q:'كم الساعة الآن؟',say:'كم الساعة الآن',rw:1,o:opts(a,[0,0,0].map(()=>tt(1+rnd(12),pk([0,30,15,45]))).concat([tt(H%12+1,M)])),a
      }
    }),sc=>fz(sc,5,clock))
  };
  dr()
}

function setClock(){
  view='clock';
  const H=1+rnd(12),M=pk([0,30]);
  let ch=12,cm=0;
  const t=()=>{
    app.innerHTML='<h2>اضبط الساعة على: '+tt(H,M)+'</h2><div>'+clk(ch,cm)+'</div><div class="row"><button class="btn" data-a="h">⏩ ساعة</button> <button class="btn" data-a="m">⏩ ٣٠ دقيقة</button> <button class="btn" id="ck">✅ تحقق</button></div><div id="cm" class="q"></div>';
    app.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
      if(b.dataset.a==='h')ch=ch%12+1;
      else cm=(cm+30)%60;
      sfx.pop();
      t()
    });
    $('#ck').onclick=()=>{
      if(ch===H&&cm===M){
        addStar(2);
        sfx.win();
        say('أحسنت');
        $('#cm').innerHTML='🎉 صحيح! +٢ ⭐ <button class="btn" id="cn">▶️ التالي</button>';
        $('#cn').onclick=setClock
      } else{
        sfx.no();
        $('#cm').textContent='حاول مرة أخرى'
      }
    }
  };
  t();
  say('اضبط الساعة على '+tt(H,M))
}
