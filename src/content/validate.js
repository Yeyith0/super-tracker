// Validation for content/*.json and version-policy.json. Shared by the app (content channel) and
// scripts/validate-content.mjs (GitHub Actions), so keep it free of browser and Vite-only APIs.
import { isValidVersion } from "../update/semver.js";

// Schema versions this app build understands, per content file. A file with another schemaVersion is
// rejected (the app keeps its bundled or cached copy) until an app update adds support for it.
export const SUPPORTED_SCHEMAS = {
  legal: [1],
  features: [1],
  news: [1],
  majorOrders: [1],
  balance: [1],
  officers: [1],
  weapons: [1],
  ballistics: [1],
};

const WEAPON_CATEGORIES = ["primary", "secondary", "support", "grenades", "stratagems"];
const PEN_CLASSES = ["light", "medium", "heavy", "anti-tank"];
const PATCH_STATUS = ["buff", "nerf", "none"];
const isStat = (value) => value === null || (Number.isFinite(value) && value >= 0);

const LEGAL_DOCS = ["terms", "privacy", "guidelines", "roleplay", "notices"];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isPositiveInt = (value) => Number.isInteger(value) && value >= 1;
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isDateTime = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));
const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

/** Runs check(item, label) for every entry of an array field and collects the problems. */
function eachItem(list, name, check) {
  if (!Array.isArray(list) || !list.length) return [`${name} must be a non-empty list`];
  const errors = list.flatMap((item, i) => (isObject(item) ? check(item, `${name}[${i}]`) : [`${name}[${i}] must be an object`]));
  const ids = list.map((item) => item?.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) errors.push(`${name} has duplicate ids`);
  return errors;
}

const need = (condition, message) => (condition ? [] : [message]);

const NEWS_TAGS = ["BREAKING", "PATCH", "EVENT"];
const TONES = ["comedy", "satire", "serious"];
const FORMATS = ["report", "bulletin", "ad"];
const RESULTS = ["success", "failed"];
const TARGET_STATUS = ["liberated", "contested", "losing"];

function checkReward(reward, at) {
  return need(isObject(reward) && isText(reward.type) && Number.isFinite(reward.amount), `${at}.reward needs type and amount`);
}

