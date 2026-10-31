// Validation for content/*.json and version-policy.json. Shared by the app (content channel) and
// scripts/validate-content.mjs (GitHub Actions), so keep it free of browser and Vite-only APIs.
import { isValidVersion } from "../update/semver.js";

// Schema versions this app build understands, per content file. A file with another schemaVersion is
// rejected (the app keeps its bundled or cached copy) until an app update adds support for it.
export const SUPPORTED_SCHEMAS = {
  legal: [1],
  features: [1],
};

const LEGAL_DOCS = ["terms", "privacy", "guidelines", "roleplay", "notices"];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isPositiveInt = (value) => Number.isInteger(value) && value >= 1;

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
