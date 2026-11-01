// Turns rows of the Helldivers Wiki "Weapons" Cargo table (wikitext values) into content/weapons.json items.
// Pure functions only, so they can be unit tested (wikiWeapons.test.mjs).

const CATEGORY = {
  "Primary Weapons": "primary",
  "Secondary Weapons": "secondary",
  "Support Weapons": "support",
  Throwables: "grenades",
};

const TYPE = {
  "Assault Rifles": "Assault Rifle",
  "Energy-Based": "Energy Weapon",
  Explosives: "Explosive",
  Shotguns: "Shotgun",
  "Submachine Guns": "Submachine Gun",
  "Marksman Rifles": "Marksman Rifle",
  "Sniper Rifles": "Sniper Rifle",
  Pistols: "Pistol",
  Melee: "Melee",
  Special: "Special",
  Standard: "Throwable",
};

// Armor penetration labels used by the wiki, as AP values on the same scale as its AP icons.
const AP_LABELS = [
  ["Anti-Tank V", 9],
  ["Anti-Tank IV", 8],
  ["Anti-Tank III", 7],
  ["Anti-Tank II", 6],
  ["Anti-Tank I", 5],
  ["Tank V", 9],
  ["Tank IV", 8],
  ["Tank III", 7],
  ["Tank II", 6],
  ["Tank I", 5],
  ["Heavy", 4],
  ["Medium", 3],
  ["Light", 2],
  ["Unarmored", 1],
];

// Generic names that need the designation to be unique ("M7S SMG" vs "StA-11 SMG").
const GENERIC_NAMES = /^(SMG|Pistol|Shotgun|Assault Rifle)$/i;

/** Wikitext + HTML -> plain text. `lineBreak` replaces <br> (" · " keeps display texts readable). */
export function stripWikitext(value, lineBreak = " ") {
  return String(value ?? "")
    .replace(/\[\[File:[^\]]*\]\]/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/<hr\s*\/?>/gi, " / ")
    .replace(/<br\s*\/?>/gi, lineBreak)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&bull;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/( ·)+/g, " ·") // repeated <br>
    .replace(/( ·)+ \/|\/( ·)+/g, "/") // <br> next to <hr>
    .replace(/^[\s·/]+|[\s·/]+$/g, "");
}

const toNumber = (text) => Number(String(text).replace(/,/g, ""));

/** First plain number in a text ("1,200 rpm" -> 1200), or null. */
export function firstNumber(text) {
  const match = String(text ?? "").match(/\d[\d,]*(?:\.\d+)?/);
  return match ? toNumber(match[0]) : null;
}

/**
 * Main damage value: the first number that is not a rate or a duration ("150/s over 6.5s Fire 2000 Explosion"
 * -> 2000); for damage-over-time weapons ("150 DPS Fire") the rate itself.
 */
export function parseDamage(text) {
  const plain = stripWikitext(text);
  const matches = [...plain.matchAll(/(\d[\d,]*(?:\.\d+)?)(?:-\d[\d,]*)?\s*(\/s|s\b|DPS)?/g)];
  if (!matches.length) return null;
  const direct = matches.find((m) => !m[2]);
  return toNumber((direct ?? matches[0])[1]);
}

/** AP from the wiki's "Armor AP4 Icon", else from the first label ("Heavy", "Tank II"); null if none. */
export function parseAp(text) {
  const icon = String(text ?? "").match(/Armor AP(\d+) Icon/);
  if (icon) return Math.max(1, Number(icon[1]));
  const plain = stripWikitext(text);
  let best = null;
  for (const [label, ap] of AP_LABELS) {
    const index = plain.indexOf(label);
    if (index >= 0 && (best === null || index < best.index)) best = { index, ap };
  }
  return best ? best.ap : null;
}

/** Magazine: number, null for unlimited / heat-based weapons (heat: true), null when unknown. */
export function parseCapacity(text) {
  const plain = stripWikitext(text);
  if (!plain || /^N\/A$/i.test(plain)) return { magSize: null, heat: false, unknown: true };
  if (plain.includes("∞")) return { magSize: null, heat: false };
  const heat = plain.match(/^\d+(?:\.\d+)?s(?:\s*\((\d[\d,]*)\))?/);
  if (heat) return { magSize: heat[1] && !/Indefinitely/i.test(plain) ? toNumber(heat[1]) : null, heat: true };
  return { magSize: firstNumber(plain), heat: false };
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "AR-23 Liberator" -> { designation: "AR-23", name: "Liberator" }; names without a code stay whole. */
export function splitTitle(title) {
  const [first, ...rest] = String(title).trim().split(/\s+/);
  if (!rest.length || !/\d/.test(first)) return { designation: "", name: String(title).trim() };
  const name = rest.join(" ");
  return GENERIC_NAMES.test(name) ? { designation: first, name: String(title).trim() } : { designation: first, name };
}

export function mapType(category, wikiType) {
  if (!wikiType) return category === "support" ? "Support Weapon" : "Weapon";
  if (category === "grenades") return "Throwable";
  return TYPE[wikiType] ?? wikiType;
}

/**
 * One wiki row -> weapon item (without patch status, reload or drop-off; the sync script adds those),
 * or null for rows that cannot be compared (no armor penetration, e.g. smoke, shields, stim pistol).
 */
export function wikiRowToWeapon(row, { aliases = {} } = {}) {
  const category = CATEGORY[row["weapon category"]];
  const ap = parseAp(row["penetration direct"]);
  const damage = parseDamage(row.damage);
  if (!category || ap === null || damage === null) return null;

  const { designation, name } = splitTitle(row.title);
  const slug = slugify(name);
  const id = aliases[slug] ?? slug;
  const { magSize, heat } = parseCapacity(row.capacity);
  const damageText = stripWikitext(row.damage, " · ");
  const penetrationText = stripWikitext(row["penetration direct"], " · ");

  return {
    id,
    name,
    designation,
    wikiTitle: row.title,
    category,
    type: mapType(category, row["weapon type"]),
    image: `/images/weapons/${id}.png`,
    damage,
    ...(damageText && damageText !== `${damage}` ? { damageText } : {}),
    fireRate: firstNumber(stripWikitext(row["fire rate"])),
    magSize,
    ...(heat ? { heat: true } : {}),
    reloadTime: null,
    recoil: firstNumber(stripWikitext(row.recoil)),
    ap,
    ...(penetrationText ? { penetrationText } : {}),
    dropoff: [],
  };
}
