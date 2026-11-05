/* Egyptian pound and the shop game */
const MV=[1,5,10,20,50],MC={
  1:'#ffd43b',5:'#69db7c',10:'#74c0fc',20:'#e599f7',50:'#ffa8a8'
};

const chip=v=>'<span style="display:inline-block;min-width:54px;padding:8px 10px;margin:3px;border-radius:'+(v<5?'50%':'8px')+';background:'+MC[v]+';color:#222;font-weight:800;border:3px solid #fff;box-shadow:0 3px 0 rgba(0,0,0,.2)">'+nm(v)+'</span>';

function money(){
  view='money';
  app.innerHTML='<h2>💰 النقود</h2><div class="grid"><button class="tile" style="background:#f59f00" id="m1"><b>🧮</b>عدّ النقود</button><button class="tile" style="background:#2f9e44" id="m2"><b>🛒</b>الدكان</button></div><p class="q">العملة: الجنيه المصري 🇪🇬</p>';
  $('#m1').onclick=()=>qz(Array.from({
    length:5
  },()=>{
    const a=Array.from({
      length:2+rnd(4)
    },()=>pk(MV.slice(0,4))),t=a.reduce((x,y)=>x+y,0);
    return{
      big:a.map(v=>chip(v)).join(''),q:'كم جنيهًا معي؟',say:'كم جنيها معي',o:opts(nm(t),[t-1,t+1,t+5,t-5,t+10].filter(x=>x>0&&x!==t).map(nm)),a:nm(t)
    }
  }),sc=>fz(sc,5,money));
  $('#m2').onclick=shop
}

function shop(){
  view='money';
  const IT=[['🍎',3],['🍌',5],['🥛',8],['🍞',4],['🍫',10],['🎈',6],['⚽',20],['🧸',15]];
  let n=0,sc=0;
  const s=()=>{
    if(n>=4){
      addStar(sc);
      return fz(sc,4,shop)
    }
    const it=pk(IT);
    let tot=0;
    app.innerHTML='<h2>🛒 اشترِ من الدكان</h2><div class="big">'+it[0]+'</div><div class="q">السعر: '+nm(it[1])+' جنيه</div><div class="pill" id="wl" style="min-width:140px;display:inline-block">معي: ٠</div><div class="row">'+MV.map(v=>'<span data-v="'+v+'" style="cursor:pointer">'+chip(v)+'</span>').join('')+'</div><div class="row"><button class="btn" id="pay">💵 ادفع</button> <button class="btn" id="clr">🗑️ امسح</button></div><div id="pm" class="q"></div>';
    say('السعر '+nm(it[1])+' جنيه');
    app.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{
      tot+=+b.dataset.v;
      sfx.pop();
      $('#wl').textContent='معي: '+nm(tot)
    });
    $('#clr').onclick=()=>{
      tot=0;
      $('#wl').textContent='معي: ٠'
    };
    $('#pay').onclick=()=>{
      if(tot===it[1]){
        sc++;
        sfx.win();
        say('أحسنت');
        n++;
        setTimeout(s,900)
      } else{
        sfx.no();
        $('#pm').textContent=tot>it[1]?'المبلغ أكبر من السعر':'المبلغ أقل من السعر'
      }
    }
  };
  s()
}
