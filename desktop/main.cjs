'use strict';
const { app, BrowserWindow, protocol, net, session, dialog, shell, Menu, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { resolveAsset, externalLink } = require('./protocol-policy.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'emulatormayo', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
if (process.env.EMULATORMAYO_USER_DATA_DIRECTORY) app.setPath('userData', process.env.EMULATORMAYO_USER_DATA_DIRECTORY);
const {playerAction}=require('./player-actions.cjs');
const home = 'emulatormayo://player/index.html';
let window, quitting = false;
const deck = process.argv.includes('--deck');
async function quitApp() {
  const choice = await dialog.showMessageBox(window, { type: 'question', message: 'Quit Emulatormayo?', detail: 'Save or export your progress in the player first.', buttons: ['Stay', 'Quit app'], defaultId: 0, cancelId: 0 });
  if (choice.response !== 1) return;
  quitting = true; app.quit();
}

async function openExternal(address) {
  if (externalLink(address)) await shell.openExternal(address);
}

function createWindow() {
  window = new BrowserWindow({ width: 1200, height: 900, minWidth: 480, minHeight: 600, title: 'Emulatormayo', backgroundColor: '#091610', icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, allowRunningInsecureContent: false } });
  window.webContents.setWindowOpenHandler(({ url }) => { void openExternal(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => { if (url !== home) { event.preventDefault(); void openExternal(url); } });
  window.webContents.on('will-redirect', event => event.preventDefault());
  window.webContents.on('will-prevent-unload', event => {
    if (quitting) { event.preventDefault(); return; }
    const choice = dialog.showMessageBoxSync(window, { type: 'question', message: 'Leave this game?', detail: 'Save or export your progress in the player before leaving.', buttons: ['Stay', 'Leave game'], defaultId: 0, cancelId: 0 });
    if (choice === 1) event.preventDefault();
  });
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { event.preventDefault(); window.setFullScreen(!window.isFullScreen()); }
  });
  window.webContents.on('render-process-gone', () => { dialog.showErrorBox('The player stopped', 'Reopen Emulatormayo. Export regular save backups from the player to protect your progress.'); });
  window.loadURL(home);
  if (deck) window.setFullScreen(true);
  window.on('closed', () => { window = null; });
}

app.whenReady().then(() => {
  ipcMain.handle('emulatormayo:controls', async (event, command) => {
    if (event.sender !== window?.webContents || event.senderFrame?.url !== home) throw new Error('Untrusted command source.');
    if (command?.type === 'init') return { deck };
    if (command?.type === 'quit') return quitApp();
    if (command?.type === 'fullscreen') { window.setFullScreen(!window.isFullScreen()); return; }
    if (command?.type === 'action') {
      const script=playerAction(command.action);
      if (['loadState','loadSavFiles','restart'].includes(command.action)) {
        const choice=await dialog.showMessageBox(window,{type:'question',message:'Replace current game progress?',detail:'Save or export first. This action may replace your current progress.',buttons:['Cancel','Continue'],defaultId:0,cancelId:0});
        if(choice.response!==1) return false;
      }
      if(!await window.webContents.executeJavaScript(script,true)) throw new Error('Start a supported game first. This control must be enabled by the player.');
      return true;
    }
    throw new Error('Unknown command.');
  });
  const playerRoot = path.join(__dirname, 'player');
  const runtimeRoot = app.isPackaged ? path.join(process.resourcesPath, 'runtime') : path.join(__dirname, 'runtime');
  protocol.handle('emulatormayo', async request => {
    const file = resolveAsset(request.url, request.method, playerRoot, runtimeRoot);
    if (!file) return new Response('Not found', { status: 404 });
    const response = await net.fetch(pathToFileURL(file).href);
    const headers = new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'");
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
  });
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback) => callback(contents === window?.webContents && ['fullscreen', 'pointerLock', 'screen-wake-lock', 'persistent-storage'].includes(permission)));
  session.defaultSession.setPermissionCheckHandler((contents, permission) => contents === window?.webContents && ['fullscreen', 'pointerLock', 'screen-wake-lock', 'persistent-storage'].includes(permission));
  session.defaultSession.on('will-download', (_event, item) => {
    item.setSaveDialogOptions({ title: 'Export your game data', defaultPath: path.join(app.getPath('downloads'), path.basename(item.getFilename())) });
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { label: 'File', submenu: [{ label: 'Choose another game', click: () => window?.webContents.reload() }, { label: 'Quit Emulatormayo', accelerator: 'CmdOrCtrl+Q', click: quitApp }] },
    { label: 'View', submenu: [{ label:'Game controls (F10)', click:()=>window?.webContents.executeJavaScript('window.togglePlayerControls?.()') }, { role: 'togglefullscreen' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { label: 'Help', submenu: [{ label: 'Setup & compatibility', click: () => openExternal('https://emulatormayo.quentinmayo.com/getting-started') }, { label: 'EmulatorJS source & licenses', click: () => openExternal('https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3') }, { label: 'Buy the developers a coffee', click: () => openExternal('https://buymeacoffee.com/quentinmayo') }] },
  ]));
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
