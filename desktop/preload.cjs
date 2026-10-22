'use strict';
const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('emulatormayoDesktop', {
  init: () => ipcRenderer.invoke('emulatormayo:controls', {type:'init'}),
  quit: () => ipcRenderer.invoke('emulatormayo:controls', {type:'quit'}),
  fullscreen: () => ipcRenderer.invoke('emulatormayo:controls', {type:'fullscreen'}),
  action: (action) => ipcRenderer.invoke('emulatormayo:controls', {type:'action',action})
});
