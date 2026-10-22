export const site = {
  "name": "Emulatormayo",
  "kind": "emulator",
  "url": "https://emulatormayo.quentinmayo.com",
  "tagline": "A little less setup. A lot more play.",
  "description": "Install an EmulatorJS desktop player for macOS, Windows or Linux. Play your own local game files with the runtime included. Free, open source, no server required.",
  "repository": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com",
  "primaryUrl": "/#downloads",
  "primaryLabel": "Download Emulatormayo",
  "secondaryUrl": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/tree/main/selfhost",
  "secondaryLabel": "Self-host instead",
  "status": "DESKTOP ALPHA · AVAILABLE NOW",
  "eyebrow": "EMULATORJS PLAYER · MACOS, WINDOWS & LINUX",
  "headline": [
    "A little less setup.",
    "A lot more play."
  ],
  "heroNote": "Free and open source. No account. No bundled games.",
  "devices": [
    "MACOS",
    "WINDOWS",
    "LINUX / STEAM DECK"
  ],
  "featureTitle": "Small by design. Yours by default.",
  "featureIntro": "Install a desktop player with the emulator runtime included, or keep the browser player on a server you control.",
  "features": [
    {
      "title": "Install. Pick a file. Play.",
      "body": "Choose a macOS, Windows or Linux installer. The EmulatorJS runtime is bundled; select your own local game and a supported system without setting up a server."
    },
    {
      "title": "Or give it a server.",
      "body": "Prefer a self-hosted browser player? Run the included lightweight web container. Keep the player, runtime and optional game folder in storage you control."
    },
    {
      "title": "Let the engine work.",
      "body": "EmulatorJS provides the emulation, on-screen controls, controller configuration and supported save features. Emulatormayo provides the small host around it."
    }
  ],
  "bandTitle": "The engine you know.\nA place to make it yours.",
  "bandBody": "EmulatorJS provides browser emulation powered by libretro cores. Emulatormayo packages a local desktop player around that engine, with a system selector, native file selection, save exports and an optional self-hosted browser setup.",
  "capabilities": [
    "Install for Mac, Windows or Linux",
    "Choose your own local game file",
    "Use EmulatorJS controls & saves",
    "Keep an optional self-hosted setup"
  ],
  "upstreamName": "EmulatorJS",
  "upstreamUrl": "https://emulatorjs.org/",
  "setupTitle": "Install. Choose a game. Press play.",
  "setupIntro": "Desktop installers include the pinned EmulatorJS runtime. You do not need Node.js, npm, Docker or a server. The self-hosted browser bundle remains available.",
  "steps": [
    {
      "title": "Install your desktop app.",
      "body": "Download the Mac DMG, Windows installer or Linux AppImage. Choose Apple Silicon or Intel to match your Mac. The emulator runtime is included."
    },
    {
      "title": "Bring your own game.",
      "body": "Select a supported system, choose your local game file and provide a BIOS file if the core needs one. No account or game upload is required."
    },
    {
      "title": "Save your next adventure.",
      "body": "Map controls through EmulatorJS and use its save/export controls. Saves stay in this app on this device; export backups before moving devices or clearing app data."
    }
  ],
  "installEyebrow": "MACOS / WINDOWS / LINUX",
  "installTitle": "Ready when your next game is.",
  "installBody": "Download the installer for your device. Release notes and checksums are on GitHub.",
  "compatibility": "Desktop apps use Electron with the bundled EmulatorJS runtime. Mac apps are ad-hoc signed and not notarized; Windows installers are unsigned. Browser, core, BIOS and device compatibility vary. No Android APK is released yet; the self-hosted browser player remains available. Physical Steam Deck and controller testing is pending.",
  "faq": [
    {
      "question": "Is this the public game player?",
      "answer": "This is the public project site. Download a desktop app to play your local files, or use the separate player you self-host. The public website does not serve a game library."
    },
    {
      "question": "Is this an official EmulatorJS project?",
      "answer": "No. Emulatormayo is an independent host and companion tooling project. EmulatorJS and its libretro cores provide the emulation engine; their own licenses and compatibility apply."
    },
    {
      "question": "Does selecting a local file upload it?",
      "answer": "Desktop and self-hosted players use a browser object URL for local file selection. The game is read by your device rather than uploaded to an Emulatormayo backend. Desktop packages include their runtime assets."
    },
    {
      "question": "Can I use a gamepad or save my progress?",
      "answer": "Those features are provided by EmulatorJS and depend on its core, browser permissions and configuration. They are not a promise of every controller or platform working on every device."
    },
    {
      "question": "Where do I get games?",
      "answer": "You supply content you are authorized to use. We provide no games, BIOS files, keys, sourcing links or third-party ROM download support."
    }
  ],
  "closing": "Bring your own adventure.",
  "sisterName": "Rommayo",
  "sisterUrl": "https://rommayo.quentinmayo.com",
  "seoTitle": "Emulatormayo | EmulatorJS for macOS, Windows & Linux",
  "supportUrl": "https://buymeacoffee.com/quentinmayo",
  "downloadVersion": "v0.1.1 · Desktop alpha",
  "downloadIntro": "The EmulatorJS runtime is included. Install, choose your own game file and play. No Node.js, npm, Docker or server required.",
  "releaseUrl": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/tag/desktop-v0.1.1",
  "downloads": [
    {
      "label": "macOS · Apple Silicon",
      "detail": "M-series Macs · DMG",
      "file": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-mac-arm64.dmg"
    },
    {
      "label": "macOS · Intel",
      "detail": "Intel Macs · DMG",
      "file": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-mac-x64.dmg"
    },
    {
      "label": "Windows",
      "detail": "x64 · installer",
      "file": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-win-x64.exe"
    },
    {
      "label": "Linux / Steam Deck",
      "detail": "x64 · AppImage",
      "file": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-linux-x86_64.AppImage"
    }
  ],
  "checksumsUrl": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/SHA256SUMS.txt"
};
