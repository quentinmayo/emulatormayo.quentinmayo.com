#!/usr/bin/env bash
# Emulatormayo: pinned, checksum-verified installer. Source: https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/blob/8dd618c93624816d24a28a9ed1d851851ad55dac/scripts/install.sh
set -euo pipefail
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
curl --fail --location --silent --show-error --retry 2 --connect-timeout 15 --max-time 60 'https://raw.githubusercontent.com/securelyprogramming/emulatormayo.quentinmayo.com/8dd618c93624816d24a28a9ed1d851851ad55dac/scripts/install.sh' -o "$work/install.sh"
if command -v sha256sum >/dev/null; then digest=$(sha256sum "$work/install.sh"); else digest=$(shasum -a 256 "$work/install.sh"); fi
if [ "${digest%% *}" != '75646068496157f28b28c1b35b20117942263342d91a998adf93d52ed68afc6c' ]; then printf 'Installer checksum mismatch. Nothing was installed.\n' >&2; exit 1; fi
bash "$work/install.sh" "$@"
