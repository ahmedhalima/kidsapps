/* Sound effects and speech (browser voices, uses recordings when available) */
let AC;

function tone(f,d,t,v,w){
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+(w||0);
    o.type=t||'sine';
    o.frequency.value=f;
    o.connect(g);
    g.connect(AC.destination);
    g.gain.setValueAtTime(v||.18,n);
    g.gain.exponentialRampToValueAtTime(.001,n+d);
    o.start(n);
    o.stop(n+d)
  } catch(e){}
}

const sfx={
  pop:()=>tone(520,.12,'triangle'),ok:()=>{
    tone(660,.15);
    tone(880,.25,'sine',.2,.12)
  },no:()=>tone(200,.25,'triangle',.15),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.28,'sine',.2,i*.13))
};

function pick(L){
  const p=L.slice(0,2),vs=speechSynthesis.getVoices().filter(v=>v.lang.replace('_','-').slice(0,2)===p);
  if(!vs.length)return null;
  const cv=vs.find(v=>v.name===(p==='ar'?S.va:S.ve));
  if(cv)return cv;
  const sc=v=>(/natural|neural|online|enhanced|premium|siri|google/i.test(v.name)?10:0)+(v.lang.replace('_','-')===L?5:0)+(/compact|espeak/i.test(v.name)?-20:0)+(v.localService?0:2);
  return vs.sort((a,b)=>sc(b)-sc(a))[0]
}

try{
  speechSynthesis.onvoiceschanged=()=>{}
} catch(e){}

function say(t,l,cb){
  try{
    if(REC[String(t)]){
      playRec(String(t),cb);
      return
    }
    const L=(!l||l.slice(0,2)==='ar')?'ar-EG':l;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(t).replace(/\s*\.\.\.\s*/g,'، ')),v=pick(L);
    u.lang=L;
    if(v)u.voice=v;
    u.rate=(S.vr||90)/100*(L==='en-US'?.97:1);
    u.pitch=1.05;
    if(cb)u.onend=cb;
    speechSynthesis.speak(u)
  } catch(e){}
}

const praise=()=>say(shuf(['أحسنت يا بطل','برافو عليك','ممتاز، شاطر جدًا','يا سلام، إجابة صحيحة','عظيم، استمر'])[0]);

const say2=(a,b)=>say(a,'ar-SA',()=>say(b,'en-US'));
