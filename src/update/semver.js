// Minimal semantic version helpers for "X.Y.Z" versions (an optional leading "v" is ignored).

export function parseVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(version ?? "").trim());
  return match ? match.slice(1, 4).map(Number) : null;
}

/** -1 if a < b, 0 if equal, 1 if a > b. Unparseable versions sort lowest. */
export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return pa ? 1 : pb ? -1 : 0;
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

export const isValidVersion = (version) => parseVersion(version) !== null && /^\d+\.\d+\.\d+$/.test(version);
