# Super Tracker

Fan-made companion **desktop app** for Helldivers 2 on Windows (Tauri 2 + React + Vite + Tailwind).
Not affiliated with Arrowhead Game Studios or Sony Interactive Entertainment.

**Download:** the latest installer is on the [Releases page](https://github.com/Yeyith0/super-tracker/releases).
Installed copies update themselves.

> Windows SmartScreen: the installer is not code-signed yet, so the first install shows "Windows protected your PC".
> Choose **More info → Run anyway**. (TODO: buy a code-signing certificate and sign the installer in the release workflow.)
>
> Microsoft Defender may flag a new unsigned release with a machine-learning guess such as `Trojan:Win32/Bearfoos.A!ml`
> (the `!ml` suffix). This is a false positive. After each release, submit the installer and the installed
> `super-tracker.exe` at <https://www.microsoft.com/en-us/wdsi/filesubmission> ("Incorrectly detected as malware/malicious");
> Microsoft usually clears it within a few days. Code signing makes this much rarer.

## Prerequisites (one time)

1. **Node.js** LTS (nodejs.org)
2. **Microsoft C++ Build Tools**: Visual Studio Build Tools with the "Desktop development with C++" workload
3. **Rust** (rustup.rs, default settings)
4. **WebView2**: already included in Windows 10/11

## Development

```bash
npm install
npm run tauri dev    # opens the app window with hot reload (first run compiles Rust, takes a few minutes)
npm test             # Vitest unit tests
```

If PowerShell says "running scripts is disabled on this system", use `npm.cmd` / `npx.cmd` instead of `npm` / `npx`
(or run the commands in `cmd`).

`npm run dev` serves only the web UI at http://localhost:1420 (handy for quick UI checks; window buttons do nothing there).
In development, Settings → About links to a component bench (`#/dev/components`) with every shared component.

## Building the installer locally

```bash
npm run tauri build
```

The NSIS installer (`Super Tracker_<version>_x64-setup.exe`) lands in `src-tauri/target/release/bundle/nsis/`.
Local builds are not signed for the updater; only the GitHub release build is (see Releasing).

## Releasing

Releases are built by GitHub Actions (`.github/workflows/release.yml`) and delivered to installed apps by the
Tauri updater.

One-time setup:

1. The updater signing key lives outside the project in `%USERPROFILE%\.tauri\supertracker.key` (public key in
   `src-tauri/tauri.conf.json`). **Back up the key file and its password**: without them no update can ever be
   delivered to existing installs again.
2. GitHub → repository Settings → Secrets and variables → Actions → New repository secret:
   - `TAURI_SIGNING_PRIVATE_KEY`: the whole content of `supertracker.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: the key's password

Every release:

1. Add a `## 0.2.0 — Short title` section with player-facing notes at the top of `CHANGELOG.md` and commit it.
2. Run:

   ```bash
   npm run release 0.2.0
   git push
   git push origin v0.2.0
   ```

The release title and notes on GitHub, and the notes in the app's "UPDATE READY" notice, come from that
`CHANGELOG.md` section.

`npm run release` bumps the version in `package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`,
`src-tauri/Cargo.toml` and `Cargo.lock`, commits and tags. Pushing the tag starts the release build, which creates a
**draft** release with the installer and `latest.json`. Check it, then press **Publish release**: from that moment
installed apps download the update in the background (checked on launch and every 3 hours by default) and offer
"Restart now" / "On next launch".

### Forcing an update (version policy)

`version-policy.json` in the repository root:

```json
{ "minimum": "0.1.0", "message": "" }
```

Apps below `minimum` show a blocking **UPDATE REQUIRED** screen with your `message` and an "Install update" button.
Raise `minimum` only after the newer release is published. If a PC is offline the app stays usable and checks again
later.

## Updating content

Game content and the legal texts live in `content/*.json`. Installed apps download newer files from the `main` branch
(`https://raw.githubusercontent.com/Yeyith0/super-tracker/main/content/`) on launch and every few hours, without a new
release:

1. Edit the file and **raise its `contentVersion`** (apps only take a file with a higher `contentVersion`).
2. Run `npm run validate-content` (GitHub Actions also checks every push).
3. Commit and push to `main`. Apps pick it up within the check interval (GitHub's raw cache adds up to ~5 minutes).

`schemaVersion` describes the file's structure. Only change it together with an app release that supports the new
structure (see `SUPPORTED_SCHEMAS` in `src/content/validate.js`); apps reject schema versions they do not know and keep
their previous copy.

## Turning features on and off

`content/features.json` holds feature flags:

```json
{ "contentVersion": 1, "schemaVersion": 1, "features": { "divergram": false } }
```

A feature that is `false` keeps its sidebar item, but players see an UNDER CONSTRUCTION screen. To switch Divergram
on for everyone, set it to `true`, raise `contentVersion` and push to `main`; no new release is needed. Development
builds (`npm run tauri dev`) always show closed features with a "FLAG OFF" badge so you can test them.

## Changing the app icon

The icon is generated from `app-icon.png` (square 1024x1024 PNG, transparent background allowed):

```bash
npm run tauri icon app-icon.png
```

This regenerates every size in `src-tauri/icons/` (it also creates `android/` and `ios/` folders there, which a
Windows-only app does not need and you may delete). Rebuild afterwards.

## Project layout

| Path | What |
| --- | --- |
| `src/components/` | Shared HUD components (Panel, HudButton, SubTabs, Badge, Chip, ProgressBar, PatchArrow, FilterPanel, StarToggle, ImageWithFallback, HudAlert, HudToast, Modal, EmptyState…) |
| `src/components/layout/` | App shell: title bar, sidebar, profile bar with alignment meter, page header |
| `src/tabs/<TabName>/` | One folder per tab; `src/tabs/tabs.js` defines the navigation and inner tabs |
| `src/content/` | Content channel (bundled + downloaded content, validation, feature flags) |
| `src/update/` | Auto-update, version policy, background checks |
| `src/legal/` | First-run screen, legal texts, Markdown renderer |
| `src/theme/` | Theme tokens (`themes.js`, single source of truth), contrast checker |
| `src/store/` | Zustand stores (persisted to localStorage) |
| `src/config.js` | App-wide constants (GitHub repository, copyright) |
| `content/` | Game content, legal texts and feature flags as JSON |
| `public/images/…` | Bundled images; a missing file shows a striped placeholder |
| `src-tauri/` | Tauri (Rust) shell, window config, permissions in `capabilities/` |
| `scripts/` | Release, license and content-validation scripts |

## Legal texts and licenses

- Terms of Use, Privacy Notice, Community Guidelines, Roleplay Notice and Notices live in `content/legal.json`
  (Markdown lines per document). Raise a document's `version` (and the file's `contentVersion`) when you change it:
  a new version of the Terms, Guidelines or Roleplay Notice shows the first-run acceptance screen again.
- The contact e-mail and country are in `content/legal.json` (`contact`); the copyright holder is in `src/config.js`.
- `npm run licenses` (also run automatically before every build) regenerates `public/legal/third-party-licenses.json`,
  `THIRD_PARTY_LICENSES.md` and the installer's Terms page `src-tauri/legal/TERMS.txt`. Commit the results.

## Copyright & license

Super Tracker is © 2026 Yiğitcan Kılıç. All rights reserved: the source is public so you can see what the app does,
but it may not be copied, modified or redistributed without written permission (see [LICENSE](LICENSE));
third-party components keep their own licenses (see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)).

## Themes

Three themes (Settings → Theme Manager): Helldiver Standard, SEAF Fleet, Super Earth High Command.
Tokens live in `src/theme/themes.js` and are written as CSS variables on `<html data-theme>`.
`npm test` checks that every text color keeps at least 4.5:1 contrast in every theme.
