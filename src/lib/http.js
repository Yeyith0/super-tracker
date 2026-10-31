import { inTauri } from "./tauri";

/**
 * GET a JSON document. In the desktop app it goes through the Tauri http plugin (scoped in
 * capabilities/default.json); in a plain browser (vite dev) through window.fetch.
 * Throws on network errors, timeouts and non-2xx responses.
 */
export async function getJson(url, { timeoutMs = 10000 } = {}) {
  const fetcher = inTauri() ? (await import("@tauri-apps/plugin-http")).fetch : window.fetch.bind(window);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, { method: "GET", cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
