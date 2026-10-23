const { test, expect, _electron } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
let app, page, data;
async function launch() {
  app = await _electron.launch({ args: [...(process.env.CI ? ['--no-sandbox'] : []), path.join(__dirname, '..')], env: { ...process.env, EMULATORMAYO_USER_DATA_DIRECTORY: data } });
  page = await app.firstWindow(); await page.locator('#gameFile').waitFor();
}
test.beforeEach(async () => { data = fs.mkdtempSync(path.join(os.tmpdir(), 'emulatormayo-desktop-')); await launch(); });
test.afterEach(async () => { if (app) await app.close(); fs.rmSync(data, { recursive: true, force: true }); });
test('the installed-style player is isolated, offline and ready for local files', async () => {
  await expect(page.locator('header')).toContainText('DESKTOP PLAYER');
  expect(await page.evaluate(() => [typeof require, typeof process, window.isSecureContext, window.crossOriginIsolated])).toEqual(['undefined', 'undefined', true, true]);
  expect(await page.evaluate(async () => { const r = await fetch('/data/loader.js'); return [r.status, (await r.text()).length > 100]; })).toEqual([200, true]);
  expect(await page.evaluate(async () => (await fetch('/data/%2e%2e%2f%2e%2e%2fpackage.json')).status)).toBe(404);
  await page.locator('#gameFile').setInputFiles({ name: 'local-test.nes', mimeType: 'application/octet-stream', buffer: Buffer.from('local fixture, not a game') });
  expect(await page.locator('#gameFile').evaluate(el => el.files[0].name)).toBe('local-test.nes');
});
test('browser saves retain a stable origin across app restarts', async () => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('save-fixture', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('saves');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => { const db = open.result, tx = db.transaction('saves', 'readwrite'); tx.objectStore('saves').put('progress', 'slot1'); tx.oncomplete = () => { db.close(); resolve(); }; };
    });
  });
  await app.close(); await launch();
  expect(await page.evaluate(() => new Promise(resolve => { const open = indexedDB.open('save-fixture'); open.onsuccess = () => { const db = open.result, get = db.transaction('saves').objectStore('saves').get('slot1'); get.onsuccess = () => { db.close(); resolve(get.result); }; }; }))).toBe('progress');
});
test('native game exit confirmation respects Stay and Leave', async () => {
  await page.evaluate(() => { window.onbeforeunload = event => { event.preventDefault(); event.returnValue = ''; }; });
  await app.evaluate(({ BrowserWindow, dialog }) => { const win = BrowserWindow.getAllWindows()[0]; win.prompts = 0; dialog.showMessageBoxSync = () => { win.prompts++; return 0; }; win.webContents.reload(); });
  await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].prompts)).toBe(1);
  await app.evaluate(({ BrowserWindow, dialog }) => { dialog.showMessageBoxSync = () => 1; BrowserWindow.getAllWindows()[0].webContents.reload(); });
  await page.locator('#gameFile').waitFor();
  expect(await page.evaluate(() => window.onbeforeunload)).toBe(null);
});
test('save exports reach native download handling', async () => {
  const output = path.join(data, 'save.sav');
  await app.evaluate(({ session }, output) => { session.defaultSession.on('will-download', (_event, item) => item.setSavePath(output)); }, output);
  await page.evaluate(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['save fixture'])); a.download = 'save.sav'; a.click(); });
  await expect.poll(() => fs.existsSync(output)).toBe(true);
  expect(fs.readFileSync(output, 'utf8')).toBe('save fixture');
});

