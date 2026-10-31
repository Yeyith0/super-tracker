// Single source of truth for the HUD color tokens. Every theme defines the same keys;
// applyTheme() writes them as CSS variables (--bg, --accent, ...) on <html data-theme>.
//
// Roles:
//   bg / sidebar / strip / panel / inset  -> surfaces (strip = header bars)
//   line / line-strong                    -> 1px rules and borders
//   text / text-2 / muted                 -> primary, secondary and tertiary text
//   accent / accent-2 / cyan              -> highlights (accent-2 = warning boxes, cyan = info)
//   buff / danger / danger-text           -> patch arrows and alerts (danger-text = red text on dark)
//   on-accent                             -> dark text on solid accent / colored fills
//   warn-fill / alert-fill                -> amber warning box and red alert bar fills
//   scanline                              -> faint horizontal scanline over --bg

export const THEMES = [
  {
    id: "helldiver",
    name: "Helldiver Standard",
    caption: "Charcoal · tactical yellow · amber",
    swatches: ["#121314", "#1A1C1E", "#FFE800", "#FFB000"],
    tokens: {
      bg: "#121314",
      sidebar: "#0B0C0D",
      strip: "#0F1011",
      panel: "#1A1C1E",
      inset: "#141516",
      line: "#2E3134",
      "line-strong": "#3A3D40",
      text: "#E6E8EA",
      "text-2": "#C9CDD1",
      muted: "#A3A8AD",
      accent: "#FFE800",
      "accent-2": "#FFB000",
      cyan: "#3FD0E0",
      buff: "#4CE06A",
      danger: "#FF4A3D",
      "danger-text": "#FF6B5E",
      "on-accent": "#0B0C0D",
      "warn-fill": "#241B05",
      "alert-fill": "#5A120D",
      scanline: "#18191A",
    },
  },
  {
    id: "seaf",
    name: "SEAF Fleet",
    caption: "Navy · steel gray · military white",
    swatches: ["#0E1A2B", "#172638", "#F2F4F7", "#9FB2C6"],
    tokens: {
      bg: "#0E1A2B",
      sidebar: "#091321",
      strip: "#0B1626",
      panel: "#172638",
      inset: "#122031",
      line: "#2A3B50",
      "line-strong": "#3A4D63",
      text: "#F2F4F7",
      "text-2": "#D2DBE5",
      muted: "#9FB2C6",
      accent: "#F2F4F7",
      "accent-2": "#9FB2C6",
      cyan: "#3FD0E0",
      buff: "#4CE06A",
      danger: "#FF4A3D",
      "danger-text": "#FF7A6E",
      "on-accent": "#0E1A2B",
      "warn-fill": "#1A2A3E",
      "alert-fill": "#4F1418",
      scanline: "#132134",
    },
  },
  {
    id: "high-command",
    name: "Super Earth High Command",
    caption: "Obsidian · royal blue · gold",
    // Royal blue leads (instead of yellow) so this theme reads clearly apart from Helldiver Standard;
    // #3A6FF7 is lightened to #5B8CFF so text keeps 4.5:1. Gold is the secondary color.
    swatches: ["#07080C", "#11141F", "#5B8CFF", "#D4AF37"],
    tokens: {
      bg: "#07080C",
      sidebar: "#040509",
      strip: "#0A0C14",
      panel: "#11141F",
      inset: "#0C0E17",
      line: "#262B40",
      "line-strong": "#353B55",
      text: "#EEF0F8",
      "text-2": "#C9CEE0",
      muted: "#9AA1BC",
      accent: "#5B8CFF",
      "accent-2": "#D4AF37",
      cyan: "#3FD0E0",
      buff: "#4CE06A",
      danger: "#FF4A3D",
      "danger-text": "#FF6B5E",
      "on-accent": "#07080C",
      "warn-fill": "#1E1806",
      "alert-fill": "#4A0F0D",
      scanline: "#0E1018",
    },
  },
];

export const DEFAULT_THEME_ID = "helldiver";

export function getTheme(id) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

/** CSS custom properties for a theme, usable as a React style prop to scope a preview. */
export function themeStyle(theme) {
  return Object.fromEntries(Object.entries(theme.tokens).map(([key, value]) => [`--${key}`, value]));
}
