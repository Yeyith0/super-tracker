import { isTauri } from "@tauri-apps/api/core";

// The UI also runs in a plain browser (vite dev, Vitest); every Tauri call goes through these guards.
export const inTauri = () => isTauri();

// Matches the opener plugin scope in src-tauri/capabilities/default.json.
const ALLOWED_EXTERNAL = /^(https:\/\/|mailto:)/i;

/** Opens an https or mailto link with the user's default browser / mail app (opener plugin), never inside the app. */
export async function openExternal(url) {
  if (!ALLOWED_EXTERNAL.test(url)) {
    console.warn(`Blocked external link (only https and mailto are allowed): ${url}`);
    return;
  }
  if (inTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** True for mailto links and absolute http(s) links that point away from the app itself. */
export function isExternalHref(href) {
  if (!href) return false;
  if (/^mailto:/i.test(href)) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).origin !== window.location.origin;
  } catch {
    return false;
  }
}
