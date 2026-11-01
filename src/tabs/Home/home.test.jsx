import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BUNDLED } from "../../content/useContentStore";
import {
  balanceGroups,
  effectiveEndsAt,
  filterNews,
  formatCountdown,
  latestChanges,
  newsAge,
  rankOfficers,
  sortNewest,
} from "./homeData";
import { BalanceView, BountyView, OverviewView } from "./HomeViews";

const NOW = Date.parse("2026-11-01T12:00:00Z");
const news = BUNDLED.news.items;
const renderView = (View) =>
  render(
    <MemoryRouter>
      <View />
    </MemoryRouter>,
  );

describe("home data", () => {
  it("formats news ages like the mockup", () => {
    expect(newsAge("2026-11-01T11:56:00Z", NOW)).toBe("04 min ago");
    expect(newsAge("2026-11-01T10:00:00Z", NOW)).toBe("2 h ago");
    expect(newsAge("2026-10-31T09:00:00Z", NOW)).toBe("yesterday");
    expect(newsAge("2026-10-28T09:00:00Z", NOW)).toBe("4 d ago");
    expect(newsAge("2026-10-12T09:00:00Z", NOW)).toBe("12 Oct");
  });

  it("formats the countdown and never goes negative", () => {
    const ms = ((2 * 24 + 14) * 60 + 8) * 60000 + 31000;
    expect(formatCountdown(ms)).toBe("2D 14H 08M");
    expect(formatCountdown(ms, { seconds: true })).toBe("2D 14H 08M 31S");
    expect(formatCountdown(-5000)).toBe("0D 00H 00M");
  });

  it("rolls a passed sample Major Order forward by whole weeks", () => {
    const order = { endsAt: "2026-10-01T00:00:00Z" };
    const end = effectiveEndsAt(order, true, NOW);
    expect(end).toBeGreaterThan(NOW);
    expect(end - NOW).toBeLessThanOrEqual(7 * 24 * 3600 * 1000);
    expect(effectiveEndsAt(order, false, NOW)).toBe(Date.parse(order.endsAt));
  });

  it("sorts and filters news", () => {
    const sorted = sortNewest(news);
    expect(Date.parse(sorted[0].publishedAt)).toBeGreaterThanOrEqual(Date.parse(sorted[1].publishedAt));
    expect(filterNews(news, "official").every((i) => i.kind === "official")).toBe(true);
    expect(filterNews(news, "broadcasts").every((i) => i.kind === "broadcast")).toBe(true);
    expect(filterNews(news, "all")).toHaveLength(news.length);
  });

  it("groups balance changes by patch and filters them", () => {
    const groups = balanceGroups(BUNDLED.balance.patches, { status: "nerf", type: "weapon" });
    expect(groups.every((p) => p.changes.every((c) => c.status === "nerf" && c.type === "weapon"))).toBe(true);
    expect(groups.map((p) => p.date)).toEqual([...groups.map((p) => p.date)].sort().reverse());
    expect(latestChanges(BUNDLED.balance.patches, 4)).toHaveLength(4);
  });

  it("ranks officers by verified cases", () => {
    const ranked = rankOfficers([
      { id: "a", resolvedCases: 3 },
      { id: "b", resolvedCases: 9 },
    ]);
    expect(ranked.map((o) => [o.id, o.rank])).toEqual([
      ["b", 1],
      ["a", 2],
    ]);
  });
});

describe("broadcast content", () => {
  const broadcasts = news.filter((i) => i.kind === "broadcast");

  it("has 14+ broadcasts in every tone, including the required stories", () => {
    expect(broadcasts.length).toBeGreaterThanOrEqual(14);
    expect(new Set(broadcasts.map((b) => b.tone))).toEqual(new Set(["comedy", "satire", "serious"]));
    expect(broadcasts.some((b) => /C-01/.test(b.title + b.body))).toBe(true);
    expect(broadcasts.some((b) => b.format === "ad" && /perfume|EAU DE HELLDIVER/i.test(b.title + b.body))).toBe(true);
    expect(broadcasts.some((b) => b.tone === "satire" && /Major Order/i.test(b.title))).toBe(true);
  });

  it("has a Ministry of Defense bulletin for buffs, linked to the item", () => {
    const buffIds = BUNDLED.balance.patches.flatMap((p) => p.changes).filter((c) => c.status === "buff").map((c) => c.itemId);
    const bulletins = broadcasts.filter((b) => b.format === "bulletin" && b.source === "Ministry of Defense");
    expect(bulletins.length).toBeGreaterThanOrEqual(3);
    for (const bulletin of bulletins) expect(buffIds).toContain(bulletin.relatedItem);
  });
});

describe("home views", () => {
  it("shows the overview panels and tags broadcasts as in-universe", () => {
    renderView(OverviewView);
    expect(screen.getByText("Liberate the Varn Corridor")).toBeInTheDocument();
    for (const title of ["Galactic News & Events", "Weapon Balance Tracker", "Bounty Board // Top Officers", "All transmissions"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByText("In-universe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In-universe ad").length).toBeGreaterThan(0);
    expect(screen.getByText(/YOU · SGT\. NOVA-21/)).toBeInTheDocument();
  });

  it("filters the feed and expands an item", () => {
    renderView(OverviewView);
    const feed = screen.getByRole("heading", { name: "All transmissions" }).closest("section");
    fireEvent.click(within(feed).getByRole("button", { name: "Official" }));
    expect(within(feed).queryAllByText("In-universe")).toHaveLength(0);
    const item = within(feed).getByRole("button", { name: /Bot counter-offensive/ });
    expect(item).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(item);
    expect(item).toHaveAttribute("aria-expanded", "true");
  });

  it("filters the balance tracker and shows an empty state", () => {
    renderView(BalanceView);
    fireEvent.click(screen.getByRole("button", { name: "Nerfs" }));
    expect(screen.queryByText("Railgun")).not.toBeInTheDocument();
    expect(screen.getByText("Eruptor")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter by type"), { target: { value: "stratagem" } });
    expect(screen.getByText("No balance changes match these filters")).toBeInTheDocument();
  });

  it("pins the user's row on the bounty board and shows the roleplay note", () => {
    renderView(BountyView);
    expect(screen.getByText("CMDR. HALVEK")).toBeInTheDocument();
    expect(screen.getByText(/YOU · SGT\. NOVA-21/)).toBeInTheDocument();
    expect(screen.getByText(/Roleplay ranking/)).toBeInTheDocument();
  });
});
