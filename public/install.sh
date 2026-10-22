#!/usr/bin/env bash
# Emulatormayo: pinned, checksum-verified installer. Source: https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/blob/103a748eebd89198cd4ee2df119ecf51b20a4016/scripts/install.sh
set -euo pipefail
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
curl --fail --location --silent --show-error --retry 2 --connect-timeout 15 --max-time 60 'https://raw.githubusercontent.com/securelyprogramming/emulatormayo.quentinmayo.com/103a748eebd89198cd4ee2df119ecf51b20a4016/scripts/install.sh' -o "$work/install.sh"
if command -v sha256sum >/dev/null; then digest=$(sha256sum "$work/install.sh"); else digest=$(shasum -a 256 "$work/install.sh"); fi
if [ "${digest%% *}" != '8a74105bfc12fdb1b6ea4c09ae37cac0363d156bcf3738e1c3e13735a7049999' ]; then printf 'Installer checksum mismatch. Nothing was installed.\n' >&2; exit 1; fi
bash "$work/install.sh" "$@"
