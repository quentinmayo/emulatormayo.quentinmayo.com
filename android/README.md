# Emulatormayo for Android

A native, Steam-inspired local game library for Android phones, tablets and controller handhelds. **No server or login.** Library, imports, search, favorites, recent games and controller settings are Android Views. Only gameplay uses a WebView with bundled EmulatorJS 4.2.3.

[Download signed APK](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/android-v0.2.0/Emulatormayo-0.2.0-android.apk) · [Checksums & release notes](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/tag/android-v0.2.0) · [Setup guide](https://emulatormayo.quentinmayo.com/getting-started)

## Play

1. Install the APK on Android 10+. Android may ask you to allow installation from your browser or file manager.
2. Tap Import, choose a system, then select your own authorized game files. Long-press files and tap Select in Android’s multi-file picker if needed. Imports create app-private copies; original files are not changed or uploaded.
3. Open a game card, optionally choose your own BIOS, and tap Play game → Start Game.
4. Use EmulatorJS’s save/export controls before leaving. Android provides a save dialog for generated downloads. Export backups before clearing app data or moving devices; no cloud save sync is included.

Supported selectors: NES, SNES, Game Boy/Color/Advance, Mega Drive/Genesis, Master System, Game Gear, Commodore 64, N64, PlayStation and Atari 2600. Selector availability does not certify every title or core. Standalone files and supported archives are intended; multi-file disc sets are not certified.

## Controllers and handhelds

Connect USB or Bluetooth controllers through Android settings. Native menus keep a visible focus highlight across cards, filters, tabs and settings, including when switching from touch. Hold a direction to repeat. Native menus support D-pad / left stick, A to open, B to return, X to search, Y for recent games and LB/RB to change sections. Settings includes A/B swap, stick dead zone, compact cards, landscape lock and a hotplug-aware input check. The Android player forwards the first connected gamepad’s buttons, D-pad, both sticks and triggers to EmulatorJS as a standard controller. Choose it under the player’s **Control Settings → Player 1**, then configure game mappings there. Menu A/B swap and menu dead zone do not change gameplay bindings. Multiple simultaneous gameplay controllers are not implemented by this adapter.

On Retroid Pocket 5, the owner confirmed native menu navigation using the built-in D-pad, left stick and A/B buttons. Gameplay forwarding passes simulated input checks on the actual Retroid; physical gameplay direction retesting is pending. Controller detection and core boot alone do not establish working gameplay. For C64 games, the joystick port and keyboard actions (such as Space) can also depend on the title and core settings. Keep the touch controls and player toolbar available while checking bindings.

## Build (contributors only)

With Java 21, Android SDK 36 and Python with py7zr 1.0.0 installed:

```sh
python desktop/scripts/prepare-runtime.py
cd android
./gradlew assembleDebug lintDebug
bash tests/test-state.sh
node --test tests/gamepad.test.cjs
```

The build verifies the official runtime archive’s SHA-256 before extraction. No runtime download is needed by APK users. Set `EMULATORMAYO_KEYSTORE`, `EMULATORMAYO_STORE_PASSWORD`, `EMULATORMAYO_KEY_ALIAS` and `EMULATORMAYO_KEY_PASSWORD` to build a signed release. Keep signing keys outside Git. Android tag releases use the private GitHub Actions secrets and include checksums. Keep the signing identity stable for future upgrades.

The private asset origin is `https://appassets.androidplatform.net`; network fallback, arbitrary file paths, mixed content and general native scripting bridges are disabled. Save exports use an origin-restricted, token-gated message channel. Native controller forwarding sends bounded JSON only to the bundled local player page; it adds no JavaScript-to-native scripting interface. Held inputs are released on focus loss, app pause, disconnect and player exit. Release WebViews are not debuggable. Authentication and server credentials are not used.

Website/application code is MIT licensed. Bundled EmulatorJS and emulator cores retain their upstream licenses: the archive includes `LICENSE`, `UPSTREAM.json`, core reports and source references. [EmulatorJS 4.2.3 source](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3) · [core sources](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3/data/cores).

No games, BIOS files or keys are included. No third-party ROM sourcing/download support. Use content you are authorized to access. Downloads and use are at your own risk. Independent of EmulatorJS, RetroArch and Valve.
