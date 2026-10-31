import { alignmentSide, alignmentToPercent, formatAlignment } from "../../lib/alignment";

// Traitor side: dark red -> danger red; middle fades out; Servant side: accent -> cyan.
const GRADIENT =
  "linear-gradient(90deg, color-mix(in srgb, var(--danger) 50%, #000) 0%, var(--danger) 27%, var(--line) 50%, var(--accent) 75%, var(--cyan) 100%)";

/** "Traitor vs. Servant of Freedom" meter. value is -100..+100. */
export default function AlignmentMeter({ value, caption, width = 300 }) {
  const formatted = formatAlignment(value);

  return (
    <div style={{ width }} className="shrink-0">
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
        <span className="text-danger-text">Traitor</span>
        <span className="text-accent">Servant of Freedom</span>
      </div>
      <div
        role="meter"
        aria-label="Alignment: Traitor versus Servant of Freedom"
        aria-valuemin={-100}
        aria-valuemax={100}
        aria-valuenow={Number(formatted)}
        aria-valuetext={`${formatted}, ${alignmentSide(value)}`}
        className="relative mt-1.5 h-3.5 border border-line"
        style={{ background: GRADIENT }}
      >
        <span
          aria-hidden="true"
          className="hud-transition absolute -bottom-1 -top-1 w-1 -translate-x-1/2 bg-white transition-[left]"
          style={{ left: `${alignmentToPercent(value)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[12px] text-text-2">
        <span className="font-mono font-semibold text-text">{formatted}</span> alignment
        {caption ? <> · {caption}</> : null}
      </p>
    </div>
  );
}
