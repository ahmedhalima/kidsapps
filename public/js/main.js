/* Startup: wire the top bar buttons, connect to the server if there is one, then show the first screen */
$('#bPar').onclick=()=>askPin(parentPage);
$('#bHome').onclick=()=>{if(!locked)home()};
$('#bBack').onclick=goBack;
recLoad();
hdr();

async function start(){
  try{
    await Cloud.init();                // sets Cloud.on when served by our server (accounts + MySQL)
    if(Cloud.on){
      if(!Cloud.user){location.replace('login.html');return}
      await Cloud.flow();              // choose which child is playing and load the progress
    }
  }catch(e){console.error('Cloud start failed, using local mode',e);Cloud.on=false}
  hdr();
  if(left()<=0)lock();else home();
}
start();
