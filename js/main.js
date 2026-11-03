/* Startup: wire the top bar buttons and show the first screen */
$('#bPar').onclick=()=>askPin(parentPage);
$('#bHome').onclick=()=>{if(!locked)home()};
$('#bBack').onclick=goBack;
recLoad();
hdr();
if(left()<=0)lock();else home();
