/* Non-playing CAF fallback. Never join a broker or inspect/retain pairing data. */
export const RECEIVER_NAMESPACE='urn:x-cast:com.boogiewoogie.tv';
const ROOT_KEYS=['type','version','requestId','expiresAt','pairing','role','quality'];
export function fallbackStatus(data,now=Date.now()){
 try{
  if(typeof data==='string'){
   if(new TextEncoder().encode(data).length>2048)return null;
   data=JSON.parse(data);
  }else if(!data||new TextEncoder().encode(JSON.stringify(data)).length>2048)return null;
  if(!data||Object.getPrototypeOf(data)!==Object.prototype||Object.keys(data).length!==ROOT_KEYS.length||!ROOT_KEYS.every(key=>Object.hasOwn(data,key))||data.type!=='boogie-tv-bootstrap'||data.version!==1||data.role!=='spectator'||data.quality!=='balanced'||typeof data.requestId!=='string'||!/^[a-f0-9]{32}$/.test(data.requestId)||!Number.isSafeInteger(now)||!Number.isSafeInteger(data.expiresAt)||data.expiresAt<=now||data.expiresAt-now>120000)return null;
  // Only correlate a refusal. Do not validate, connect to, echo or store pairing.
  return Object.freeze({type:'boogie-tv-status',version:1,requestId:data.requestId,status:'error'});
 }catch{return null;}
}
export function startFallback(framework,document,now=Date.now){
 const note=document.getElementById('receiverStatus');
 if(!framework?.CastReceiverContext)return false;
 try{
  const context=framework.CastReceiverContext.getInstance();
  if(framework.LoggerLevel?.NONE!==undefined)context.setLoggerLevel(framework.LoggerLevel.NONE);
  context.addCustomMessageListener(RECEIVER_NAMESPACE,event=>{
   if(typeof event?.senderId!=='string'||!event.senderId||event.senderId.length>128)return;
   const response=fallbackStatus(event.data,now());
   if(!response)return;
   try{context.sendCustomMessage(RECEIVER_NAMESPACE,event.senderId,response);}catch{}
   if(note)note.textContent='The installed Google TV receiver app is required. This fallback did not join your game; existing players can keep playing.';
  });
  // Never allow a sender media URL to become an unrelated playback/network path.
  const manager=context.getPlayerManager();
  manager.setMessageInterceptor(framework.messages.MessageType.LOAD,()=>null);
  context.start({customNamespaces:{[RECEIVER_NAMESPACE]:framework.system.MessageType.JSON},skipPlayersLoad:true,statusText:'Google TV receiver app required'});
  return true;
 }catch{return false;}
}
// Loading follows the explicit Cast launch, not an automatic sender-page action.
if(typeof window!=='undefined'&&typeof document!=='undefined'){
 const start=()=>startFallback(window.cast?.framework,document);
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
}
