import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_PREFIX } from "../config";

/** The compared pair (slot A cyan, slot B amber). Kept across tab switches and restarts. */
export const useArsenalStore = create(
  persist(
    (set) => ({
      slotA: null,
      slotB: null,
      // Toggle an item: remove it if it is in a slot, else fill A, then B; with both full it replaces B.
      toggleCompare: (id) =>
        set(({ slotA, slotB }) => {
          if (slotA === id) return { slotA: null };
          if (slotB === id) return { slotB: null };
          if (!slotA) return { slotA: id };
          return { slotB: id };
        }),
      swap: () => set(({ slotA, slotB }) => ({ slotA: slotB, slotB: slotA })),
      clear: () => set({ slotA: null, slotB: null }),
    }),
    { name: `${STORAGE_PREFIX}arsenal`, version: 1 },
  ),
);
