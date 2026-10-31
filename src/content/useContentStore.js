import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_PREFIX } from "../config";
import { SUPPORTED_SCHEMAS, validateContent } from "./validate";

// Bundled copies of content/*.json (always available, also offline).
const modules = import.meta.glob("../../content/*.json", { eager: true, import: "default" });
export const BUNDLED = Object.fromEntries(
  Object.entries(modules).map(([path, data]) => [path.match(/([^/]+)\.json$/)[1], data]),
);
export const CONTENT_NAMES = Object.keys(BUNDLED).filter((name) => name in SUPPORTED_SCHEMAS);

const isValid = (name, data) => data != null && validateContent(name, data).length === 0;

/** The newest valid copy among the candidates (earlier candidates win ties). */
export function pickNewest(name, candidates) {
  let best = null;
  for (const candidate of candidates) {
    if (isValid(name, candidate.data) && (!best || candidate.data.contentVersion > best.data.contentVersion)) best = candidate;
  }
  return best;
}

function resolveAll(cache = {}) {
  return Object.fromEntries(
    CONTENT_NAMES.map((name) => [
      name,
      pickNewest(name, [
        { data: BUNDLED[name], source: "bundled" },
        { data: cache[name], source: "cache" },
      ]) ?? { data: BUNDLED[name], source: "bundled" },
    ]),
  );
}

/**
 * Game content and legal texts: bundled copy, newer copies downloaded from GitHub (cached in localStorage),
 * whichever valid copy has the highest contentVersion wins. Tabs read content only through useContent().
 */
export const useContentStore = create(
  persist(
    (set, get) => ({
      files: resolveAll(),
      cache: {},
      lastCheckAt: null,
      lastError: null,
      applyRemote: (name, data) => {
        const current = get().files[name];
        if (!isValid(name, data) || (current && data.contentVersion <= current.data.contentVersion)) return false;
        set((state) => ({
          files: { ...state.files, [name]: { data, source: "remote" } },
          cache: { ...state.cache, [name]: data },
        }));
        return true;
      },
      setStatus: (status) => set(status),
    }),
    {
      name: `${STORAGE_PREFIX}content`,
      version: 1,
      partialize: (state) => ({ cache: state.cache, lastCheckAt: state.lastCheckAt }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        files: resolveAll(persisted?.cache),
      }),
    },
  ),
);

export const useContent = (name) => useContentStore((state) => state.files[name]?.data ?? BUNDLED[name]);

/** Feature flags from content/features.json; a missing name means "no flag" (always on). */
export const useFeature = (name) =>
  useContentStore((state) => (name ? Boolean(state.files.features?.data.features?.[name]) : true));
