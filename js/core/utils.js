/* Small helpers: shuffle, Arabic digits, data parser, random pick, HTML escape */
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

const nm=n=>n.toLocaleString('ar-EG');

const P=s=>s.split(';').map(x=>x.split(','));

const rnd=n=>Math.floor(Math.random()*n),pk=a=>a[rnd(a.length)];

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
