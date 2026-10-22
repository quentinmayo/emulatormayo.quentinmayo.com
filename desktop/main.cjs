'use strict';
const { app, BrowserWindow, protocol, net, session, dialog, shell, Menu } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { resolveAsset, externalLink } = require('./protocol-policy.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'emulatormayo', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
if (process.env.EMULATORMAYO_USER_DATA_DIRECTORY) app.setPath('userData', process.env.EMULATORMAYO_USER_DATA_DIRECTORY);
const home = 'emulatormayo://player/index.html';
let window;

async function openExternal(address) {
  if (externalLink(address)) await shell.openExternal(address);
}

function createWindow() {
  window = new BrowserWindow({ width: 1200, height: 900, minWidth: 480, minHeight: 600, title: 'Emulatormayo', backgroundColor: '#0d1513', icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, allowRunningInsecureContent: false } });
  window.webContents.setWindowOpenHandler(({ url }) => { void openExternal(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => { if (url !== home) { event.preventDefault(); void openExternal(url); } });
  window.webContents.on('will-redirect', event => event.preventDefault());
  window.webContents.on('will-prevent-unload', event => {
    const choice = dialog.showMessageBoxSync(window, { type: 'question', message: 'Leave this game?', detail: 'Save or export your progress in the player before leaving.', buttons: ['Stay', 'Leave game'], defaultId: 0, cancelId: 0 });
    if (choice === 1) event.preventDefault();
  });
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { event.preventDefault(); window.setFullScreen(!window.isFullScreen()); }
  });
  window.webContents.on('render-process-gone', () => { dialog.showErrorBox('The player stopped', 'Reopen Emulatormayo. Export regular save backups from the player to protect your progress.'); });
  window.loadURL(home);
  if (process.argv.includes('--deck')) window.setFullScreen(true);
  window.on('closed', () => { window = null; });
}

app.whenReady().then(() => {
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
    { label: 'File', submenu: [{ label: 'Choose another game', click: () => window?.webContents.reload() }, { role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'togglefullscreen' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { label: 'Help', submenu: [{ label: 'Setup & compatibility', click: () => openExternal('https://emulatormayo.quentinmayo.com/getting-started') }, { label: 'EmulatorJS source & licenses', click: () => openExternal('https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3') }, { label: 'Buy the developers a coffee', click: () => openExternal('https://buymeacoffee.com/quentinmayo') }] },
  ]));
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
