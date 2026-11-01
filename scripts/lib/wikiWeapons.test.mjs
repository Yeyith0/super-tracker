import { firstNumber, parseAp, parseCapacity, parseDamage, slugify, splitTitle, stripWikitext, wikiRowToWeapon } from "./wikiWeapons.mjs";

const ICON = (ap, label) => `<span class="Templateicons icon-outline">[[File:Armor AP${ap} Icon.png|link=Damage|alt=]]&nbsp;[[Damage#Armor|${label}]]</span>`;

describe("wiki weapon parser", () => {
  it("strips wikitext and HTML", () => {
    expect(stripWikitext('<span>[[File:x.svg|20px]]&nbsp;[[Damage#Types|<span style="color: default;">90 Ballistic</span>]]</span>')).toBe("90 Ballistic");
    expect(stripWikitext("230 Impact <br> 225 Explosion <hr> 110 Shrapnel (x30)<br>", " · ")).toBe("230 Impact · 225 Explosion / 110 Shrapnel (x30)");
    expect(stripWikitext("8s<br>(105)")).toBe("8s (105)");
    expect(firstNumber("1,200 rpm")).toBe(1200);
  });

  it("picks the main damage value", () => {
    expect(parseDamage("230 Impact 225 Explosion 110 Shrapnel (x30)")).toBe(230);
    expect(parseDamage("150/s over 6.5s Fire 2000 Explosion")).toBe(2000);
    expect(parseDamage("150 DPS Fire")).toBe(150);
    expect(parseDamage("600-1500 Ballistic")).toBe(600);
    expect(parseDamage("")).toBeNull();
  });

  it("reads armor penetration from the icon or the label", () => {
    expect(parseAp(`${ICON(4, "Heavy")} (Projectile)<br> ${ICON(3, "Medium")} (Explosion)`)).toBe(4);
    expect(parseAp(ICON(0, "Unarmored"))).toBe(1);
    expect(parseAp("Tank II")).toBe(6);
    expect(parseAp("Medium (Flechette) Light (Stun)")).toBe(3);
    expect(parseAp("No Hitbox")).toBeNull();
  });

  it("understands magazines, unlimited ammo and heat", () => {
    expect(parseCapacity("45")).toEqual({ magSize: 45, heat: false });
    expect(parseCapacity("45 (4mm)<hr> 4 (10g)")).toEqual({ magSize: 45, heat: false });
    expect(parseCapacity("1,000 (Backpack)")).toEqual({ magSize: 1000, heat: false });
    expect(parseCapacity("∞")).toEqual({ magSize: null, heat: false });
    expect(parseCapacity("8s (105)")).toEqual({ magSize: 105, heat: true });
    expect(parseCapacity("15s (175) (Fires Indefinitely)")).toEqual({ magSize: null, heat: true });
    expect(parseCapacity("N/A")).toMatchObject({ magSize: null, unknown: true });
  });

  it("splits designations from names and keeps generic names unique", () => {
    expect(splitTitle("AR-23 Liberator")).toEqual({ designation: "AR-23", name: "Liberator" });
    expect(splitTitle("M7S SMG")).toEqual({ designation: "M7S", name: "M7S SMG" });
    expect(splitTitle("Entrenchment Tool")).toEqual({ designation: "", name: "Entrenchment Tool" });
    expect(slugify("Breaker Spray&Pray")).toBe("breaker-spray-and-pray");
  });

  it("maps a row to a weapon and skips rows without penetration", () => {
    const eruptor = wikiRowToWeapon({
      title: "R-36 Eruptor",
      "weapon category": "Primary Weapons",
      "weapon type": "Explosives",
      damage: "230 Impact 225 Explosion",
      "penetration direct": `${ICON(4, "Heavy")} (Projectile)`,
      capacity: "5",
      "fire rate": "32 rpm",
      recoil: "58",
    });
    expect(eruptor).toMatchObject({ id: "eruptor", name: "Eruptor", category: "primary", type: "Explosive", damage: 230, ap: 4, magSize: 5, fireRate: 32, recoil: 58 });
    expect(wikiRowToWeapon({ title: "G-6 Frag", "weapon category": "Throwables", damage: "500 Explosion", "penetration direct": "Medium" }, { aliases: { frag: "frag-grenade" } }).id).toBe("frag-grenade");
    expect(wikiRowToWeapon({ title: "G-3 Smoke", "weapon category": "Throwables", damage: "0", "penetration direct": "No Hitbox" })).toBeNull();
  });
});
