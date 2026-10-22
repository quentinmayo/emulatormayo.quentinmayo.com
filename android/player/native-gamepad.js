"use strict";
// Android owns gamepad input in this local player. Present standard browser pads
// so EmulatorJS keeps its normal controller selection and remapping UI.
(() => {
 let native = false, pads = [null, null, null, null];
 Object.defineProperty(navigator, 'getGamepads', {value: () => native ? pads.slice() : [null, null, null, null]});
 window.emulatormayoGamepads = states => {
  if (!Array.isArray(states) || states.length !== 4) return;
  pads = states.map((state, index) => {
   if (!state) return null;
   if (typeof state.id !== 'string' || !Array.isArray(state.buttons) || state.buttons.length !== 17 || !Array.isArray(state.axes) || state.axes.length !== 4) return null;
   return {id: state.id, index, connected: true, mapping: 'standard', timestamp: performance.now(),
    buttons: state.buttons.map(value => {const v = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0; return {value: v, pressed: v > .5, touched: v > 0};}),
    axes: state.axes.map(value => Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0)};
  });
  if (native) window.EJS_emulator?.gamepad?.updateGamepadState();
 };
 window.emulatormayoEnableGamepads = () => {
  native = true;
  window.EJS_emulator?.gamepad?.updateGamepadState();
 };
})();
