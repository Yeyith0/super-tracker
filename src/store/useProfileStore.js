import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_PREFIX, IMAGE_BASE } from "../config";
import { clampAlignment } from "../lib/alignment";

// SAMPLE DATA: local profile until accounts arrive in Phase 13.
const SAMPLE_PROFILE = {
  callsign: "SGT. NOVA-21",
  level: 87,
  dives: 1204,
  avatar: `${IMAGE_BASE}/avatars/nova-21.png`,
  // Base alignment; Phase 7 derives it from case verdicts and upheld reports.
  alignmentBase: 56,
  verdictsInFavor: 14,
  // Bounty Board position (Phase 7 derives it from the user's resolved cases).
  resolvedCases: 14,
  bountyRank: 27,
};

export const useProfileStore = create(
  persist(() => ({ ...SAMPLE_PROFILE }), { name: `${STORAGE_PREFIX}profile`, version: 1 }),
);

/** The one selector every alignment display reads (-100 traitor .. +100 servant of freedom). */
export const selectAlignment = (state) => clampAlignment(state.alignmentBase);
