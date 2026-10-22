# Bundled components

The Emulatormayo host is MIT licensed. The upstream EmulatorJS distribution and its bundled cores have separate licenses; the host license does not replace them.

- EmulatorJS **4.2.3**, official archive: https://github.com/EmulatorJS/EmulatorJS/releases/tag/v4.2.3
- Complete corresponding upstream source for that release: https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3
- The original runtime license, metadata and notices are included unchanged in `resources/runtime/` inside the installed application. `UPSTREAM.json` records the archive URL and verified SHA-256.
- EmulatorJS uses libretro cores. Their individual licenses and source references remain applicable; see `runtime/data/cores/cores.json` for each core’s repository and license file, and https://github.com/EmulatorJS/build for build sources. No games, BIOS files or keys are included.
- Electron and Chromium retain their bundled third-party notices.

The original, unmodified EmulatorJS release archive is also linked in the GitHub release notes. Installation packages include the runtime rather than fetching executable code when a user launches a game.