test('Quit app can be cancelled and confirmed without clearing saves',async()=>{
 await expect(page.locator('#quit')).toBeVisible();
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:0});});
 await page.locator('#quit').click();await expect(page.locator('#gameFile')).toBeVisible();
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1});});
 const appProcess=app.process(); const closed=app.waitForEvent('close');await page.locator('#quit').click({noWaitAfter:true}).catch(error=>{if(!/closed/.test(error.message))throw error;});await closed;await expect.poll(()=>appProcess.exitCode).toBe(0);
});
test('player toolbar forwards existing save hooks, refuses unavailable actions, and opens with F10',async()=>{
 await page.keyboard.press('F10');await expect(page.locator('#player-actions')).toBeVisible();
 await page.locator('[data-player-action="saveState"]').click();await expect(page.locator('#player-action-status')).toContainText('Start a supported game');
 await page.evaluate(()=>{window.actions=[];const b=document.createElement('button');b.onclick=()=>window.actions.push('save');document.body.append(b);window.EJS_emulator={started:true,elements:{bottomBar:{saveState:[b]}}};});
 await page.locator('[data-player-action="saveState"]').click();expect(await page.evaluate(()=>window.actions)).toEqual(['save']);
 await page.keyboard.press('Escape');await expect(page.locator('#player-actions')).toBeHidden();
});

test('player touch toggle preserves the original toolbar and preference, then confirmed exit returns home',async()=>{
 await page.evaluate(() => {
 const parent = document.createElement('div'); parent.id='engine'; parent.tabIndex=-1; parent.style.cssText='position:relative;width:600px;height:300px';
 const pad = document.createElement('div'); pad.className='ejs_virtualGamepad_parent'; pad.textContent='Touch D-pad';
 const toolbar=document.createElement('button'); toolbar.id='original-toolbar'; toolbar.textContent='Save state';
 parent.append(pad,toolbar); document.body.prepend(parent);
 const handlers={}; window.EJS_emulator={started:true,virtualGamepad:pad,elements:{parent},toggleVirtualGamepad:show=>pad.style.display=show?'':'none',on:(event,callback)=>(handlers[event]??=[]).push(callback),callEvent:event=>(handlers[event]??[]).forEach(callback=>callback())};
});
 const toggle=page.getByRole('button',{name:'Hide touch controls'});
 await expect(toggle).toBeVisible();expect(await toggle.evaluate(b=>b.getBoundingClientRect().width<b.parentElement.getBoundingClientRect().width/2)).toBe(true);await toggle.click();
 await expect(page.locator('.ejs_virtualGamepad_parent')).toBeHidden();
 await expect(page.locator('#original-toolbar')).toBeVisible();
 await expect(page.getByRole('button',{name:'Show touch controls'})).toBeVisible();
 expect(await page.evaluate(()=>document.activeElement.id)).toBe('engine');
 // A fresh page/game must retain the choice, without retaining the exited game.
 await page.reload();
 await page.evaluate(() => {
 const parent = document.createElement('div'); parent.id='engine'; parent.tabIndex=-1; parent.style.cssText='position:relative;width:600px;height:300px';
 const pad = document.createElement('div'); pad.className='ejs_virtualGamepad_parent'; pad.textContent='Touch D-pad';
 const toolbar=document.createElement('button'); toolbar.id='original-toolbar'; toolbar.textContent='Save state';
 parent.append(pad,toolbar); document.body.prepend(parent);
 const handlers={}; window.EJS_emulator={started:true,virtualGamepad:pad,elements:{parent},toggleVirtualGamepad:show=>pad.style.display=show?'':'none',on:(event,callback)=>(handlers[event]??=[]).push(callback),callEvent:event=>(handlers[event]??[]).forEach(callback=>callback())};
});
 await expect(page.getByRole('button',{name:'Show touch controls'})).toBeVisible();
 await expect(page.locator('.ejs_virtualGamepad_parent')).toBeHidden();
 await page.getByRole('button',{name:'Show touch controls'}).click();
 await expect(page.locator('.ejs_virtualGamepad_parent')).toBeVisible();
 await page.evaluate(()=>{document.getElementById('setup').hidden=true;document.getElementById('playing').hidden=false;window.EJS_emulator.callEvent('exit');});
 await expect(page.locator('#setup')).toBeVisible();await expect(page.locator('#engine')).toHaveCount(0);
});
