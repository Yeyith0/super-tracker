import { useId } from "react";

// Automatic cover art for news items without a photo: a flat HUD / propaganda poster drawn as SVG,
// picked from the item's tag or source and varied by its id (the same item always gets the same cover).
// A real photo at /images/news/<id>.png replaces it (see NewsImage).

const W = 320;
const H = 180;

export function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const OFFICIAL = {
  BREAKING: { color: "var(--danger)", emblem: "warning", word: "Alert", label: "High Command // Breaking" },
  PATCH: { color: "var(--cyan)", emblem: "gear", word: "Directive", label: "Ministry of Defense // Arsenal" },
  EVENT: { color: "var(--accent-2)", emblem: "flag", word: "Operation", label: "High Command // Field orders" },
};
const FORMAT_WORDS = { report: "Report", bulletin: "Bulletin", ad: "Buy now" };

/** Color, emblem, headline word, label and background pattern for an item. */
export function coverStyle(item) {
  const seed = hashString(item.id ?? item.title ?? "");
  const pattern = ["stripes", "grid", "stripes-reverse"][seed % 3];
  if (item.kind === "official") return { ...(OFFICIAL[item.tag] ?? OFFICIAL.EVENT), pattern, seed };

  const source = (item.source ?? "").toLowerCase();
  const base = { color: "var(--accent)", word: FORMAT_WORDS[item.format] ?? "Report", label: item.source ?? "Super Earth", pattern, seed };
  if (item.format === "ad") return { ...base, color: "var(--accent-2)", emblem: "burst", pattern: "rays" };
  if (source.includes("defense")) return { ...base, emblem: "shield" };
  if (source.includes("truth")) return { ...base, emblem: "eye" };
  if (source.includes("seaf")) return { ...base, emblem: "chevrons" };
  return { ...base, emblem: "tower" };
}

