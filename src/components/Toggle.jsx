/** On/off switch with a visible ON/OFF state label (not color alone). */
export default function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className="hud-transition flex min-h-11 w-full items-center justify-between gap-6 text-left transition-colors"
    >
      <span>
        <span className="block text-[15px] text-text">{label}</span>
        {description ? <span className="mt-0.5 block text-[13px] text-muted">{description}</span> : null}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className={`hud-label w-8 text-right ${checked ? "text-accent" : "text-muted"}`}>{checked ? "On" : "Off"}</span>
        <span className={`relative h-6 w-12 border transition-colors hud-transition ${checked ? "border-accent bg-accent/15" : "border-line-strong bg-inset"}`}>
          <span
            className={`hud-transition absolute top-1 h-3.5 w-4 transition-[left,background-color] ${checked ? "left-[26px] bg-accent" : "left-1 bg-muted"}`}
          />
        </span>
      </span>
    </button>
  );
}
