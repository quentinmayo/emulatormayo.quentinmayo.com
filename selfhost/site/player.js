"use strict";
const form=document.getElementById('launch'),status=document.getElementById('status');
let gameStarted=false;
window.addEventListener('beforeunload',event=>{if(gameStarted){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const game=document.getElementById('gameFile').files[0],bios=document.getElementById('biosFile').files[0];
 if(!game)return;
 window.EJS_player='#game';window.EJS_core=document.getElementById('system').value;
 window.EJS_gameUrl=URL.createObjectURL(game);window.EJS_gameName=game.name;
 if(bios)window.EJS_biosUrl=URL.createObjectURL(bios);
 window.EJS_pathtodata='/data/';window.EJS_startOnLoaded=false;
 window.EJS_color='#26734d';window.EJS_backgroundColor='#091610';
 window.EJS_onGameStart=()=>{gameStarted=true;document.title=game.name+' · Emulatormayo';};
 document.getElementById('title').textContent=game.name;
 document.getElementById('setup').hidden=true;document.getElementById('playing').hidden=false;
 const script=document.createElement('script');script.src='/data/loader.js';
 script.onerror=()=>{document.getElementById('setup').hidden=false;document.getElementById('playing').hidden=true;status.textContent='EmulatorJS runtime is unavailable. Ask the server owner to run prepare-runtime.sh.';};document.body.append(script);
});
document.getElementById('leave').addEventListener('click',()=>{if(confirm('Save your progress in the player before leaving. Choose another game?')){gameStarted=false;location.reload();}});

if (window.emulatormayoDesktop) {
 document.getElementById('desktop-exit').hidden=false;
 document.body.classList.add('desktop');
 window.emulatormayoDesktop.init().then(({deck})=>{
  document.body.classList.toggle('deck',!!deck);
  document.getElementById('exit-hint').textContent=deck?'Save first. Exit: Quit app or STEAM → Exit game.':'Save or export before quitting.';
 });
 document.getElementById('quit').addEventListener('click',()=>window.emulatormayoDesktop.quit());
}

if(window.emulatormayoDesktop){
 const panel=document.getElementById('player-actions');
 const toggle=(open)=>{panel.hidden=!open;document.body.classList.toggle('controls-open',open);document.getElementById('controls-toggle').setAttribute('aria-expanded',String(open));if(open)focusMenu();};
 const focusMenu=bindPlayerMenu(panel,toggle,()=>!panel.hidden);
 window.togglePlayerControls=()=>toggle(panel.hidden);
 document.getElementById('controls-toggle').addEventListener('click',window.togglePlayerControls);
 document.getElementById('bottom-home').addEventListener('click',()=>document.getElementById('leave').click());
 document.getElementById('bottom-fullscreen').addEventListener('click',()=>window.emulatormayoDesktop.fullscreen());
 for(const button of panel.querySelectorAll('[data-player-action]'))button.addEventListener('click',async()=>{
  try{const done=await window.emulatormayoDesktop.action(button.dataset.playerAction);document.getElementById('player-action-status').textContent=done?'Action sent to the player. Save/export completion is shown by the player.':'Action cancelled.';}
  catch(error){document.getElementById('player-action-status').textContent=error.message;}
 });
}

// EmulatorJS confirms Exit before sending this event. Return to file selection.
window.emulatormayoPlayer = { postMessage: message => {
 if (message !== 'exit') return;
 gameStarted = false;
 location.reload();
}};
