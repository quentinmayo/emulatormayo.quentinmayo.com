#!/usr/bin/env bash
# Emulatormayo: pinned, checksum-verified installer. Source: https://github.com/quentinmayo/emulatormayo.quentinmayo.com/blob/12e86bad5193558fb5511146a9b6c6359687499f/scripts/install.sh
set -euo pipefail
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
curl --fail --location --silent --show-error --retry 2 --connect-timeout 15 --max-time 60 'https://raw.githubusercontent.com/quentinmayo/emulatormayo.quentinmayo.com/12e86bad5193558fb5511146a9b6c6359687499f/scripts/install.sh' -o "$work/install.sh"
if command -v sha256sum >/dev/null; then digest=$(sha256sum "$work/install.sh"); else digest=$(shasum -a 256 "$work/install.sh"); fi
if [ "${digest%% *}" != '6c0cd87a5c9aad31fb6fbfe48615d9443c0546581dc3e6a54439b1e5a68994ef' ]; then printf 'Installer checksum mismatch. Nothing was installed.\n' >&2; exit 1; fi
bash "$work/install.sh" --steam-deck "$@"
