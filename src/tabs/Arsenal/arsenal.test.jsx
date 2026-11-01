import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { BUNDLED } from "../../content/useContentStore";
import { useArsenalStore } from "../../store/useArsenalStore";
import { TABS } from "../tabs";
import ArsenalTab from "./ArsenalTab";
import { STATS, compareStat, damageAt, dropoffRows, formatStat, penClassFor, searchWeapons, sortWeapons, tierCount } from "./arsenalData";

const { weapons } = BUNDLED.weapons;
const ballistics = BUNDLED.ballistics;
const byId = (id) => weapons.find((w) => w.id === id);
const stat = (key) => STATS.find((s) => s.key === key);
const arsenalTab = TABS.find((t) => t.id === "arsenal");

describe("weapon content", () => {
  it("has the wiki's weapons in every category, with stable ids", () => {
    expect(weapons.length).toBeGreaterThanOrEqual(100);
    for (const sub of arsenalTab.subtabs) expect(weapons.some((w) => w.category === sub.id)).toBe(true);
    expect(new Set(weapons.map((w) => w.id)).size).toBe(weapons.length);
    expect(BUNDLED.weapons.source.license).toBe("CC BY-NC-SA 4.0");
  });

  it("uses the wiki's armor penetration (Eruptor is heavy pen)", () => {
    expect(byId("eruptor")).toMatchObject({ ap: 4, penClass: "heavy" });
  });

  it("derives penClass from ap with ballistics.json", () => {
    for (const w of weapons) expect(penClassFor(w.ap, ballistics.classes).id).toBe(w.penClass);
  });

  it("links every balance change to a weapon and mirrors the latest patch", () => {
    const patches = [...BUNDLED.balance.patches].sort((a, b) => b.date.localeCompare(a.date));
    for (const change of patches.flatMap((p) => p.changes)) expect(byId(change.itemId)).toBeDefined();
    const latest = patches[0];
    expect(BUNDLED.weapons.patch).toBe(latest.version);
    for (const w of weapons) {
      const change = latest.changes.find((c) => c.itemId === w.id);
      expect([w.id, w.patchStatus]).toEqual([w.id, change ? change.status : "none"]);
      expect(w.patchNote).toBe(change ? change.change : "");
    }
  });

  it("points Ministry of Defense bulletins in the news at real weapons", () => {
    for (const item of BUNDLED.news.items.filter((i) => i.relatedItem)) expect(byId(item.relatedItem)).toBeDefined();
  });
});

describe("arsenal data", () => {
  it("marks the better value green and the worse red, lower winning for recoil and reload", () => {
    const lib = byId("liberator");
    const sickle = byId("sickle");
    expect(compareStat(lib, sickle, stat("damage"))).toMatchObject({ a: "better", b: "worse" });
    expect(compareStat(lib, sickle, stat("recoil"))).toMatchObject({ a: "worse", b: "better" });
    expect(compareStat(lib, sickle, stat("reloadTime"))).toMatchObject({ a: "better", b: "worse" });
    expect(compareStat(lib, sickle, stat("magSize"))).toMatchObject({ a: "worse", b: "better", widthB: 100 });
    expect(compareStat(lib, lib, stat("damage"))).toMatchObject({ a: "tie", b: "tie" });
    expect(compareStat(lib, null, stat("damage"))).toMatchObject({ a: "tie", b: null, widthB: 0 });
  });

  it("formats unlimited magazines, reloads and missing stats", () => {
    expect(formatStat(byId("arc-thrower"), "magSize")).toBe("∞");
    expect(formatStat(byId("liberator"), "reloadTime")).toBe("2.1s");
    expect(formatStat(byId("frag-grenade"), "fireRate")).toBe("—");
  });

  it("interpolates drop-off curves", () => {
    const points = [{ distance: 0, damage: 60 }, { distance: 30, damage: 60 }, { distance: 60, damage: 50 }];
    expect(damageAt(points, 15)).toBe(60);
    expect(damageAt(points, 45)).toBe(55);
    expect(damageAt(points, 100)).toBe(50);
    expect(damageAt([], 10)).toBeNull();
    expect(dropoffRows(byId("liberator"), null)).toHaveLength(11);
  });

  it("sorts, searches and fills pen tiers", () => {
    const primaries = weapons.filter((w) => w.category === "primary");
    const damages = sortWeapons(primaries, "damage").map((w) => w.damage);
    expect(damages).toEqual([...damages].sort((a, b) => b - a));
    expect(sortWeapons(primaries, "patch")[0].patchStatus).not.toBe("none");
    const shotguns = searchWeapons(primaries, "shotgun");
    expect(shotguns.length).toBeGreaterThan(2);
    expect(shotguns.every((w) => /shotgun/i.test(w.name + w.type))).toBe(true);
    expect(tierCount(2, ballistics.scale)).toBe(2);
    expect(tierCount(6, ballistics.scale)).toBe(5);
  });
});

