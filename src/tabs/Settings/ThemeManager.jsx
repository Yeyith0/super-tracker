import { useRef, useState } from "react";
import { THEMES, getTheme } from "../../theme/themes";
import { useSettingsStore } from "../../store/useSettingsStore";
import ThemePreview from "./ThemePreview";

function ThemeCard({ theme, selected, onSelect, onPreview, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onMouseEnter={onPreview}
      onFocus={onPreview}
      className={`hud-transition border-2 bg-panel p-4 text-left transition-colors ${
        selected ? "border-accent" : "border-line-strong hover:border-muted"
      }`}
    >
      <span className="block text-[17px] font-semibold tracking-[0.04em] text-text">{theme.name}</span>
      <span className="mt-3 flex gap-2" aria-hidden="true">
        {theme.swatches.map((color) => (
          <span key={color} className="h-[30px] w-10 border border-line" style={{ backgroundColor: color }} />
        ))}
      </span>
      <span className="mt-3 block font-mono text-[11px] tracking-[0.06em] text-muted">{theme.caption}</span>
    </button>
  );
}

/** Theme cards (radio group) + live preview. Hover or focus previews a theme; click applies and persists it. */
export default function ThemeManager() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const [previewId, setPreviewId] = useState(null);
  const cardRefs = useRef([]);

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = THEMES.findIndex((t) => t.id === theme);
    const next = (index + step + THEMES.length) % THEMES.length;
    setTheme(THEMES[next].id);
    cardRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="theme-manager-title">
      <h2 id="theme-manager-title" className="section-title mb-3">
        Theme Manager
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="theme-manager-title"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setPreviewId(null)}
        onBlur={() => setPreviewId(null)}
        className="grid grid-cols-3 gap-4"
      >
        {THEMES.map((t, index) => (
          <ThemeCard
            key={t.id}
            theme={t}
            selected={t.id === theme}
            onSelect={() => {
              setTheme(t.id);
              setPreviewId(null);
            }}
            onPreview={() => setPreviewId(t.id)}
            buttonRef={(el) => {
              cardRefs.current[index] = el;
            }}
          />
        ))}
      </div>
      <ThemePreview theme={getTheme(previewId ?? theme)} className="mt-4" />
    </section>
  );
}
