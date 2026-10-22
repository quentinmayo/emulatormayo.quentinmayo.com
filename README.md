<p align="center"><img src="public/og.svg" alt="Emulatormayo — Your library, your devices" width="100%"></p>

# Emulatormayo · Desktop player & website

**[Visit emulatormayo.quentinmayo.com](https://emulatormayo.quentinmayo.com)** for product details, setup and compatibility notes.

A public, login-free Next.js website for Emulatormayo. Dark library-inspired design, original fictional cover art, responsive layouts and an interactive preview. No games, BIOS files, server credentials, analytics or visitor accounts are included.

## Download & install

**No Node.js, npm, Docker or server required for the desktop apps.** Install Emulatormayo, choose a supported system and your own local game file, then press play. The pinned EmulatorJS runtime is included.

| Platform | Download |
| --- | --- |
| macOS Apple Silicon | [Download DMG](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-mac-arm64.dmg) |
| macOS Intel | [Download DMG](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-mac-x64.dmg) |
| Windows x64 | [Download installer](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-win-x64.exe) |
| Linux x64 / Steam Deck | [Download AppImage](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/Emulatormayo-0.1.1-linux-x86_64.AppImage) |

[Release notes & all assets](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/tag/desktop-v0.1.1) · [SHA-256 checksums](https://github.com/securelyprogramming/emulatormayo.quentinmayo.com/releases/download/desktop-v0.1.1/SHA256SUMS.txt) · [Desktop guide](desktop/README.md)

Open the DMG or Windows installer. On Linux, make the AppImage executable; Steam Deck users can add it as a non-Steam app with `--deck`. Mac apps are ad-hoc signed and not notarized; Windows installers are unsigned. Saves stay in the app's local profile; export backups before deleting app data or moving devices. Physical Steam Deck and controller testing is pending.

Prefer hosting it yourself? The optional **[private self-hosted browser player](selfhost/README.md)** remains available with Docker. It is separate from this public product website. No Android APK is released yet.

## Develop this website locally

```sh
npm ci
npm run dev
```

`npm run build` creates a static export in `out/`. The Docker image builds the Next.js source and serves it with unprivileged Nginx on port **8080**. No production Node server or environment secrets are required by the public site.

## Deploy with Coolify

Use a dedicated project and a public Git application, branch `main`, Dockerfile build pack, `/Dockerfile`, exposed port `8080`, health check `/`, and the HTTPS production domain above. The app runs independently of the upstream game service.

The repository's workflow calls the organization's pinned centralized security workflow, runs the production build and dependency audit, and requests a Coolify deployment only after both pass on `main`. Configure repository variable `COOLIFY_APPLICATION_UUID` and secret `COOLIFY_API_TOKEN`; credentials never go into the source or browser bundle. Organization onboarding attaches the shared security configuration and runner access.

## Security & responsibility

Centralized scans include CodeQL plus centralized secret detection, dependency, infrastructure and workflow analysis as provided by `securelyprogramming/security-workflows`. A configured workflow is not proof that a particular scan has passed; inspect the latest Actions results and Security tab.

Use only content you are authorized to access. Downloads and use are at your own risk. This independent companion is not affiliated with upstream projects or Valve. No third-party ROM sourcing is supported. Website code is MIT licensed; upstream applications, runtimes and emulator cores retain their own licenses.

## Support the developers ☕

I need help affording my AI token usage :) If this project makes your setup a little more fun, [buy the developers a coffee](https://buymeacoffee.com/quentinmayo). Always optional. Always appreciated. The project stays free and open source.

## Search & sharing

The public site includes descriptive page titles, canonical URLs, indexable HTML, PNG social cards, WebSite/Person JSON-LD, a linked [setup guide](https://emulatormayo.quentinmayo.com/getting-started), `robots.txt` and a two-page sitemap. Each page has its own canonical URL and social metadata. Keep titles, descriptions and sitemap entries in sync when adding pages; regenerate `public/og.png` from `public/og.svg` if the social artwork changes.

For indexing diagnostics, verify the production domain in Google Search Console or Bing Webmaster Tools, submit `/sitemap.xml`, and inspect the home and guide URLs. These tools require the site owner's account; publishing metadata does not register the site or guarantee a ranking.
