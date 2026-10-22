# Emulatormayo private player

A small, self-hosted browser player around the official **EmulatorJS 4.2.3** release. This is separate from the public Next.js marketing website. No Android or desktop package is provided for Emulatormayo yet.

```sh
cd selfhost
export EMULATORMAYO_ROOT="$PWD/storage"
./prepare-runtime.sh
docker compose up -d
# http://127.0.0.1:8097
```

Requires Docker and curl. The preparation script fetches the official pinned upstream runtime and extracts it with a disposable Python container. It does not fetch games. The runtime and games stay outside Git. The upstream runtime and cores retain their own licenses; see `storage/runtime/LICENSE` and [EmulatorJS source](https://github.com/EmulatorJS/EmulatorJS).

Choose a system and a game file from your device. The player reads the file through a browser blob URL; there is no upload server or account system. Some systems need a BIOS file. Saves and save states use EmulatorJS's browser storage and export controls; back them up before clearing browser data. There is no cloud save synchronization in this player.

The default binding is localhost. For a trusted LAN, set `EMULATORMAYO_BIND` to the host's LAN IP. Keep it private or put an authenticated reverse proxy in front of it; this service has no login. Use HTTPS for browser features that require a secure context, including controller APIs in some browsers and threaded cores. COOP/COEP response headers are included but do not make plain HTTP a secure context.

Controller mapping belongs to EmulatorJS's player settings. Device, core, BIOS and browser compatibility vary. No games, BIOS files, keys or third-party ROM download links are bundled.

## More details & support

Visit [Emulatormayo](https://emulatormayo.quentinmayo.com) for an overview and the [setup guide](https://emulatormayo.quentinmayo.com/getting-started) for a walkthrough.

I need help affording my AI token usage :) If the player helps you out, [buy the developers a coffee](https://buymeacoffee.com/quentinmayo). Always optional. Always appreciated.