describe("compare store", () => {
  beforeEach(() => useArsenalStore.getState().clear());

  it("fills A then B, toggles off, swaps and clears", () => {
    const { toggleCompare } = useArsenalStore.getState();
    toggleCompare("liberator");
    toggleCompare("sickle");
    expect(useArsenalStore.getState()).toMatchObject({ slotA: "liberator", slotB: "sickle" });
    toggleCompare("breaker");
    expect(useArsenalStore.getState().slotB).toBe("breaker");
    useArsenalStore.getState().swap();
    expect(useArsenalStore.getState()).toMatchObject({ slotA: "breaker", slotB: "liberator" });
    toggleCompare("breaker");
    expect(useArsenalStore.getState().slotA).toBeNull();
    useArsenalStore.getState().clear();
    expect(useArsenalStore.getState()).toMatchObject({ slotA: null, slotB: null });
  });
});

function Harness() {
  const { subtab } = useParams();
  return <ArsenalTab subtab={arsenalTab.subtabs.find((s) => s.id === subtab)} />;
}

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/arsenal/:subtab" element={<Harness />} />
      </Routes>
    </MemoryRouter>,
  );

describe("arsenal tab", () => {
  beforeEach(() => useArsenalStore.getState().clear());

  it("compares two cards side by side", () => {
    renderAt("/arsenal/primary");
    fireEvent.click(screen.getByRole("button", { name: "Compare Liberator" }));
    fireEvent.click(screen.getByRole("button", { name: "Compare Sickle" }));
    expect(screen.getByRole("button", { name: "Remove Liberator from slot A" })).toBeInTheDocument();
    const panel = screen.getByText("VS").closest("section");
    expect(within(panel).getByText("Liberator")).toBeInTheDocument();
    expect(within(panel).getByText("Sickle")).toBeInTheDocument();
    const [stronger, weaker] = [byId("liberator").damage, byId("sickle").damage].sort((x, y) => y - x);
    expect(within(panel).getByText(String(stronger))).toHaveClass("text-buff");
    expect(within(panel).getByText(String(weaker))).toHaveClass("text-danger-text");
    fireEvent.click(within(panel).getByRole("button", { name: "Swap" }));
    expect(useArsenalStore.getState()).toMatchObject({ slotA: "sickle", slotB: "liberator" });
  });

  it("searches the catalog and shows an empty state", () => {
    renderAt("/arsenal/primary");
    fireEvent.change(screen.getByLabelText("Search Primary"), { target: { value: "zzz" } });
    expect(screen.getByText("Nothing matches your search")).toBeInTheDocument();
  });

  it("opens the detail drawer for a card", () => {
    renderAt("/arsenal/primary");
    const card = screen.getByRole("button", { name: "Compare Breaker" }).closest("article");
    fireEvent.click(within(card).getAllByRole("button")[1]);
    const drawer = screen.getByRole("dialog");
    expect(within(drawer).getByRole("heading", { name: "Breaker" })).toBeInTheDocument();
    expect(within(drawer).getByText(`AP ${byId("breaker").ap}`)).toBeInTheDocument();
    expect(within(drawer).getByText(/Helldivers Wiki/)).toBeInTheDocument();
  });

  it("filters the catalog by type", () => {
    renderAt("/arsenal/primary");
    fireEvent.change(screen.getByLabelText("Filter by type"), { target: { value: "Shotgun" } });
    const count = weapons.filter((w) => w.category === "primary" && w.type === "Shotgun").length;
    expect(screen.getByText(`${count} of ${weapons.filter((w) => w.category === "primary").length} items`)).toBeInTheDocument();
  });

  it("follows a Home link to the item's category and opens it", async () => {
    renderAt("/arsenal/primary?item=railgun");
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByRole("heading", { name: "Railgun" })).toBeInTheDocument();
    expect(within(drawer).getByText("Charge time 1.4s → 1.1s")).toBeInTheDocument();
  });
});
