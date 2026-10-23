Player update: confirmed EmulatorJS Exit returns to the library/file picker. A top-left Show/Hide touch controls button hides only the virtual gamepad, keeps the original toolbar available, and remembers your choice. The button stays inside the player’s fullscreen container. Native Android host regression checks passed on Retroid Pocket 5 with synthesized inputs; the Linux candidate passed a real Steam Deck Steam shortcut launch in Desktop Mode, core boot, compact fullscreen toggle, Cancel/Exit and preference checks. Gaming Mode and physical inputs remain under test.

## Android controller input and menu update

- Forward the first connected Android gamepad’s buttons, D-pad, sticks and triggers to the local player using standard controller mappings. EmulatorJS Control Settings still handles remapping.
- Move menu focus explicitly with D-pad or left stick, recover selection when switching input methods, and keep the current card selected when returning from game details.
- Keep filter dialogs open after the opening A-button release; selecting or cancelling requires a fresh press.
- Release held inputs when the app pauses, loses focus, disconnects its controller, or leaves the player.
- Dark green native menus, mint focus outlines, matching system bars and green player controls.
- Retroid Pocket 5: owner confirmed D-pad, left-stick and A/B native menu navigation; simulated Android-to-WebView input checks pass. Physical gameplay retest remains pending. Multiple simultaneous native gameplay controllers are not implemented.

Emulatormayo native Android alpha. Android 10+; install the signed APK, open the app, and tap Import. No npm, server, account or login required.

- Native Steam-inspired library, search, system filters, favorites, recently played and game details.
- Native game and BIOS import using Android’s file picker. Private copies stay on the device; original files are untouched.
- Handheld settings: D-pad/left-stick menus, A/B swap, dead zone, landscape lock, compact cards and live controller diagnostics. Gameplay mappings remain in EmulatorJS.
- Bundled, checksum-pinned EmulatorJS 4.2.3. Gameplay runs at a private secure local origin with no remote runtime fallback.
- Save exports use Android’s save dialog. Save/export before leaving; export backups before removing app data or moving devices.

C64 homebrew core boot tested on Galaxy S24 Ultra and Retroid Pocket 5. See the setup guide for exact device checks and remaining gameplay limits. External Xbox controller gameplay and physical Steam Deck controls remain unverified; not every core, game, BIOS or multi-file disc set is certified.

No ROMs, BIOS files or keys included. Upstream emulator/runtime licenses apply; source and license references are in the Android guide. Use only content you are authorized to access. Downloads and use are at your own risk. Independent of EmulatorJS and Valve.

Setup: https://emulatormayo.quentinmayo.com/getting-started
Source: https://github.com/securelyprogramming/emulatormayo.quentinmayo.com
Support the AI token fund ☕ https://buymeacoffee.com/quentinmayo
