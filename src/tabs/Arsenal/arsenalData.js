// Pure helpers for the Arsenal: stat definitions, comparison, drop-off curves, sorting and search.

/** Compared stats, in the order of design/03-arsenal.png. better: which direction wins. */
export const STATS = [
  { key: "damage", label: "Damage", better: "higher" },
  { key: "fireRate", label: "Fire rate", better: "higher", unit: "rpm" },
  { key: "magSize", label: "Mag / Heat", better: "higher" },
  { key: "recoil", label: "Recoil ↓", better: "lower" },
  { key: "reloadTime", label: "Reload ↓", better: "lower", unit: "s" },
];

// Same fields, clearer names for throwables and stratagems.
const CATEGORY_LABELS = {
  grenades: { magSize: "Carried" },
  stratagems: { magSize: "Uses", reloadTime: "Cooldown ↓" },
};

export function statLabel(stat, category) {
  return CATEGORY_LABELS[category]?.[stat.key] ?? stat.label;
}

/** Numeric value for comparison. An empty magazine field means unlimited (heat or no ammo limit). */
export function statValue(weapon, key) {
  if (!weapon) return null;
  const value = weapon[key];
  if (value == null) return key === "magSize" ? Infinity : null;
  return value;
}

export function formatStat(weapon, key) {
  const value = statValue(weapon, key);
  if (value == null) return "—";
  if (value === Infinity) return "∞";
  if (key === "reloadTime") return `${value}s`;
  return value.toLocaleString("en-US");
}

/**
 * Mirrored bars for one stat: which side is better and how long each bar is (percent of the larger value).
 * Missing values get no bar and no verdict; equal values are a tie.
 */
export function compareStat(a, b, stat) {
  const va = statValue(a, stat.key);
  const vb = statValue(b, stat.key);
  const width = (v, other) => {
    if (v == null) return 0;
    if (v === Infinity) return 100;
    if (other === Infinity) return 55; // a finite magazine next to an unlimited one
    const max = Math.max(v, other ?? 0);
    return max > 0 ? Math.max(4, (v / max) * 100) : 4;
  };
  const verdict = () => {
    if (va == null || vb == null || va === vb) return { a: va == null ? null : "tie", b: vb == null ? null : "tie" };
    const aWins = stat.better === "higher" ? va > vb : va < vb;
    return { a: aWins ? "better" : "worse", b: aWins ? "worse" : "better" };
  };
  return { ...verdict(), widthA: width(va, vb), widthB: width(vb, va) };
}

export function penClassFor(ap, classes) {
  return classes.find((c) => ap >= c.minAp && ap <= c.maxAp) ?? classes[classes.length - 1];
}

/** Filled segments of the armor pen tier bar. */
export const tierCount = (ap, scale) => Math.max(1, Math.min(scale.tiers, ap));

/** Damage at a distance, linear between the drop-off points (flat before the first and after the last). */
export function damageAt(points, distance) {
  if (!points?.length) return null;
  const sorted = [...points].sort((p, q) => p.distance - q.distance);
  if (distance <= sorted[0].distance) return sorted[0].damage;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (distance <= next.distance) {
      const t = (distance - prev.distance) / (next.distance - prev.distance || 1);
      return Math.round((prev.damage + t * (next.damage - prev.damage)) * 10) / 10;
    }
  }
  return sorted[sorted.length - 1].damage;
}

/** Chart rows [{ distance, a, b }] every 10 m from 0 to 100 m. */
export function dropoffRows(a, b) {
  return Array.from({ length: 11 }, (_, i) => {
    const distance = i * 10;
    return { distance, a: damageAt(a?.dropoff, distance), b: damageAt(b?.dropoff, distance) };
  });
}

const PATCH_ORDER = { buff: 0, nerf: 1, none: 2 };
export const SORTS = [
  { id: "name", label: "Name" },
  { id: "damage", label: "Damage" },
  { id: "patch", label: "Patch status" },
];

export function sortWeapons(weapons, sort = "name") {
  const byName = (a, b) => a.name.localeCompare(b.name);
  const list = [...weapons];
  if (sort === "damage") return list.sort((a, b) => b.damage - a.damage || byName(a, b));
  if (sort === "patch") return list.sort((a, b) => PATCH_ORDER[a.patchStatus] - PATCH_ORDER[b.patchStatus] || byName(a, b));
  return list.sort(byName);
}

export function searchWeapons(weapons, query) {
  const q = query.trim().toLowerCase();
  if (!q) return weapons;
  return weapons.filter((w) => w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q));
}
