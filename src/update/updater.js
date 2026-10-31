import { inTauri } from "../lib/tauri";
import { toast, useToastStore } from "../store/useToastStore";
import { compareVersions } from "./semver";
import { useUpdateStore } from "./useUpdateStore";

// Auto-update through the Tauri updater plugin (signed releases on GitHub, see tauri.conf.json).
// Release builds download updates in the background; dev builds only report them.

let pending = null; // downloaded Update object, ready to install
let readyToastId = null;

const store = () => useUpdateStore.getState();
const messageOf = (error) => (typeof error === "string" ? error : error?.message ?? "Unknown error");
const BUSY = ["checking", "downloading", "installing"];

// Release notes come from CHANGELOG.md as Markdown; the toast shows them as one plain line.
const plainNotes = (markdown = "") =>
  markdown
    .split(/\n### /)[0]
    .replace(/[#*`>_]/g, "")
    .replace(/^\s*-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

function announceReady(update) {
  const notes = plainNotes(update.body);
  readyToastId = toast({
    label: `Update ready v${update.version}`,
    message: notes ? (notes.length > 180 ? `${notes.slice(0, 180)}…` : notes) : "A new version has been downloaded.",
    duration: 0,
    actions: [
      { label: "Restart now", onClick: installNow },
      { label: "On next launch", variant: "secondary", onClick: postponeUpdate },
    ],
  });
}

async function download(update) {
  let total = 0;
  let received = 0;
  store().update({ status: "downloading", progress: 0 });
  await update.download((event) => {
    if (event.event === "Started") total = event.data.contentLength ?? 0;
    if (event.event === "Progress") {
      received += event.data.chunkLength;
      store().update({ progress: total ? Math.min(100, Math.round((received / total) * 100)) : null });
    }
    if (event.event === "Finished") store().update({ progress: 100 });
  });
  pending = update;
  store().update({ status: "ready" });
}

/** Checks GitHub for a newer signed release; in release builds downloads it. Returns true if the check worked. */
export async function checkForUpdates({ announce = true } = {}) {
  if (!inTauri()) {
    store().update({ status: "unavailable", error: null });
    return false;
  }
  if (BUSY.includes(store().status) || pending) return true;

  store().update({ status: "checking", error: null });
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    store().update({ lastCheckAt: Date.now() });
    if (!update) {
      store().update({ status: "up-to-date", available: null });
      return true;
    }
    store().update({ available: { version: update.version, notes: update.body ?? "" } });
    if (!import.meta.env.PROD) {
      store().update({ status: "dev" });
      return true;
    }
    await download(update);
    if (announce) announceReady(update);
    return true;
  } catch (error) {
    store().update({ status: "error", error: messageOf(error) });
    return false;
  }
}

/** Installs the downloaded update. On Windows the installer closes the app and starts the new version. */
export async function installNow() {
  if (!pending) return;
  if (readyToastId) useToastStore.getState().dismiss(readyToastId);
  store().update({ status: "installing", postponedVersion: null });
  try {
    await pending.install();
    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
  } catch (error) {
    store().update({ status: "error", error: messageOf(error) });
  }
}

export function postponeUpdate() {
  if (pending) store().update({ postponedVersion: pending.version });
}

/**
 * Launch check: if the user postponed an update last time, install it right away ("On next launch").
 * Otherwise a normal background check.
 */
export async function startupUpdateCheck() {
  const { postponedVersion } = store();
  const ok = await checkForUpdates({ announce: !postponedVersion });
  if (pending && postponedVersion && compareVersions(pending.version, postponedVersion) >= 0) {
    await installNow();
  } else if (pending && postponedVersion) {
    announceReady(pending);
  }
  return ok;
}

/** "Install update" on the blocking UPDATE REQUIRED screen: check, download if needed, install. */
export async function installRequiredUpdate() {
  if (!pending) await checkForUpdates({ announce: false });
  if (pending) await installNow();
  else if (store().status === "up-to-date") {
    store().update({ status: "error", error: "No newer release was found yet. Try again in a few minutes." });
  }
}
