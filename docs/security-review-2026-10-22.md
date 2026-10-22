# Focused security review — October 22, 2026

Reviewed the Android local import/player/export boundaries, Electron protocol and IPC, one-line installers, Steam artwork helper and release workflows. This is a focused review, not a penetration test or a security certification of upstream emulator cores.

- Electron keeps sandboxing and context isolation enabled, disables Node in the renderer, restricts navigation and permissions, and serves an allowlisted local asset tree with real-path containment checks. Player controls use a fixed action list and validate the calling top-level frame.
- Android uses native file pickers and app-private imported copies. Its player blocks network fallbacks, disables file/content access and mixed content, and restricts save-export messages to the local main-frame origin plus a per-export token and bounded chunks. Release WebView debugging and Android backup are disabled.
- Installers verify release and artwork SHA-256 values before replacing the executable. Steam shortcut edits refuse to run with Steam open, preserve unrelated entries and make backups.
- Centralized organization scans run Gitleaks, Trivy dependency/configuration analysis, zizmor and CodeQL (Actions, JavaScript/TypeScript, Java/Kotlin). The desktop 0.1.2 change passed these checks and all four desktop build/test jobs before release. Inspect current Actions/Security results for later revisions.

No additional exploitable issue was established in these inspected Emulatormayo boundaries. Upstream runtime/core vulnerabilities, malicious game files, device compromise and every possible document provider were not exhaustively assessed. The self-hosted web player has no built-in authentication; its README describes private-network deployment.

The related [Rommayo review](https://github.com/securelyprogramming/Rommayo/blob/main/docs/security-review-2026-10-22.md) documents repaired malformed-request handling, authenticated Android redirect handling and release workflow findings.
