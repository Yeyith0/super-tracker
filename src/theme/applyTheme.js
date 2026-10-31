import { getTheme } from "./themes";
import { useSettingsStore } from "../store/useSettingsStore";

/** Writes the theme tokens as CSS variables on <html> and sets data-theme. */
export function applyTheme(id, root = document.documentElement) {
  const theme = getTheme(id);
  root.dataset.theme = theme.id;
  for (const [key, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(`--${key}`, value);
  }
}

function applyDisplay({ theme, scanlines }) {
  applyTheme(theme);
  document.documentElement.dataset.scanlines = scanlines ? "on" : "off";
}

/** Applies the persisted theme before the first render and keeps <html> in sync afterwards. */
export function initTheme() {
  applyDisplay(useSettingsStore.getState());
  return useSettingsStore.subscribe(applyDisplay);
}
