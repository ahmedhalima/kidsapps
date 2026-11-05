/* Small helpers: shuffle, Arabic digits, data parser, random pick, HTML escape */
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

const nm=n=>n.toLocaleString('ar-EG');

const P=s=>s.split(';').map(x=>x.split(','));

const rnd=n=>Math.floor(Math.random()*n),pk=a=>a[rnd(a.length)];

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

// Save a file: uses the sandbox download capability when present, otherwise a normal browser download
async function saveFile(blob,name){
  let dl=null;
  try{dl=window.claude&&await window.claude.use('downloads')}catch(e){}
  if(dl){
    try{await dl.save({filename:name,data:blob});return true}catch(e){return false}
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  return true
}
