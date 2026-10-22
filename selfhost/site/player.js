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
 window.EJS_onGameStart=()=>{gameStarted=true;document.title=game.name+' · Emulatormayo';};
 document.getElementById('title').textContent=game.name;
 document.getElementById('setup').hidden=true;document.getElementById('playing').hidden=false;
 const script=document.createElement('script');script.src='/data/loader.js';
 script.onerror=()=>{document.getElementById('setup').hidden=false;document.getElementById('playing').hidden=true;status.textContent='EmulatorJS runtime is unavailable. Ask the server owner to run prepare-runtime.sh.';};document.body.append(script);
});
document.getElementById('leave').addEventListener('click',()=>{if(confirm('Save your progress in the player before leaving. Choose another game?')){gameStarted=false;location.reload();}});
