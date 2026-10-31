// App-wide constants. The version comes from package.json at build time (see vite.config.js).
// This file is also imported by Node scripts (scripts/generate-licenses.mjs), so keep it free of browser APIs.
export const APP_NAME = "Super Tracker";
export const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

// Copyright notice shown in the app, the installer and the repo. Keep tauri.conf.json (bundle.copyright,
// bundle.publisher) and LICENSE in sync; src/legal/legal.test.js checks it.
export const COPYRIGHT_HOLDER = "Yiğitcan Kılıç";
export const COPYRIGHT_YEAR = 2026;
export const COPYRIGHT_LINE = `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All rights reserved.`;

// GitHub repository for releases, the version policy and the content channel. Keep the updater endpoint
// (tauri.conf.json) and the http scope (capabilities/default.json) in sync; src/update/update.test.js checks it.
export const GITHUB_REPO = "Yeyith0/super-tracker";
export const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
export const VERSION_POLICY_URL = `${RAW_BASE}/version-policy.json`;
export const CONTENT_BASE_URL = `${RAW_BASE}/content`;
export const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;

// Background checks for updates, the version policy and content (Settings can change the interval).
export const DEFAULT_CHECK_HOURS = 3;

// Bundled images live in public/images/<group>/; see PROMPTS.md "Görsel düzeni".
export const IMAGE_BASE = "/images";

// Every persisted Zustand store uses this prefix as its localStorage key.
export const STORAGE_PREFIX = "super-tracker:";
