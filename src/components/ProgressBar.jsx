const TONES = {
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  buff: "bg-buff",
  danger: "bg-danger",
  cyan: "bg-cyan",
};

/** Flat square progress bar on a --line track. value is 0..100. */
export default function ProgressBar({ value, tone = "accent", label, height = 10, className = "" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className={`w-full bg-line ${className}`}
      style={{ height }}
    >
      <div className={`hud-transition h-full transition-[width] ${TONES[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
