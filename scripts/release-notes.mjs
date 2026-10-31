// Prints the GitHub release title and body for a version, taken from CHANGELOG.md.
// Used by .github/workflows/release.yml:  node scripts/release-notes.mjs v0.2.0
// Also exports changelogSection() for scripts/release.mjs.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FOOTER =
  "### Install\n" +
  'Download `Super Tracker_..._x64-setup.exe` below and run it. The installer is not code-signed yet: if Windows shows "Windows protected your PC", choose **More info → Run anyway**. Microsoft Defender can raise a false alarm on new, unsigned apps; Super Tracker contains no malware and its source code is public. Installed copies update themselves.\n\n' +
  "---\n" +
  "Super Tracker is not affiliated with, endorsed or sponsored by Arrowhead Game Studios or Sony Interactive Entertainment.";

/** { heading, body } of "## X.Y.Z — Heading" in CHANGELOG.md, or null. */
export function changelogSection(version) {
  const text = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8").replace(/\r\n?/g, "\n");
  const plain = version.replace(/^v/, "");
  const start = text.search(new RegExp(`^## ${plain.replace(/\./g, "\\.")}(\\s|$)`, "m"));
  if (start < 0) return null;
  const rest = text.slice(start);
  const next = rest.slice(3).search(/^## /m);
  const section = next < 0 ? rest : rest.slice(0, next + 3);
  const [first, ...lines] = section.split("\n");
  const heading = first.replace(/^## [^\s]+\s*(—|-)?\s*/, "").trim();
  return { heading, body: lines.join("\n").trim() };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const version = process.argv[2];
  const section = version && changelogSection(version);
  if (!section) {
    console.error(`No "## ${version?.replace(/^v/, "")}" section in CHANGELOG.md`);
    process.exit(1);
  }
  const plain = version.replace(/^v/, "");
  const title = `Super Tracker v${plain}${section.heading ? ` — ${section.heading}` : ""}`;
  // First line: title; the rest: body (the workflow splits them).
  console.log(`${title}\n${section.body}\n\n${FOOTER}`);
}
