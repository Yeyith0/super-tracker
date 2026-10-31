import { Link } from "react-router-dom";
import { useSyncExternalStore } from "react";
import Panel from "../../components/Panel";
import Toggle from "../../components/Toggle";
import { useSettingsStore } from "../../store/useSettingsStore";
import { APP_VERSION, COPYRIGHT_LINE } from "../../config";
import { inTauri } from "../../lib/tauri";
import LegalPanel from "./LegalPanel";
import ThemeManager from "./ThemeManager";
import UpdatePanel from "./UpdatePanel";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia?.(REDUCED_MOTION);
      query?.addEventListener("change", onChange);
      return () => query?.removeEventListener("change", onChange);
    },
    () => window.matchMedia?.(REDUCED_MOTION).matches ?? false,
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-b-0">
      <dt className="hud-label text-muted">{label}</dt>
      <dd className="text-right text-text">{children}</dd>
    </div>
  );
}

export default function SettingsTab() {
  const scanlines = useSettingsStore((state) => state.scanlines);
  const setScanlines = useSettingsStore((state) => state.setScanlines);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="space-y-6">
      <ThemeManager />
      <UpdatePanel />

      <div className="grid grid-cols-2 gap-6">
        <Panel title="Display & Effects">
          <Toggle
            checked={scanlines}
            onChange={setScanlines}
            label="Scanline background"
            description="Faint horizontal HUD scanlines behind every page."
          />
          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[15px] text-text">Reduced motion</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Follows Windows Settings → Accessibility → Visual effects → Animation effects. Currently{" "}
              <span className="font-semibold text-text-2">{reducedMotion ? "reduced" : "full motion"}</span>.
            </p>
          </div>
        </Panel>

        <Panel title="About">
          <dl>
            <InfoRow label="Version">
              <span className="font-mono">v{APP_VERSION}</span>
            </InfoRow>
            <InfoRow label="Runtime">{inTauri() ? "Windows desktop app" : "Browser preview"}</InfoRow>
            <InfoRow label="Game data">Bundled sample data</InfoRow>
          </dl>
          <p className="mt-3 font-mono text-[11px] text-muted">{COPYRIGHT_LINE}</p>
          {import.meta.env.DEV ? (
            <Link to="/dev/components" className="hud-label mt-4 inline-block text-cyan hover:underline">
              Component bench (dev only) →
            </Link>
          ) : null}
        </Panel>
      </div>

      <LegalPanel />
    </div>
  );
}
