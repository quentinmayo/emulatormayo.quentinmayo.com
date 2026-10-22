'use strict';
const path = require('node:path');
const fs = require('node:fs');

function resolveAsset(address, method, playerRoot, runtimeRoot) {
  if (!['GET', 'HEAD'].includes(method)) return null;
  let url, pathname;
  try { url = new URL(address); pathname = decodeURIComponent(url.pathname); } catch { return null; }
  if (url.protocol !== 'emulatormayo:' || url.host !== 'player' || url.username || url.password || /[\\\0:]/.test(pathname)) return null;
  let root, relative;
  if (pathname.startsWith('/data/')) { root = path.join(runtimeRoot, 'data'); relative = pathname.slice('/data/'.length); }
  else if (['/', '/index.html', '/style.css', '/player.js'].includes(pathname)) { root = playerRoot; relative = pathname === '/' ? 'index.html' : pathname.slice(1); }
  else return null;
  const target = path.resolve(root, relative);
  const within = path.relative(root, target);
  if (!within || within.startsWith('..') || path.isAbsolute(within)) return null;
  try {
    const realRoot = fs.realpathSync(root), realTarget = fs.realpathSync(target);
    const realRelative = path.relative(realRoot, realTarget);
    if (!realRelative || realRelative.startsWith('..') || path.isAbsolute(realRelative) || !fs.statSync(realTarget).isFile()) return null;
    return realTarget;
  } catch { return null; }
}

function externalLink(address) {
  try {
    const url = new URL(address);
    return url.protocol === 'https:' && !url.username && !url.password && ['emulatormayo.quentinmayo.com', 'rommayo.quentinmayo.com', 'emulatorjs.org', 'github.com', 'buymeacoffee.com'].includes(url.hostname);
  } catch { return false; }
}
module.exports = { resolveAsset, externalLink };
