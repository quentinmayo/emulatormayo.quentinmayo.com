Player update: confirmed EmulatorJS Exit returns to the library/file picker. A top-left Show/Hide touch controls button hides only the virtual gamepad, keeps the original toolbar available, and remembers your choice. The button stays inside the player’s fullscreen container. Native Android host regression checks passed on Retroid Pocket 5 with synthesized inputs; the Linux candidate passed a real Steam Deck Steam shortcut launch in Desktop Mode, core boot, compact fullscreen toggle, Cancel/Exit and preference checks. Gaming Mode and physical inputs remain under test.

Green theme update: dark forest backgrounds, mint controls and focus outlines, matching app icons and refreshed Steam artwork. The player toolbar, quit controls and self-hosted player use the same palette. Game content keeps its own colors.

Steam Deck update: original Steam library art and app icons, a visible Quit app control, save-before-exit guidance, and clickable EmulatorJS toolbar controls during Deck gameplay. A labeled action menu supports touch, F10 and a standard controller (L3 + R3, D-pad, A/B). The artwork helper preserves existing shortcut IDs and controls and requires Steam to be closed.

Install Emulatormayo, choose a supported system and your own local game, and press play. **No Node.js, npm, Docker or server setup required.** The official EmulatorJS 4.2.3 runtime is included in every package.

| Platform | Package |
| --- | --- |
| macOS Apple Silicon | `Emulatormayo-0.1.4-mac-arm64.dmg` |
| macOS Intel | `Emulatormayo-0.1.4-mac-x64.dmg` |
| Windows x64 | `Emulatormayo-0.1.4-win-x64.exe` |
| Linux x64 / Steam Deck | `Emulatormayo-0.1.4-linux-x86_64.AppImage` |

Download the appropriate file from Assets below. Open the DMG or Windows installer; on Linux make the AppImage executable. Steam Deck users can add it as a non-Steam app and use `--deck`. Checksums are in `SHA256SUMS.txt`.

This desktop player includes native file selection, save export dialogs, fullscreen, local browser saves and a leave-game confirmation. Export backups before deleting app data or switching devices. It uses Electron's sandboxed browser engine; Emulatormayo does not provide native emulator binaries or cloud saves.

Public alpha: macOS apps use ad-hoc signatures and are not notarized; Windows packages are unsigned. Every platform has automated player checks; real gameplay has been tested on macOS Apple Silicon using a C64 homebrew game. Physical Steam Deck, Intel Mac, Windows/Linux hardware, Xbox controllers and other game systems are not universally certified.

No games, BIOS files or keys are included. Use only content you are authorized to access. No third-party ROM sourcing/download support. Independent of EmulatorJS and Valve.

[Project website](https://emulatormayo.quentinmayo.com) · [Setup guide](https://emulatormayo.quentinmayo.com/getting-started) · [Support the developers ☕](https://buymeacoffee.com/quentinmayo)

Runtime/source: [official unmodified EmulatorJS 4.2.3 archive](https://github.com/EmulatorJS/EmulatorJS/releases/download/v4.2.3/4.2.3.7z), [EmulatorJS source](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3), [core build sources](https://github.com/EmulatorJS/build). The original upstream runtime license and core metadata are included unchanged in `resources/runtime/`; core source repositories and license paths are listed in `data/cores/cores.json`. Electron/Chromium retain their bundled notices.
