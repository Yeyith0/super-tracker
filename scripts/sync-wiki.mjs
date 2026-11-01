// `npm run sync-wiki`: refreshes content/weapons.json from the Helldivers Wiki (helldivers.wiki.gg, CC BY-NC-SA 4.0).
// Weapons come from the wiki's "Weapons" Cargo table; reload times, drop-off curves and the curated stratagems
// come from scripts/data/weapon-overrides.json; buff / nerf status comes from the latest patch in balance.json.
// Review the summary and the diff, then commit and push: the content channel delivers it without a new release.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateContent } from "../src/content/validate.js";
import { penClassFor } from "../src/tabs/Arsenal/arsenalData.js";
import { firstNumber, slugify, wikiRowToWeapon } from "./lib/wikiWeapons.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://helldivers.wiki.gg/api.php";
const USER_AGENT = "SuperTracker-sync/1.0 (fan app; https://github.com/Yeyith0/super-tracker)";
const CATEGORY_ORDER = ["primary", "secondary", "support", "grenades", "stratagems"];

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const fail = (message) => {
  console.error(`Sync stopped: ${message}`);
  process.exit(1);
};

async function cargo(table, fields) {
  const url = new URL(API);
  for (const [key, value] of Object.entries({ action: "cargoquery", tables: table, fields, limit: "500", format: "json" })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) fail(`wiki answered HTTP ${response.status} for ${table}`);
  const data = await response.json();
  if (data.error) fail(`wiki error for ${table}: ${data.error.info}`);
  return data.cargoquery.map((row) => row.title);
}

const overrides = readJson("scripts/data/weapon-overrides.json");
const ballistics = readJson("content/ballistics.json");
const balance = readJson("content/balance.json");
const news = readJson("content/news.json");
const previous = readJson("content/weapons.json");

const [weaponRows, stratagemRows] = await Promise.all([
  cargo("Weapons", "title,weapon_category,weapon_type,damage,penetration_direct,capacity,fire_rate,recoil"),
  cargo("Stratagems", "title,stratagem_type,base_cooldown"),
]);

// Wiki weapons -> items (ids stay stable through idAliases; duplicate names fall back to the full title).
const seen = new Set();
const skipped = [];
const weapons = [];
for (const row of weaponRows) {
  const weapon = wikiRowToWeapon(row, { aliases: overrides.idAliases });
  if (!weapon) {
    skipped.push(row.title);
    continue;
  }
  if (seen.has(weapon.id)) {
    weapon.id = slugify(row.title);
    weapon.name = row.title;
    weapon.image = `/images/weapons/${weapon.id}.png`;
  }
  seen.add(weapon.id);
  Object.assign(weapon, overrides.approximate[weapon.id] ?? {});
  weapons.push(weapon);
}

// Curated stratagems, with the wiki's base cooldown when it lists them.
const cooldowns = new Map(stratagemRows.map((row) => [row.title, firstNumber(row["base cooldown"])]));
for (const stratagem of overrides.stratagems) {
  weapons.push({ ...stratagem, reloadTime: cooldowns.get(stratagem.name) ?? stratagem.reloadTime });
}

// Penetration class from the AP scale, buff / nerf from the latest patch.
const latest = [...balance.patches].sort((a, b) => b.date.localeCompare(a.date))[0];
for (const weapon of weapons) {
  weapon.penClass = penClassFor(weapon.ap, ballistics.classes).id;
  const change = latest.changes.find((c) => c.itemId === weapon.id);
  weapon.patchStatus = change ? change.status : "none";
  weapon.patchNote = change ? change.change : "";
}
weapons.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));

// Every item the rest of the content links to must still exist.
const ids = new Set(weapons.map((w) => w.id));
const needed = [...balance.patches.flatMap((p) => p.changes.map((c) => c.itemId)), ...news.items.map((i) => i.relatedItem).filter(Boolean)];
const missing = [...new Set(needed.filter((id) => !ids.has(id)))];
if (missing.length) fail(`items linked from balance.json / news.json are missing: ${missing.join(", ")} (add an idAlias?)`);

// Key order of each item as written to the file.
const KEYS = ["id", "name", "designation", "wikiTitle", "category", "type", "image", "damage", "damageText", "fireRate", "magSize", "heat", "reloadTime", "recoil", "ap", "penClass", "penetrationText", "dropoff", "patchStatus", "patchNote"];
const ordered = weapons.map((w) => Object.fromEntries(KEYS.filter((k) => w[k] !== undefined).map((k) => [k, w[k]])));

const changed = JSON.stringify(ordered) !== JSON.stringify(previous.weapons);
const output = {
  contentVersion: previous.contentVersion + (changed ? 1 : 0),
  schemaVersion: 1,
  sample: false,
  patch: latest.version,
  source: {
    name: "Helldivers Wiki",
    url: "https://helldivers.wiki.gg",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    retrievedAt: changed ? new Date().toISOString().slice(0, 10) : previous.source?.retrievedAt ?? new Date().toISOString().slice(0, 10),
    note: "Weapon stats from the Helldivers Wiki. Reload times, drop-off curves and stratagem damage are approximate Super Tracker values.",
  },
  weapons: ordered,
};

const errors = validateContent("weapons", output);
if (errors.length) fail(`the result is not valid:\n  - ${errors.slice(0, 10).join("\n  - ")}`);

const text = [
  "{",
  ...Object.entries(output)
    .filter(([key]) => key !== "weapons")
    .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`),
  '  "weapons": [',
  ordered.map((w) => `    ${JSON.stringify(w)}`).join(",\n"),
  "  ]",
  "}",
  "",
].join("\n");
writeFileSync(join(ROOT, "content/weapons.json"), text);

// Summary for the review.
const before = new Map(previous.weapons.map((w) => [w.id, w]));
const added = ordered.filter((w) => !before.has(w.id)).map((w) => w.id);
const removed = previous.weapons.filter((w) => !ids.has(w.id)).map((w) => w.id);
const apChanges = ordered.filter((w) => before.has(w.id) && before.get(w.id).ap !== w.ap).map((w) => `${w.id} AP ${before.get(w.id).ap}→${w.ap}`);
const perCategory = CATEGORY_ORDER.map((c) => `${c} ${ordered.filter((w) => w.category === c).length}`).join(", ");
console.log(`Weapons: ${ordered.length} (${perCategory}); skipped ${skipped.length} without armor penetration (${skipped.join(", ")}).`);
console.log(`Added ${added.length}, removed ${removed.length}${removed.length ? ` (${removed.join(", ")})` : ""}.`);
if (apChanges.length) console.log(`Armor penetration changes: ${apChanges.join(", ")}.`);
console.log(changed ? `content/weapons.json updated, contentVersion ${output.contentVersion}.` : "No changes.");
