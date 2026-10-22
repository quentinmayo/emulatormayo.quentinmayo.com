"""Build-time download only. End users receive the runtime inside the installer."""
import hashlib
import json
import shutil
import urllib.request
from pathlib import Path
import py7zr

ROOT = Path(__file__).resolve().parent.parent
VERSION = '4.2.3'
DIGEST = '07d451bc06fa3ad04ab30d9b94eb63ac34ad0babee52d60357b002bde8f3850b'
URL = f'https://github.com/EmulatorJS/EmulatorJS/releases/download/v{VERSION}/{VERSION}.7z'
archive = ROOT.parent / '.local' / 'desktop-runtime' / f'{VERSION}.7z'
archive.parent.mkdir(parents=True, exist_ok=True)
if not archive.exists():
    print(f'Downloading official EmulatorJS {VERSION} runtime', flush=True)
    urllib.request.urlretrieve(URL, archive)
checksum = hashlib.sha256()
with archive.open('rb') as stream:
    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
        checksum.update(chunk)
if checksum.hexdigest() != DIGEST:
    raise SystemExit('Runtime checksum mismatch. Remove the archive and retry.')
runtime = ROOT / 'runtime'
if runtime.exists():
    shutil.rmtree(runtime)
runtime.mkdir()
with py7zr.SevenZipFile(archive) as package:
    for name in package.getnames():
        candidate = Path(name)
        if candidate.is_absolute() or '..' in candidate.parts or '\\' in name:
            raise SystemExit('Unsafe archive entry')
    package.extractall(runtime)
if not (runtime / 'data' / 'loader.js').is_file() or not (runtime / 'LICENSE').is_file():
    raise SystemExit('Runtime layout does not match the pinned release')
(runtime / 'UPSTREAM.json').write_text(json.dumps({'version': VERSION, 'archive': URL, 'sha256': DIGEST, 'source': f'https://github.com/EmulatorJS/EmulatorJS/tree/v{VERSION}'}, indent=2))
player = ROOT / 'player'
player.mkdir(exist_ok=True)
shutil.copyfile(ROOT.parent / 'LICENSE', ROOT / 'LICENSE')
for name in ['index.html', 'style.css', 'player.js']:
    shutil.copyfile(ROOT.parent / 'selfhost' / 'site' / name, player / name)
page = player / 'index.html'
page.write_text(page.read_text(encoding='utf-8').replace('PRIVATE PLAYER · EMULATORJS 4.2.3', 'DESKTOP PLAYER · EMULATORJS 4.2.3').replace('Files stay in this browser; there is no upload endpoint.', 'Your games stay on this device. The emulator runtime is included; no server or account is required.').replace('Some cores require HTTPS and BIOS files.', 'Some systems require your own BIOS files. Export saves before moving devices.'), encoding='utf-8')
print('Verified runtime and desktop player ready.', flush=True)
