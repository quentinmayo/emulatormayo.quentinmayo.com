# Emulatormayo desktop

Install a packaged desktop player, choose a supported system, select your own game file, and press play. **Users do not need Node.js, npm, Docker or a game server.** The pinned EmulatorJS runtime is bundled in each installer.

The public alpha release provides macOS Apple Silicon and Intel DMGs, a Windows x64 installer and a Linux x64 AppImage. Linux users can make the AppImage executable and run it. Steam Deck users should follow the [illustrated guide](https://emulatormayo.quentinmayo.com/steam-deck), which covers the generated launcher and manual AppImage launch options. Installation and Desktop Mode launch have been tested on a real Steam Deck; see the [illustrated guide](https://emulatormayo.quentinmayo.com/steam-deck) for gameplay and controller test status. Desktop packages are unsigned and not notarized; operating-system publisher checks can apply. There is no automatic updater; install future releases manually.

Game and optional BIOS files use the operating system's file picker. No games, BIOS files or keys are bundled. Saves live in this app's browser profile on this device; use EmulatorJS's export controls for backups or transfers. Reinstalling normally keeps the profile, but deleting app data clears it. No cloud synchronization is provided.

The emulator uses Electron's sandboxed browser engine. Local assets use a stable, secure `emulatormayo://player` origin so browser storage survives restarts. No local HTTP server, remote player or Node bridge is exposed to the game. Native menus provide fullscreen, choose-another-game and help; save exports use the native download dialog. A running game asks before leaving. Gamepad configuration belongs to EmulatorJS.

## Developer builds only

These commands are for contributors, not installation:

```sh
cd desktop
npm ci
python3 -m pip install py7zr==1.1.3
python3 scripts/prepare-runtime.py
npm start
npm test
npm run test:desktop
npm run dist
```

The preparation step verifies the upstream archive's pinned SHA-256, then copies the shared self-hosted player and upstream runtime into ignored build folders. Python 3.10 or newer and py7zr are build-time tools only (CI uses Python 3.12). End users receive everything inside the application.

GitHub Actions tests Linux, Windows, macOS arm64 and macOS x64. A `desktop-v<version>` tag builds each installer and publishes all packages with `SHA256SUMS.txt` after every platform passes. Keep the tag version aligned with `desktop/package.json`. Releases remain public alphas while cross-device compatibility is being tested.

See [third-party notices](THIRD-PARTY-NOTICES.md), the included runtime license, upstream source and core metadata. Emulatormayo is independent of EmulatorJS and Valve. Use only content you are authorized to access; downloads and use are at your own risk.

## Steam artwork, remembered sessions and exit controls

The Deck installer includes original icons, portrait/landscape covers, hero and logo art. For Steam to retain shortcut changes, fully exit Steam in Desktop Mode (**Steam → Exit**), then run `~/.local/bin/emulatormayo-steam-artwork`. Reopen Steam afterward. The helper adds the shortcut if missing, preserves existing app IDs and controller settings, and backs up changed shortcut/art files beside the originals with a `.mayo-backup-...` suffix. It refuses to edit shortcuts while Steam is running.

During Deck gameplay the original EmulatorJS toolbar stays visible and clickable. The separate bottom bar has navigation, Fullscreen and **Quit app**. **Game controls** offers labeled shortcuts to the existing player actions. Open it with touch, **F10**, or **L3 + R3** on a standard gamepad; use D-pad to move, A to select, B to close. Save/load/import/export still use the player’s own handlers. Unsupported engines show a message instead of pretending an action succeeded.

Save/export before leaving. **Quit app** asks before closing; alternatively press **STEAM → Exit game** and confirm. Quitting does not save automatically or log you out. If the player itself is in HTML fullscreen, its toolbar remains available; use Steam’s system menu to exit the app.

Use the top-left **Hide/Show touch controls** button to switch the virtual controller overlay; the preference survives launching another game. It stays inside player fullscreen. Save/export first, then confirm EmulatorJS **Exit** to return to file selection. Cancel keeps the current game open.

The Linux 0.1.4 candidate passed real Steam Deck Desktop Mode NES test-suite boot, fullscreen containment, hide/show, Cancel/Exit and preference retention. Physical buttons and current-update Gaming Mode are recorded separately in the illustrated guide.
