import { useEffect } from "react";
import { syncContent } from "../content/syncContent";
import { useSettingsStore } from "../store/useSettingsStore";
import { checkForUpdates, startupUpdateCheck } from "./updater";
import { checkVersionPolicy } from "./versionPolicy";

const TICK_MS = 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;

// Each job returns true on success. A job runs at launch, then every N hours (Settings → Check every);
// after a failure (offline) it retries every 15 minutes.
const JOBS = [
  { id: "policy", first: checkVersionPolicy, run: checkVersionPolicy },
  { id: "content", first: syncContent, run: syncContent },
  { id: "updates", first: startupUpdateCheck, run: () => checkForUpdates() },
];

const state = Object.fromEntries(JOBS.map((job) => [job.id, { lastSuccess: null, lastAttempt: null, running: false }]));
let started = false;

async function runJob(job, fn) {
  const s = state[job.id];
  if (s.running) return;
  s.running = true;
  s.lastAttempt = Date.now();
  try {
    if (await fn()) s.lastSuccess = Date.now();
  } finally {
    s.running = false;
  }
}

function tick() {
  const intervalMs = useSettingsStore.getState().checkHours * 60 * 60 * 1000;
  const now = Date.now();
  for (const job of JOBS) {
    const s = state[job.id];
    const due = s.lastSuccess ? now - s.lastSuccess >= intervalMs : now - (s.lastAttempt ?? 0) >= RETRY_MS;
    if (due) runJob(job, job.run);
  }
}

/** Runs the version-policy, content and update checks in the background (once per app window). */
export function useBackgroundSync() {
  useEffect(() => {
    if (started || import.meta.env.MODE === "test") return undefined;
    started = true;
    for (const job of JOBS) runJob(job, job.first);
    const timer = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(timer);
      started = false;
    };
  }, []);
}

/** "Check now" in Settings: all three checks immediately. */
export function checkAllNow() {
  return Promise.all(JOBS.map((job) => runJob(job, job.run)));
}
