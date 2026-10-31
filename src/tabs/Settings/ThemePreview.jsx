import { themeStyle } from "../../theme/themes";
import HudButton from "../../components/HudButton";
import ProgressBar from "../../components/ProgressBar";

/** Sample HUD rendered with a theme's own tokens (scoped CSS variables), independent of the app theme. */
export default function ThemePreview({ theme, className = "" }) {
  return (
    <div
      data-theme={theme.id}
      style={themeStyle(theme)}
      className={`hud-transition border border-line bg-panel p-5 transition-colors ${className}`}
    >
      <p className="hud-label text-accent" aria-live="polite">
        Live preview // <span className="normal-case">{theme.name}</span>
      </p>
      <div className="mt-5 grid grid-cols-[1.1fr_1fr] gap-4">
        <div className="min-h-[164px] border-t-4 border-accent bg-inset p-4">
          <p className="text-[20px] font-bold text-text">Major Order: Hold the Line</p>
          <ProgressBar value={64} label="Major order progress" className="mt-4" />
          <p className="mt-3 text-[13px] text-text-2">64% complete · 2D 14H left</p>
        </div>
        <div className="bg-inset p-4">
          <p className="mb-2.5 text-[15px] text-text">Primary action</p>
          <HudButton block tabIndex={-1}>
            Deploy
          </HudButton>
          <HudButton variant="secondary" block tabIndex={-1} className="mt-2.5">
            Secondary
          </HudButton>
        </div>
      </div>
    </div>
  );
}
