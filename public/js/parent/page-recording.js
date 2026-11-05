/* Parent page: record your own voice */
function recPage(h){
  let g=0,mr=null,ch=[];
  const ui=()=>{
    const G=RGS();
    h.innerHTML='<h2>🎙️ تسجيل صوتك</h2><p style="font-size:14px">اختر مجموعة ثم سجّل كل عبارة بصوتك، وسيستخدم الموقع تسجيلك بدل الصوت الآلي. قد يطلب المتصفح إذن الميكروفون.</p><div class="row">'+G.map((x,i)=>'<button class="btn" style="padding:6px 12px'+(i===g?';background:#ffd43b':'')+'" data-g="'+i+'">'+x[0]+'</button>').join(' ')+'</div>'+G[g][1].map((t,i)=>'<div style="display:flex;align-items:center;gap:6px;margin:6px 0"><span style="flex:1">'+(REC[t]?'✅ ':'⬜ ')+t+'</span><button class="btn" style="padding:4px 12px" data-p="'+i+'">▶️</button><button class="btn" style="padding:4px 12px" data-r="'+i+'">🎙️</button></div>').join('')+'<p id="rs2"></p>';
    h.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{
      g=+b.dataset.g;
      ui()
    });
    h.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>say(G[g][1][b.dataset.p]));
    h.querySelectorAll('[data-r]').forEach(b=>b.onclick=async()=>{
      const t=G[g][1][b.dataset.r],m=$('#rs2');
      if(mr){
        mr.stop();
        return
      }
      try{
        const st=await navigator.mediaDevices.getUserMedia({
          audio:true
        });
        ch=[];
        mr=new MediaRecorder(st);
        mr.ondataavailable=e=>ch.push(e.data);
        mr.onstop=async()=>{
          st.getTracks().forEach(x=>x.stop());
          const bl=new Blob(ch,{
            type:mr.mimeType
          });
          mr=null;
          await recSave(t,bl);
          ui();
          $('#rs2').textContent='✅ تم حفظ التسجيل'
        };
        mr.start();
        b.textContent='⏹️';
        m.textContent='🔴 جارٍ التسجيل... اضغط ⏹️ للإيقاف'
      } catch(e){
        m.textContent='⚠️ المتصفح لا يسمح بالتسجيل داخل هذه الصفحة. افتح الرابط في نافذة المتصفح مباشرة واسمح بالميكروفون.'
      }
    })
  };
  ui()
}

PG.rc=h=>recPage(h);
