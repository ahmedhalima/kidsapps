/* Parent's own voice recordings (IndexedDB) and playback */
const REC={},RB2={};

let RSRC=null;

const idb=()=>new Promise((res,rej)=>{
  const r=indexedDB.open('alam_rec',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('r');
  r.onsuccess=()=>res(r.result);
  r.onerror=()=>rej()
});

async function recLoad(){
  try{
    const d=await idb(),tx=d.transaction('r'),st=tx.objectStore('r'),ks=st.getAllKeys(),vs=st.getAll();
    await new Promise(r=>tx.oncomplete=r);
    ks.result.forEach((k,i)=>REC[k]=vs.result[i])
  } catch(e){}
}

async function recSave(k,b){
  REC[k]=b;
  delete RB2[k];
  try{
    const d=await idb();
    d.transaction('r','readwrite').objectStore('r').put(b,k)
  } catch(e){}
}

async function playRec(k,cb){
  try{
    try{
      speechSynthesis.cancel()
    } catch(e){}
    if(RSRC){
      try{
        RSRC.stop()
      } catch(e){}
    }
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')await AC.resume();
    if(!RB2[k])RB2[k]=await AC.decodeAudioData(await REC[k].arrayBuffer());
    const s=AC.createBufferSource();
    s.buffer=RB2[k];
    s.connect(AC.destination);
    RSRC=s;
    if(cb)s.onended=cb;
    s.start()
  } catch(e){
    delete REC[k];
    if(cb)cb()
  }
}

const RGS=()=>[['الحروف',AR.map((x,i)=>'حرف '+AN[i]+'، '+x[1])],['الأرقام',NW.slice()],['التشجيع',['أحسنت يا بطل','برافو عليك','ممتاز، شاطر جدًا','يا سلام، إجابة صحيحة','عظيم، استمر','حاول مرة أخرى','أحسنت','برافو']],['الكلمات',WD.map(x=>x[0])],['الأيام',TS[3][2].split(',')]];
