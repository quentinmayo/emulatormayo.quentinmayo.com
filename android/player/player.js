"use strict";
const parameters=new URLSearchParams(location.search);
const id=parameters.get('game'),name=parameters.get('name'),core=parameters.get('core');
const systems=['nes','snes','gb','gbc','gba','segaMD','segaMS','segaGG','c64','n64','psx','atari2600'];
if(!/^[a-f0-9-]{36}$/.test(id||'')||!systems.includes(core)){
 document.getElementById('loading').textContent='Return to your library and select a game.';
}else{
 window.EJS_player='#game';window.EJS_core=core;
 window.EJS_gameUrl='/games/'+id+'/'+encodeURIComponent(name||'game');window.EJS_gameName=name||'game';window.EJS_gameID=parseInt(id.replaceAll('-','').slice(0,8),16);
 window.EJS_pathtodata='/data/';window.EJS_startOnLoaded=false;
 if(parameters.get('bios')==='1')window.EJS_biosUrl='/bios/'+id+'/bios.bin';
 window.EJS_onGameStart=()=>{document.getElementById('loading').hidden=true;};
 const loader=document.createElement('script');loader.src='/data/loader.js';
 loader.onload=()=>{document.getElementById('loading').hidden=true;};
 loader.onerror=()=>{document.getElementById('loading').textContent='The included emulator could not load. Return to the library, then reinstall the official APK if it happens again.';};
 document.body.append(loader);
}
