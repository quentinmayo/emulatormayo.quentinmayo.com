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
