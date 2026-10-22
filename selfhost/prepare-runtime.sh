#!/bin/sh
set -eu
# Official pinned upstream release. No game content is fetched.
ROOT="${EMULATORMAYO_ROOT:-$(pwd)/storage}"
mkdir -p "$ROOT/downloads" "$ROOT/runtime" "$ROOT/roms"
curl -fL --retry 3 https://github.com/EmulatorJS/EmulatorJS/releases/download/v4.2.3/4.2.3.7z -o "$ROOT/downloads/4.2.3.7z"
docker run --rm -v "$ROOT:/work" python:3.12-slim sh -c 'pip -q install py7zr==1.0.0 && python -c "import py7zr; a=py7zr.SevenZipFile(\"/work/downloads/4.2.3.7z\"); a.extractall(path=\"/work/runtime\")"'
printf 'EmulatorJS 4.2.3 ready. Review runtime/LICENSE and upstream core licenses.\n'
