/* Back / Home navigation history. Wraps screen functions so "Back" returns to the previous screen. */
let NH=[],INQ=false;
const NAV_SCREENS=["home", "sub", "learn", "play", "color", "mem", "habits", "hab", "chk", "fun", "bub", "odd", "snd", "prt", "rew", "read", "read2", "lesson", "stage", "stg", "story", "nums", "numLearn", "numGame", "calc", "puz", "riddle", "oddout", "pattern", "vanish", "simon", "diy", "paint", "chara", "sentm", "wordb", "anl", "anl1", "code", "codeLv", "ordg", "shd", "fl", "mole", "colg", "more", "hub", "clock", "setClock", "money", "shop", "science", "shapes", "duas", "sura", "english", "engT", "istories", "ist", "pet", "certs", "maze", "jig", "race", "trace", "trace1", "profiles", "feel", "safe", "tasks", "calm", "sortg", "dots", "ach", "dq", "cbn", "bub2", "sentOrd", "forms"];
NAV_SCREENS.forEach(n=>{
  const f=window[n];
  if(typeof f!=='function')return;
  window[n]=function(...a){
    INQ=false;
    if(n==='home')NH=[];
    const t=NH[NH.length-1],e={n,r:()=>f(...a)};
    if(t&&t.n===n)NH[NH.length-1]=e;else NH.push(e);
    return f(...a);
  };
});
// quiz screens: Back returns to the screen that started the quiz
["qz", "rf", "fz", "fin"].forEach(n=>{
  const f=window[n];
  window[n]=function(...a){INQ=true;return f(...a)};
});
function goBack(){
  if(locked)return;
  if(INQ){INQ=false;const t=NH[NH.length-1];t?t.r():home();return}
  NH.pop();
  const t=NH[NH.length-1];
  t?t.r():home();
}
