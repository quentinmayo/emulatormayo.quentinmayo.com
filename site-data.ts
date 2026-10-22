export const site = {
  "name": "Emulatormayo",
  "kind": "emulator",
  "url": "https://emulatormayo.quentinmayo.com",
  "tagline": "A little less setup. A lot more play.",
  "description": "A small self-hosted player for your own EmulatorJS setup. Bring a game file, open your browser and let the emulator do its thing.",
  "repository": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com",
  "primaryUrl": "#setup",
  "primaryLabel": "Self-host the player",
  "secondaryUrl": "https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/tree/main/selfhost",
  "secondaryLabel": "Explore the tooling",
  "status": "OPEN SOURCE \u00b7 SELF-HOSTED PLAYER",
  "eyebrow": "YOUR GAMES. YOUR LITTLE CORNER OF THE WEB.",
  "headline": [
    "A little less setup.",
    "A lot more play."
  ],
  "heroNote": "No visitor account. No bundled games. Your own setup.",
  "devices": [
    "BROWSER",
    "SELF-HOSTED",
    "TOUCH & CONTROLLER"
  ],
  "featureTitle": "Small by design. Yours by default.",
  "featureIntro": "A focused starting point for EmulatorJS, with a clean player, a place for your files and no extra account to manage.",
  "features": [
    {
      "title": "A file. A browser. A start.",
      "body": "Choose a game file on your device, pick a supported system and open it in EmulatorJS. Local file selection does not upload the file to a remote game service."
    },
    {
      "title": "Give it a home.",
      "body": "Run the included lightweight web container on your own server. Keep the player, runtime assets and optional game folder in storage you control."
    },
    {
      "title": "Let the engine work.",
      "body": "EmulatorJS provides the emulation, on-screen controls, controller configuration and supported save features. Emulatormayo provides the small host around it."
    }
  ],
  "bandTitle": "The engine you know.\nA place to make it yours.",
  "bandBody": "EmulatorJS is a browser emulation library powered by libretro cores. Emulatormayo adds a simple self-hosted page around that library, with a system selector and a bring-your-own-file workflow.",
  "capabilities": [
    "Pick your own game file",
    "Choose a supported system",
    "Use EmulatorJS controls & saves",
    "Host your own runtime assets"
  ],
  "upstreamName": "EmulatorJS",
  "upstreamUrl": "https://emulatorjs.org/",
  "setupTitle": "Your own player, in three steps.",
  "setupIntro": "The self-hosted bundle is in the source repository. No native Emulatormayo app download is required.",
  "steps": [
    {
      "title": "Get the self-hosted files.",
      "body": "Clone the repository and follow selfhost/README.md. The public Next.js site and the private player are separate services."
    },
    {
      "title": "Bring the runtime.",
      "body": "Use the pinned upstream EmulatorJS release described in the setup guide. Place its data directory alongside the player and start the container."
    },
    {
      "title": "Choose your own game.",
      "body": "Open the player on your network, pick a supported system and select a local file. You supply the game and any required BIOS."
    }
  ],
  "installEyebrow": "THE SELF-HOSTED BUNDLE",
  "installTitle": "Make room for one more game.",
  "installBody": "Docker setup, player source and runtime instructions. All in one place.",
  "compatibility": "No native Android APK or Electron client is released for Emulatormayo yet. Browser, core, BIOS and device compatibility vary. Use HTTPS when a core or browser API requires a secure context.",
  "faq": [
    {
      "question": "Is this the public game player?",
      "answer": "This is the public project site. The included player is a separate service you self-host. The website does not connect visitors to a private server or serve a game library."
    },
    {
      "question": "Is this an official EmulatorJS project?",
      "answer": "No. Emulatormayo is an independent host and companion tooling project. EmulatorJS and its libretro cores provide the emulation engine; their own licenses and compatibility apply."
    },
    {
      "question": "Does selecting a local file upload it?",
      "answer": "The included player uses a browser object URL for local file selection. The game stays in the browser process rather than being uploaded to an Emulatormayo backend. Runtime assets are fetched from the host you configure."
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
  "sisterUrl": "https://rommayo.quentinmayo.com"
};