// Emblems in a 100x100 box.
const EMBLEMS = {
  warning: (c) => (
    <>
      <path d="M50 8 L94 88 H6 Z" fill="none" stroke={c} strokeWidth="7" />
      <rect x="45" y="34" width="10" height="30" fill={c} />
      <rect x="45" y="70" width="10" height="10" fill={c} />
    </>
  ),
  gear: (c) => (
    <>
      <g fill={c}>
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x="42" y="4" width="16" height="92" transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="34" />
      </g>
      <circle cx="50" cy="50" r="15" fill="var(--inset)" />
    </>
  ),
  flag: (c) => (
    <>
      <rect x="18" y="6" width="7" height="90" fill={c} />
      <path d="M25 10 H88 L74 30 L88 50 H25 Z" fill={c} />
    </>
  ),
  shield: (c) => (
    <>
      <path d="M50 4 L90 18 V48 C90 72 72 88 50 97 C28 88 10 72 10 48 V18 Z" fill="none" stroke={c} strokeWidth="7" />
      <circle cx="50" cy="50" r="18" fill="none" stroke={c} strokeWidth="5" />
      <path d="M50 22 V40 M50 60 V78 M22 50 H40 M60 50 H78" stroke={c} strokeWidth="5" />
    </>
  ),
  eye: (c) => (
    <>
      <path d="M4 50 Q50 2 96 50 Q50 98 4 50 Z" fill="none" stroke={c} strokeWidth="7" />
      <circle cx="50" cy="50" r="19" fill={c} />
      <circle cx="50" cy="50" r="8" fill="var(--inset)" />
    </>
  ),
  chevrons: (c) => (
    <g fill="none" stroke={c} strokeWidth="10">
      {[14, 38, 62].map((y) => (
        <path key={y} d={`M10 ${y} L50 ${y + 22} L90 ${y}`} />
      ))}
    </g>
  ),
  tower: (c) => (
    <g fill="none" stroke={c} strokeWidth="6">
      <path d="M50 32 L30 96 M50 32 L70 96 M37 76 H63 M41 58 H59" />
      <circle cx="50" cy="26" r="6" fill={c} />
      <path d="M32 12 Q22 26 32 40 M68 12 Q78 26 68 40 M20 4 Q6 26 20 48 M80 4 Q94 26 80 48" />
    </g>
  ),
  burst: (c) => {
    const points = Array.from({ length: 32 }, (_, i) => {
      const r = i % 2 ? 36 : 49;
      const a = (Math.PI * 2 * i) / 32;
      return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return (
      <>
        <polygon points={points} fill={c} />
        <text x="50" y="57" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontWeight="700" fontSize="20" fill="var(--on-accent)">
          NEW!
        </text>
      </>
    );
  },
};

function Pattern({ id, kind, color, cx, cy }) {
  if (kind === "rays") {
    return (
      <g opacity="0.14" fill={color}>
        {Array.from({ length: 18 }, (_, i) => {
          const a1 = (Math.PI * 2 * i) / 18;
          const a2 = a1 + Math.PI / 18;
          const r = 400;
          return (
            <polygon
              key={i}
              points={`${cx},${cy} ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)}`}
            />
          );
        })}
      </g>
    );
  }
  const grid = kind === "grid";
  return (
    <>
      <defs>
        <pattern
          id={id}
          width={grid ? 20 : 16}
          height={grid ? 20 : 16}
          patternUnits="userSpaceOnUse"
          patternTransform={grid ? undefined : `rotate(${kind === "stripes" ? 45 : -45})`}
        >
          {grid ? (
            <path d="M20 0 H0 V20" fill="none" stroke={color} strokeWidth="1" />
          ) : (
            <rect width="6" height="16" fill={color} />
          )}
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} opacity={grid ? 0.18 : 0.08} />
    </>
  );
}

function Brackets({ color, size }) {
  const s = size;
  const e = 6;
  return (
    <g fill="none" stroke={color} strokeWidth="3">
      <path d={`M${e} ${e + s} V${e} H${e + s}`} />
      <path d={`M${W - e - s} ${e} H${W - e} V${e + s}`} />
      <path d={`M${e} ${H - e - s} V${H - e} H${e + s}`} />
      <path d={`M${W - e - s} ${H - e} H${W - e} V${H - e - s}`} />
    </g>
  );
}

/** compact = thumbnail (emblem only, no text). */
export default function NewsCover({ item, compact = false, className = "" }) {
  const patternId = `cover-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const style = coverStyle(item);
  const code = String(style.seed % 10000).padStart(4, "0");
  const emblemSize = compact ? 120 : 112;
  const ex = compact ? W / 2 : W - 92 + ((style.seed >> 4) % 9) - 4;
  const ey = H / 2 + (compact ? 0 : ((style.seed >> 8) % 11) - 5);
  const label = style.label.length > 34 ? `${style.label.slice(0, 33)}…` : style.label;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${style.label} illustration`}
      className={`block bg-inset ${className}`}
    >
      <rect width={W} height={H} fill="var(--inset)" />
      <Pattern id={patternId} kind={style.pattern} color={style.color} cx={ex} cy={ey} />
      <g transform={`translate(${ex - emblemSize / 2} ${ey - emblemSize / 2}) scale(${emblemSize / 100})`}>
        {EMBLEMS[style.emblem](style.color)}
      </g>
      {!compact ? (
        <g fontFamily="IBM Plex Mono, monospace">
          <text x="22" y="34" fontSize="10" letterSpacing="2" fill="var(--text-2)">
            {label.toUpperCase()}
          </text>
          <text x="20" y="106" fontFamily="Chakra Petch, sans-serif" fontWeight="700" fontSize="28" letterSpacing="1" fill={style.color}>
            {style.word.toUpperCase()}
          </text>
          <text x="22" y="154" fontSize="10" letterSpacing="2" fill="var(--muted)">
            FILE {code} // SUPER EARTH
          </text>
        </g>
      ) : null}
      <Brackets color={style.color} size={compact ? 22 : 26} />
    </svg>
  );
}
