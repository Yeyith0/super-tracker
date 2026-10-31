import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_PREFIX } from "../config";

// status: idle | checking | up-to-date | downloading | ready | installing | dev | unavailable | error
export const useUpdateStore = create(
  persist(
    (set) => ({
      status: "idle",
      available: null, // { version, notes }
      progress: null, // download percent, null when unknown
      error: null,
      lastCheckAt: null,
      // Version the user chose to install "on next launch".
      postponedVersion: null,
      // Last successfully fetched version-policy.json and whether it blocks this build.
      policy: null,
      policyBlocked: false,
      update: (patch) => set(patch),
    }),
    {
      name: `${STORAGE_PREFIX}updates`,
      version: 1,
      partialize: (state) => ({ lastCheckAt: state.lastCheckAt, postponedVersion: state.postponedVersion }),
    },
  ),
);
