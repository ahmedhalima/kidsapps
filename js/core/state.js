/* Global state, storage and per-child save/load */
const $=s=>document.querySelector(s),app=$('#app'),ov=$('#ov'),K='alam_v1';

let KK;

try{
  KK=localStorage.getItem('alam_cur')||K
} catch(e){
  KK=K
}

let S,view='home',locked=false;

const today=()=>new Date().toISOString().slice(0,10);

try{
  S=JSON.parse(localStorage.getItem(KK))
} catch(e){}

S=Object.assign({
  pin:'1234',limit:30,extra:0,day:today(),used:0,stars:0,rounds:{},err:{},days:{},hab:{},chest:'',cd:'',rd:{}
},S||{});

if(S.day!==today()){
  S.day=today();
  S.used=0;
  S.extra=0
}

const save=()=>{
  try{
    localStorage.setItem(KK,JSON.stringify(S))
  } catch(e){}
};
