const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { resolveAsset, externalLink } = require('../protocol-policy.cjs');

test('bundled asset resolution never exposes arbitrary local files', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'emulatormayo-policy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const player = path.join(root, 'player'), runtime = path.join(root, 'runtime');
  fs.mkdirSync(player); fs.mkdirSync(path.join(runtime, 'data'), { recursive: true });
  fs.writeFileSync(path.join(player, 'index.html'), 'player');
  fs.writeFileSync(path.join(runtime, 'data/loader.js'), 'runtime');
  fs.writeFileSync(path.join(root, 'private.txt'), 'private');
  assert.equal(resolveAsset('emulatormayo://player/index.html', 'GET', player, runtime), fs.realpathSync(path.join(player, 'index.html')));
  assert.equal(resolveAsset('emulatormayo://player/data/loader.js?v=4.2.3', 'HEAD', player, runtime), fs.realpathSync(path.join(runtime, 'data/loader.js')));
  for (const url of ['file:///private.txt', 'https://player/index.html', 'emulatormayo://other/index.html', 'emulatormayo://user@player/index.html', 'emulatormayo://player/private.txt', 'emulatormayo://player/data/../../private.txt', 'emulatormayo://player/data/%2e%2e%2f%2e%2e%2fprivate.txt', 'emulatormayo://player/data/%5c..%5cprivate.txt', 'emulatormayo://player/data/%00.js', 'emulatormayo://player/data/%E0%A4%A']) {
    assert.equal(resolveAsset(url, 'GET', player, runtime), null, url);
  }
  assert.equal(resolveAsset('emulatormayo://player/index.html', 'POST', player, runtime), null);
  if (process.platform !== 'win32') {
    fs.symlinkSync(path.join(root, 'private.txt'), path.join(runtime, 'data/link.js'));
    assert.equal(resolveAsset('emulatormayo://player/data/link.js', 'GET', player, runtime), null);
  }
});
test('only known HTTPS project links open outside the player', () => {
  assert.equal(externalLink('https://github.com/EmulatorJS/EmulatorJS'), true);
  for (const address of ['file:///etc/passwd', 'javascript:alert(1)', 'http://github.com/', 'https://github.com.evil.example/', 'https://x@github.com/', 'https://unrelated.example/']) assert.equal(externalLink(address), false);
});
