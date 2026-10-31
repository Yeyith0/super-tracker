import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME_ID } from "../theme/themes";
import { DEFAULT_CHECK_HOURS, STORAGE_PREFIX } from "../config";

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: DEFAULT_THEME_ID,
      scanlines: true,
      // First-run acceptance: { ageConfirmed, accepted: { terms, guidelines, roleplay }, acceptedAt } or null.
      legal: null,
      // Dismissed <RoleplayNotice> boxes: context -> roleplay document version that was dismissed.
      dismissedNotices: {},
      // How often (hours) to check for updates, the version policy and new content.
      checkHours: DEFAULT_CHECK_HOURS,
      setTheme: (theme) => set({ theme }),
      setCheckHours: (checkHours) => set({ checkHours }),
      setScanlines: (scanlines) => set({ scanlines }),
      acceptLegal: (accepted) => set({ legal: { ageConfirmed: true, accepted, acceptedAt: new Date().toISOString() } }),
      dismissNotice: (context, version) =>
        set((state) => ({ dismissedNotices: { ...state.dismissedNotices, [context]: version } })),
    }),
    { name: `${STORAGE_PREFIX}settings`, version: 1 },
  ),
);
