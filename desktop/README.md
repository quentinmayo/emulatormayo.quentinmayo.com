# Emulatormayo desktop

Install a packaged desktop player, choose a supported system, select your own game file, and press play. **Users do not need Node.js, npm, Docker or a game server.** The pinned EmulatorJS runtime is bundled in each installer.

The public alpha release provides macOS Apple Silicon and Intel DMGs, a Windows x64 installer and a Linux x64 AppImage. Linux/Steam Deck users can make the AppImage executable, add it as a non-Steam app, and use `--deck` to start fullscreen. Physical Steam Deck and controller testing remain pending. Desktop packages are unsigned and not notarized; operating-system publisher checks can apply. There is no automatic updater; install future releases manually.

Game and optional BIOS files use the operating system's file picker. No games, BIOS files or keys are bundled. Saves live in this app's browser profile on this device; use EmulatorJS's export controls for backups or transfers. Reinstalling normally keeps the profile, but deleting app data clears it. No cloud synchronization is provided.

The emulator uses Electron's sandboxed browser engine. Local assets use a stable, secure `emulatormayo://player` origin so browser storage survives restarts. No local HTTP server, remote player or Node bridge is exposed to the game. Native menus provide fullscreen, choose-another-game and help; save exports use the native download dialog. A running game asks before leaving. Gamepad configuration belongs to EmulatorJS.

## Developer builds only

These commands are for contributors, not installation:

```sh
cd desktop
npm ci
python3 -m pip install py7zr==1.0.0
python3 scripts/prepare-runtime.py
npm start
npm test
npm run test:desktop
npm run dist
```

The preparation step verifies the upstream archive's pinned SHA-256, then copies the shared self-hosted player and upstream runtime into ignored build folders. Python and py7zr are build-time tools only. End users receive everything inside the application.

GitHub Actions tests Linux, Windows, macOS arm64 and macOS x64. A `desktop-v<version>` tag builds each installer and publishes all packages with `SHA256SUMS.txt` after every platform passes. Keep the tag version aligned with `desktop/package.json`. Releases remain public alphas while cross-device compatibility is being tested.

See [third-party notices](THIRD-PARTY-NOTICES.md), the included runtime license, upstream source and core metadata. Emulatormayo is independent of EmulatorJS and Valve. Use only content you are authorized to access; downloads and use are at your own risk.
