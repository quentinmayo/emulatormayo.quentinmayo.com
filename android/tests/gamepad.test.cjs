const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
function fixture() {
 const browser = [{id:'browser',index:0}];
 const context = vm.createContext({navigator:{getGamepads:()=>browser},performance:{now:()=>1},setTimeout:()=>1});
 context.window = context;
 vm.runInContext(fs.readFileSync(path.join(root,'android/player/native-gamepad.js'),'utf8'), context);
 vm.runInContext(fs.readFileSync(path.join(root,'desktop/runtime/data/src/gamepad.js'),'utf8'), context);
 const handler = new context.GamepadHandler(), events=[];
 for (const type of ['connected','disconnected','buttondown','buttonup','axischanged']) handler.on(type,e=>events.push(e));
 context.EJS_emulator = {gamepad:handler};
 const pad=()=>({id:'Android: Retroid "controller"',buttons:Array(17).fill(0),axes:[0,0,0,0]});
 return {context,handler,events,pad};
}
test('native controller connects after player setup; short presses and remaps keep standard labels',()=>{
 const {context:c,handler:h,events,pad}=fixture();
 // Early state must not claim the controller before EmulatorJS installs listeners.
 c.emulatormayoGamepads([pad(),null,null,null]);
 assert.equal(c.navigator.getGamepads()[0],null);
 c.emulatormayoEnableGamepads();
 assert.equal(c.navigator.getGamepads()[0].mapping,'standard');
 // Start clean: actual player starts with no browser pads on this device.
 h.gamepads=[];events.length=0;h.updateGamepadState();
 assert.equal(events[0].type,'connected');
 const p=pad();p.buttons[0]=1;p.buttons[12]=1;p.axes[0]=-.8;
 c.emulatormayoGamepads([p,null,null,null]);
 c.emulatormayoGamepads([pad(),null,null,null]);
 assert.ok(events.some(e=>e.type==='buttondown'&&e.label==='BUTTON_1'));
 assert.ok(events.some(e=>e.type==='buttondown'&&e.label==='DPAD_UP'));
 assert.ok(events.some(e=>e.type==='buttonup'&&e.label==='BUTTON_1'));
 assert.ok(events.some(e=>e.type==='axischanged'&&e.axis==='LEFT_STICK_X'&&e.value===-.8));
 assert.ok(events.some(e=>e.type==='axischanged'&&e.value===0));
});
test('pause releases buttons before disconnect, then a replacement can reconnect at player one',()=>{
 const {context:c,handler:h,events,pad}=fixture();h.gamepads=[];
 c.emulatormayoGamepads([pad(),null,null,null]);c.emulatormayoEnableGamepads();
 const p=pad();p.buttons[1]=1;c.emulatormayoGamepads([p,null,null,null]);
 c.emulatormayoGamepads([pad(),null,null,null]);
 c.emulatormayoGamepads([null,null,null,null]);
 assert.ok(events.some(e=>e.type==='buttonup'&&e.label==='BUTTON_2'));
 assert.equal(events.at(-1).type,'disconnected');
 c.emulatormayoGamepads([pad(),null,null,null]);
 assert.equal(events.at(-1).type,'connected');assert.equal(h.gamepads.length,1);
});
test('invalid numeric reports are bounded and controller names remain data',()=>{
 const {context:c,pad}=fixture();const p=pad();p.axes=[NaN,Infinity,-4,4];p.buttons[0]=Infinity;
 c.emulatormayoGamepads([p,null,null,null]);c.emulatormayoEnableGamepads();
 const out=c.navigator.getGamepads()[0];
 assert.deepEqual(Array.from(out.axes),[0,0,-1,1]);assert.equal(out.buttons[0].value,0);
 assert.equal(out.id,p.id);
 c.emulatormayoGamepads({});assert.equal(c.navigator.getGamepads()[0].id,p.id);
});
