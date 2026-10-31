// `npm run release 0.2.0`: bumps the version in package.json, package-lock.json, src-tauri/tauri.conf.json,
// src-tauri/Cargo.toml and Cargo.lock, then commits and creates the tag v0.2.0.
// Pushing the tag (git push origin v0.2.0) starts the GitHub Actions release build.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareVersions, isValidVersion } from "../src/update/semver.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
const fail = (message) => {
  console.error(`Release stopped: ${message}`);
  process.exit(1);
};

const version = process.argv[2];
if (!isValidVersion(version ?? "")) fail("give the new version, e.g. `npm run release 0.2.0`.");

const pkgPath = join(ROOT, "package.json");
const current = JSON.parse(readFileSync(pkgPath, "utf8")).version;
if (compareVersions(version, current) <= 0) fail(`${version} must be higher than the current version ${current}.`);
if (git("status", "--porcelain")) fail("commit or stash your changes first (git status is not clean).");
if (git("tag", "--list", `v${version}`)) fail(`tag v${version} already exists.`);

function replaceOnce(path, pattern, replacement) {
  const text = readFileSync(path, "utf8");
  if (!pattern.test(text)) fail(`could not find the version in ${path}`);
  writeFileSync(path, text.replace(pattern, replacement));
}

// package.json / tauri.conf.json: only the top-level "version" line, keeping the file's formatting.
replaceOnce(pkgPath, /^(\s*"version":\s*")[^"]+(")/m, `$1${version}$2`);
replaceOnce(join(ROOT, "src-tauri/tauri.conf.json"), /^(\s*"version":\s*")[^"]+(")/m, `$1${version}$2`);
replaceOnce(join(ROOT, "src-tauri/Cargo.toml"), /(\[package\][^[]*?\nversion\s*=\s*")[^"]+(")/, `$1${version}$2`);
replaceOnce(join(ROOT, "src-tauri/Cargo.lock"), /(name = "super-tracker"\nversion = ")[^"]+(")/, `$1${version}$2`);

const lockPath = join(ROOT, "package-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
lock.version = version;
if (lock.packages?.[""]) lock.packages[""].version = version;
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

git("add", "package.json", "package-lock.json", "src-tauri/tauri.conf.json", "src-tauri/Cargo.toml", "src-tauri/Cargo.lock");
git("commit", "-m", `Release v${version}`);
git("tag", "-a", `v${version}`, "-m", `Super Tracker v${version}`);

console.log(`Version ${current} -> ${version}, committed and tagged v${version}.`);
console.log(`Start the release build with:  git push && git push origin v${version}`);
