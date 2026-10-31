// Validates content/*.json and version-policy.json (run by GitHub Actions on every push, or locally with
// `npm run validate-content`). Exits with code 1 when a file is invalid.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateContent, validateVersionPolicy } from "../src/content/validate.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = false;

function check(label, path, validate) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    console.error(`✗ ${label}: invalid JSON (${error.message})`);
    failed = true;
    return;
  }
  const errors = validate(data);
  if (errors.length) {
    failed = true;
    console.error(`✗ ${label}`);
    for (const error of errors) console.error(`    - ${error}`);
  } else {
    console.log(`✓ ${label}${data.contentVersion ? ` (contentVersion ${data.contentVersion})` : ""}`);
  }
}

for (const file of readdirSync(join(ROOT, "content")).filter((f) => f.endsWith(".json")).sort()) {
  check(`content/${file}`, join(ROOT, "content", file), (data) => validateContent(file.replace(/\.json$/, ""), data));
}
check("version-policy.json", join(ROOT, "version-policy.json"), validateVersionPolicy);

process.exit(failed ? 1 : 0);