const FILE_CHECKS = {
  legal(data) {
    const errors = [];
    if (!isObject(data.contact) || typeof data.contact.email !== "string") errors.push("contact.email is missing");
    if (typeof data.disclaimer !== "string" || typeof data.trademark !== "string") errors.push("disclaimer / trademark missing");
    for (const id of LEGAL_DOCS) {
      const doc = data.documents?.[id];
      if (!isObject(doc)) {
        errors.push(`documents.${id} is missing`);
        continue;
      }
      if (!isPositiveInt(doc.version)) errors.push(`documents.${id}.version must be a positive integer`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.updatedAt ?? "")) errors.push(`documents.${id}.updatedAt must be YYYY-MM-DD`);
      if (typeof doc.title !== "string" || !doc.title) errors.push(`documents.${id}.title is missing`);
      const body = Array.isArray(doc.body) ? doc.body : [doc.body];
      if (!body.length || body.some((line) => typeof line !== "string")) errors.push(`documents.${id}.body must be text lines`);
    }
    return errors;
  },
  features(data) {
    if (!isObject(data.features)) return ["features must be an object"];
    return Object.entries(data.features)
      .filter(([, value]) => typeof value !== "boolean")
      .map(([key]) => `features.${key} must be true or false`);
  },
  news(data) {
    return eachItem(data.items, "items", (item, at) => [
      ...need(isText(item.id), `${at}.id is missing`),
      ...need(isText(item.title) && isText(item.body), `${at} needs title and body`),
      ...need(isDateTime(item.publishedAt), `${at}.publishedAt must be a date-time`),
      ...(item.kind === "official"
        ? need(NEWS_TAGS.includes(item.tag), `${at}.tag must be ${NEWS_TAGS.join(" | ")}`)
        : item.kind === "broadcast"
          ? [
              ...need(TONES.includes(item.tone), `${at}.tone must be ${TONES.join(" | ")}`),
              ...need(FORMATS.includes(item.format), `${at}.format must be ${FORMATS.join(" | ")}`),
              ...need(isText(item.source), `${at}.source is missing`),
            ]
          : [`${at}.kind must be official | broadcast`]),
      ...need(item.image == null || /^\/images\/news\/.+/.test(item.image), `${at}.image must start with /images/news/`),
      ...need(item.relatedItem == null || isText(item.relatedItem), `${at}.relatedItem must be an item id`),
    ]);
  },
  majorOrders(data) {
    const current = data.current;
    const currentErrors = isObject(current)
      ? [
          ...need(isText(current.id) && isText(current.title) && isText(current.briefing), "current needs id, title and briefing"),
          ...need(isDateTime(current.endsAt), "current.endsAt must be a date-time"),
          ...checkReward(current.reward, "current"),
          ...eachItem(current.targets, "current.targets", (t, at) => [
            ...need(isText(t.planet), `${at}.planet is missing`),
            ...need(Number.isFinite(t.progress) && t.progress >= 0 && t.progress <= 100, `${at}.progress must be 0..100`),
            ...need(TARGET_STATUS.includes(t.status), `${at}.status must be ${TARGET_STATUS.join(" | ")}`),
          ]),
        ]
      : ["current must be an object"];
    const pastErrors = eachItem(data.past, "past", (order, at) => [
      ...need(isText(order.id) && isText(order.title), `${at} needs id and title`),
      ...need(isDateTime(order.startedAt) && isDateTime(order.endedAt), `${at} needs startedAt and endedAt`),
      ...need(RESULTS.includes(order.result), `${at}.result must be ${RESULTS.join(" | ")}`),
      ...checkReward(order.reward, at),
    ]);
    return [...currentErrors, ...pastErrors];
  },
  balance(data) {
    return eachItem(data.patches, "patches", (patch, at) => [
      ...need(isText(patch.version), `${at}.version is missing`),
      ...need(isDay(patch.date), `${at}.date must be YYYY-MM-DD`),
      ...eachItem(patch.changes, `${at}.changes`, (change, cat) => [
        ...need(isText(change.itemId) && isText(change.item), `${cat} needs itemId and item`),
        ...need(["weapon", "stratagem"].includes(change.type), `${cat}.type must be weapon | stratagem`),
        ...need(["buff", "nerf"].includes(change.status), `${cat}.status must be buff | nerf`),
        ...need(isText(change.change), `${cat}.change is missing`),
      ]),
    ]);
  },
  officers(data) {
    return eachItem(data.officers, "officers", (officer, at) => [
      ...need(isText(officer.id) && isText(officer.callsign), `${at} needs id and callsign`),
      ...need(Number.isInteger(officer.resolvedCases) && officer.resolvedCases >= 0, `${at}.resolvedCases must be a whole number`),
    ]);
  },
  weapons(data) {
    return eachItem(data.weapons, "weapons", (w, at) => [
      ...need(isText(w.id) && isText(w.name) && isText(w.type), `${at} needs id, name and type`),
      ...need(WEAPON_CATEGORIES.includes(w.category), `${at}.category must be ${WEAPON_CATEGORIES.join(" | ")}`),
      ...need(typeof w.image === "string" && w.image.startsWith("/images/weapons/"), `${at}.image must start with /images/weapons/`),
      ...need(Number.isFinite(w.damage) && w.damage >= 0, `${at}.damage must be a number`),
      ...["fireRate", "magSize", "reloadTime", "recoil"].flatMap((k) => need(isStat(w[k]), `${at}.${k} must be a number or null`)),
      ...need(Number.isInteger(w.ap) && w.ap >= 1, `${at}.ap must be a whole number from 1`),
      ...need(PEN_CLASSES.includes(w.penClass), `${at}.penClass must be ${PEN_CLASSES.join(" | ")}`),
      ...need(
        Array.isArray(w.dropoff) && w.dropoff.every((p) => Number.isFinite(p.distance) && Number.isFinite(p.damage)),
        `${at}.dropoff must be a list of { distance, damage }`,
      ),
      ...need(PATCH_STATUS.includes(w.patchStatus), `${at}.patchStatus must be ${PATCH_STATUS.join(" | ")}`),
      ...need(typeof w.patchNote === "string", `${at}.patchNote must be text`),
    ]);
  },
  ballistics(data) {
    const classErrors = eachItem(data.classes, "classes", (c, at) => [
      ...need(PEN_CLASSES.includes(c.id), `${at}.id must be ${PEN_CLASSES.join(" | ")}`),
      ...need(isText(c.label) && isText(c.color) && isText(c.summary), `${at} needs label, color and summary`),
      ...need(Number.isInteger(c.minAp) && Number.isInteger(c.maxAp) && c.minAp <= c.maxAp, `${at} needs whole minAp <= maxAp`),
    ]);
    const pct = data.rules?.reducedDamagePct;
    return [
      ...classErrors,
      ...need(isObject(data.scale) && Number.isInteger(data.scale.tiers), "scale.tiers must be a whole number"),
      ...need(Number.isFinite(pct) && pct > 0 && pct < 100, "rules.reducedDamagePct must be between 0 and 100"),
    ];
  },
};

/** Returns a list of problems (empty = valid) for content/<name>.json. */
export function validateContent(name, data) {
  if (!isObject(data)) return ["file must contain a JSON object"];
  const errors = [];
  if (!isPositiveInt(data.contentVersion)) errors.push("contentVersion must be a positive integer");
  if (!isPositiveInt(data.schemaVersion)) errors.push("schemaVersion must be a positive integer");
  const supported = SUPPORTED_SCHEMAS[name];
  if (!supported) errors.push(`unknown content file "${name}" (add it to SUPPORTED_SCHEMAS)`);
  else if (isPositiveInt(data.schemaVersion) && !supported.includes(data.schemaVersion)) {
    errors.push(`schemaVersion ${data.schemaVersion} is not supported (supported: ${supported.join(", ")})`);
  }
  if (errors.length) return errors;
  return FILE_CHECKS[name]?.(data) ?? [];
}

/** version-policy.json: { "minimum": "X.Y.Z", "message": "..." } */
export function validateVersionPolicy(data) {
  if (!isObject(data)) return ["file must contain a JSON object"];
  const errors = [];
  if (!isValidVersion(data.minimum)) errors.push('minimum must be a version like "0.1.0"');
  if (data.message != null && typeof data.message !== "string") errors.push("message must be text");
  return errors;
}
