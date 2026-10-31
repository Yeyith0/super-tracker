// Alignment runs from -100 (Traitor) to +100 (Servant of Freedom).

export function clampAlignment(value) {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  return Math.max(-100, Math.min(100, n));
}

/** Marker position on the meter, 0..100 percent from the Traitor end. */
export function alignmentToPercent(value) {
  return (clampAlignment(value) + 100) / 2;
}

export function formatAlignment(value) {
  const n = clampAlignment(value);
  return n > 0 ? `+${n}` : String(n);
}

export function alignmentSide(value) {
  const n = clampAlignment(value);
  if (n > 0) return "Servant of Freedom";
  if (n < 0) return "Traitor";
  return "Neutral";
}
