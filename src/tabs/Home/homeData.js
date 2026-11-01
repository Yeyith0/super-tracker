// Pure helpers for the Home tab (news feed, countdowns, balance tracker, bounty board).

const DAY = 24 * 60 * 60 * 1000;

export const sortNewest = (items) => [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

/** filter: "all" | "official" | "broadcasts" */
export function filterNews(items, filter = "all") {
  if (filter === "official") return items.filter((item) => item.kind === "official");
  if (filter === "broadcasts") return items.filter((item) => item.kind === "broadcast");
  return items;
}

/** "04 min ago", "2 h ago", "yesterday", "3 d ago", then "24 Oct" (as in design/01-home.png). */
export function newsAge(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
  if (minutes < 60) return `${String(minutes).padStart(2, "0")} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** "2D 14H 08M" (and "31S" with seconds); never negative. */
export function formatCountdown(ms, { seconds = false } = {}) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d}D ${pad(h)}H ${pad(m)}M${seconds ? ` ${pad(s)}S` : ""}`;
}

/**
 * End time of the current Major Order. Sample data rolls forward by whole weeks once it has passed,
 * so the countdown keeps ticking until live data (Phase 9) replaces it.
 */
export function effectiveEndsAt(order, sample, now = Date.now()) {
  const end = Date.parse(order.endsAt);
  if (!sample || end > now) return end;
  const week = 7 * DAY;
  return end + (Math.floor((now - end) / week) + 1) * week;
}

/** Patches newest first, each with the changes matching status ("all" | "buff" | "nerf") and type. */
export function balanceGroups(patches, { status = "all", type = "all" } = {}) {
  return [...patches]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((patch) => ({
      ...patch,
      changes: patch.changes.filter((c) => (status === "all" || c.status === status) && (type === "all" || c.type === type)),
    }))
    .filter((patch) => patch.changes.length > 0);
}

export const latestChanges = (patches, count) =>
  balanceGroups(patches)
    .flatMap((patch) => patch.changes.map((change) => ({ ...change, version: patch.version })))
    .slice(0, count);

/** Officers ranked by verified resolved cases, highest first. */
export const rankOfficers = (officers) =>
  [...officers].sort((a, b) => b.resolvedCases - a.resolvedCases).map((officer, i) => ({ ...officer, rank: i + 1 }));

export const padRank = (rank) => String(rank).padStart(2, "0");
