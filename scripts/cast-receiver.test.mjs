import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fallbackStatus,startFallback,RECEIVER_NAMESPACE} from '../public/cast/receiver.mjs';
const now=1800000000000;
const message=()=>({type:'boogie-tv-bootstrap',version:1,requestId:'a'.repeat(32),expiresAt:now+120000,pairing:{baseUrl:'https://10.0.0.1',certificateSha256:'b'.repeat(64),invitationSecret:'s'.repeat(32)},role:'spectator',quality:'balanced'});
test('fallback replies only with correlated refusal and never echoes pairing or arbitrary fields',()=>{
 const expected={type:'boogie-tv-status',version:1,requestId:'a'.repeat(32),status:'error'};
 assert.deepEqual(fallbackStatus(message(),now),expected);assert.deepEqual(fallbackStatus(JSON.stringify(message()),now),expected);
 const output=JSON.stringify(fallbackStatus(message(),now));for(const forbidden of ['https:','baseUrl','invitationSecret','certificateSha256','s'.repeat(32)])assert.equal(output.includes(forbidden),false);
 assert.equal(fallbackStatus({...message(),hostCredential:'forbidden'},now),null);
});
test('invalid, expired, oversized, uncorrelated and player messages produce no response',()=>{
 for(const change of [{role:'player2'},{requestId:'bad'},{version:2},{quality:'sharp'},{expiresAt:now},{expiresAt:now+120001}])assert.equal(fallbackStatus({...message(),...change},now),null);
 for(const data of [null,'not json',JSON.stringify({...message(),pairing:{padding:'x'.repeat(3000)}})])assert.equal(fallbackStatus(data,now),null);
});
test('CAF receiver registers one namespace, disables media loading and responds only to original sender',()=>{
 const listeners=[],responses=[],interceptors=[],starts=[],note={textContent:''};
 const framework={CastReceiverContext:{getInstance:()=>({addCustomMessageListener:(...args)=>listeners.push(args),sendCustomMessage:(...args)=>responses.push(args),getPlayerManager:()=>({setMessageInterceptor:(...args)=>interceptors.push(args)}),start:options=>starts.push(options)})},messages:{MessageType:{LOAD:'load'}},system:{MessageType:{JSON:'json'}}};
 assert.equal(startFallback(framework,{getElementById:()=>note},()=>now),true);
 assert.equal(listeners.length,1);assert.equal(listeners[0][0],RECEIVER_NAMESPACE);assert.equal(interceptors[0][1](),null);assert.equal(starts[0].skipPlayersLoad,true);
 listeners[0][1]({senderId:'only-this-sender',data:message()});assert.equal(responses.length,1);assert.equal(responses[0][1],'only-this-sender');assert.equal(responses[0][2].status,'error');assert.match(note.textContent,/did not join/);
 listeners[0][1]({senderId:'',data:message()});assert.equal(responses.length,1);
});
test('fallback has no broker, input, storage, logs, dynamic DOM or embedded credentials path',()=>{
 const source=readFileSync(new URL('../public/cast/receiver.mjs',import.meta.url),'utf8');
 for(const forbidden of [/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bWebSocket\b/,/\bRTCPeerConnection\b/,/\blocalStorage\b/,/\bsessionStorage\b/,/console\./,/innerHTML/,/data\.pairing/])assert.equal(forbidden.test(source),false,String(forbidden));
 assert.equal(startFallback({}, {getElementById:()=>null}),false);
});
