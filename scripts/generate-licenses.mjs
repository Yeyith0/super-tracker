// Generates the legal files that ship with the app. Runs before every `npm run build` (prebuild) and via
// `npm run licenses`:
//   public/legal/third-party-licenses.json  license list shown in Settings → Legal & Licenses (npm + Rust)
//   THIRD_PARTY_LICENSES.md              the same list with full license texts, bundled with the installer
//   src-tauri/legal/TERMS.txt            Terms of Use for the NSIS installer license page
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COPYRIGHT_HOLDER, COPYRIGHT_LINE } from "../src/config.js";
import { legalTokens, prepareDocs, termsPlainText } from "../src/legal/legalText.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = join(ROOT, "public/legal/third-party-licenses.json");
const OUT_MD = join(ROOT, "THIRD_PARTY_LICENSES.md");
const OUT_TERMS = join(ROOT, "src-tauri/legal/TERMS.txt");
const LICENSE_FILE = /^(licen[cs]e|copying|notice)([-._].*)?$/i;

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

function licenseId(value) {
  if (!value) return "UNKNOWN";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(licenseId).join(" OR ");
  return value.type ?? "UNKNOWN";
}

function repositoryUrl(value) {
  const url = typeof value === "string" ? value : value?.url;
  return url ? url.replace(/^git\+/, "").replace(/\.git$/, "") : null;
}

function licenseText(dir, id, repository) {
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => LICENSE_FILE.test(f)).sort() : [];
  const texts = files.map((f) => readFileSync(join(dir, f), "utf8").replace(/\r\n?/g, "\n").trim());
  if (texts.length) return texts.join("\n\n---\n\n");
  return `No license file is included in this package. License: ${id}.${repository ? ` Source code: ${repository}` : ""}`;
}

// npm: production dependencies and everything they depend on, resolved like Node does.
function findPackageDir(name, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

function npmPackages() {
  const root = readJson(join(ROOT, "package.json"));
  const seen = new Map();
  const queue = Object.keys(root.dependencies ?? {}).map((name) => [name, ROOT]);
  while (queue.length) {
    const [name, from] = queue.shift();
    const dir = findPackageDir(name, from);
    if (!dir || seen.has(dir)) continue;
    const pkg = readJson(join(dir, "package.json"));
    const license = licenseId(pkg.license ?? pkg.licenses);
    const text = licenseText(dir, license, repositoryUrl(pkg.repository) ?? pkg.homepage);
    seen.set(dir, { source: "npm", name: pkg.name, version: pkg.version, license, text });
    for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) queue.push([dep, dir]);
  }
  return [...seen.values()];
}

// Rust: crates compiled into the Windows app (normal dependencies reachable from src-tauri).
function rustPackages() {
  const output = execFileSync(
    "cargo",
    ["metadata", "--format-version", "1", "--locked", "--filter-platform", "x86_64-pc-windows-msvc", "--manifest-path", join(ROOT, "src-tauri/Cargo.toml")],
    { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
  );
  const meta = JSON.parse(output);
  const packages = new Map(meta.packages.map((p) => [p.id, p]));
  const nodes = new Map(meta.resolve.nodes.map((n) => [n.id, n]));
  const reached = new Set();
  const stack = [meta.resolve.root];
  while (stack.length) {
    for (const dep of nodes.get(stack.pop()).deps) {
      if (!dep.dep_kinds.some((k) => k.kind === null) || reached.has(dep.pkg)) continue;
      reached.add(dep.pkg);
      stack.push(dep.pkg);
    }
  }
  return [...reached].map((id) => {
    const p = packages.get(id);
    const license = p.license ?? "UNKNOWN";
    const text = licenseText(dirname(p.manifest_path), license, p.repository ?? p.homepage);
    return { source: "rust", name: p.name, version: p.version, license, text };
  });
}

function previousRustEntries() {
  if (!existsSync(OUT_JSON)) return [];
  const previous = readJson(OUT_JSON);
  return previous.packages.filter((p) => p.source === "rust").map((p) => ({ ...p, text: previous.texts[p.text] }));
}

let rust;
try {
  rust = rustPackages();
} catch (error) {
  rust = previousRustEntries();
  console.warn(`WARNING: cargo metadata failed (${error.message.split("\n")[0]}). Reusing ${rust.length} Rust entries from the previous run.`);
}

// Identical license texts are stored once and referenced by id.
const texts = {};
const packages = [...npmPackages(), ...rust]
  .sort((a, b) => a.source.localeCompare(b.source) || a.name.localeCompare(b.name) || a.version.localeCompare(b.version))
  .map(({ text, ...pkg }) => {
    const id = createHash("sha1").update(text).digest("hex").slice(0, 10);
    texts[id] = text;
    return { ...pkg, text: id };
  });

writeFileSync(OUT_JSON, `${JSON.stringify({ texts, packages }, null, 1)}\n`);

const table = (source) =>
  ["| Package | Version | License |", "| --- | --- | --- |", ...packages.filter((p) => p.source === source).map((p) => `| ${p.name} | ${p.version} | ${p.license} |`)].join("\n");
const users = (id) => packages.filter((p) => p.text === id).map((p) => `${p.name} ${p.version}`);

writeFileSync(
  OUT_MD,
  [
    "# Third-party licenses",
    "",
    `Super Tracker includes the open-source components listed below. Each one is used under its own license, reproduced at the end of this file. Everything else in Super Tracker is ${COPYRIGHT_LINE}`,
    "",
    "This file is generated by `npm run licenses`; do not edit it by hand.",
    "",
    "## App (npm packages)",
    "",
    table("npm"),
    "",
    "## Desktop shell (Rust crates)",
    "",
    table("rust"),
    "",
    "## License texts",
    "",
    ...Object.entries(texts).flatMap(([id, text]) => [`### ${id}`, "", `Used by: ${users(id).join(", ")}`, "", "~~~text", text, "~~~", ""]),
  ].join("\n"),
);

// Installer license page. Plain UTF-8: the Tauri bundler adds the BOM NSIS needs for non-ASCII characters.
const legal = readJson(join(ROOT, "content/legal.json"));
const docs = prepareDocs(legal, legalTokens(legal, { owner: COPYRIGHT_HOLDER, copyright: COPYRIGHT_LINE }));
mkdirSync(dirname(OUT_TERMS), { recursive: true });
writeFileSync(OUT_TERMS, termsPlainText(docs, COPYRIGHT_LINE));

const count = (source) => packages.filter((p) => p.source === source).length;
console.log(`Licenses: ${count("npm")} npm packages, ${count("rust")} Rust crates, ${Object.keys(texts).length} unique texts.`);
