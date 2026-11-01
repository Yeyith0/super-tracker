import { tierCount } from "./arsenalData";

const FILL = { A: "bg-cyan", B: "bg-accent-2", single: "bg-accent" };

/** Armor pen tier: one row of segments per item, filled up to its AP. */
export function PenTierRow({ ap, scale, slot = "single", label }) {
  const filled = tierCount(ap, scale);
  return (
    <div className="flex gap-1" role="img" aria-label={`${label}: armor penetration ${filled} of ${scale.tiers}`}>
      {Array.from({ length: scale.tiers }, (_, i) => (
        <span key={i} className={`h-3.5 flex-1 ${i < filled ? FILL[slot] : "bg-line"}`} />
      ))}
    </div>
  );
}

/** One-line verdict: "Both: Light Pen · effective vs. light armor only" or one line per item. */
export function penSummary(items, classFor) {
  const classes = items.map((w) => classFor(w.ap));
  if (items.length === 2 && classes[0].id === classes[1].id) return [`Both: ${classes[0].label} · ${classes[0].summary}`];
  return items.map((w, i) => `${w.name}: ${classes[i].label} · ${classes[i].summary}`);
}
