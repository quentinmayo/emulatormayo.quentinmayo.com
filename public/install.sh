#!/usr/bin/env bash
# Emulatormayo: pinned, checksum-verified installer. Source: https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/blob/c5c71338846c090f9d9ba55cd411aaec9bc53ee3/scripts/install.sh
set -euo pipefail
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
curl --fail --location --silent --show-error --retry 2 --connect-timeout 15 --max-time 60 'https://raw.githubusercontent.com/securelyprogramming/emulatormayo.quentinmayo.com/c5c71338846c090f9d9ba55cd411aaec9bc53ee3/scripts/install.sh' -o "$work/install.sh"
if command -v sha256sum >/dev/null; then digest=$(sha256sum "$work/install.sh"); else digest=$(shasum -a 256 "$work/install.sh"); fi
if [ "${digest%% *}" != '1c86cdc31d793c24c5dc54277c8c86e2ef0c3389d114c72bd6e41d32115a49f4' ]; then printf 'Installer checksum mismatch. Nothing was installed.\n' >&2; exit 1; fi
bash "$work/install.sh" "$@"
