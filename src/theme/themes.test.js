import { THEMES } from "./themes";
import { contrastRatio } from "./contrast";

const SURFACES = ["bg", "sidebar", "strip", "panel", "inset"];
const TEXT_TOKENS = ["text", "text-2", "muted", "accent", "accent-2", "cyan", "buff", "danger-text"];
// Solid fills that carry dark --on-accent text (active nav item, primary button, tags).
const FILLS = ["accent", "accent-2", "cyan", "buff", "danger"];
const AA = 4.5;

describe("themes", () => {
  const keys = Object.keys(THEMES[0].tokens).sort();

  it.each(THEMES.map((t) => [t.name, t]))("%s defines every token", (_, theme) => {
    expect(Object.keys(theme.tokens).sort()).toEqual(keys);
  });

  for (const theme of THEMES) {
    describe(theme.name, () => {
      const t = theme.tokens;

      it.each(SURFACES.flatMap((s) => TEXT_TOKENS.map((x) => [x, s])))(
        "%s text on %s has at least 4.5:1",
        (text, surface) => {
          expect(contrastRatio(t[text], t[surface])).toBeGreaterThanOrEqual(AA);
        },
      );

      it.each(FILLS)("on-accent text on %s fill has at least 4.5:1", (fill) => {
        expect(contrastRatio(t["on-accent"], t[fill])).toBeGreaterThanOrEqual(AA);
      });

      it("warning box and alert bar text has at least 4.5:1", () => {
        expect(contrastRatio(t.text, t["warn-fill"])).toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(t["accent-2"], t["warn-fill"])).toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(t.text, t["alert-fill"])).toBeGreaterThanOrEqual(AA);
      });
    });
  }
});
