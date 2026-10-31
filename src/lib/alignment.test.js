import { alignmentSide, alignmentToPercent, clampAlignment, formatAlignment } from "./alignment";

describe("alignment", () => {
  it("clamps to -100..100 and rounds", () => {
    expect(clampAlignment(250)).toBe(100);
    expect(clampAlignment(-400)).toBe(-100);
    expect(clampAlignment(12.6)).toBe(13);
    expect(clampAlignment(undefined)).toBe(0);
  });

  it("maps the value to a marker position", () => {
    expect(alignmentToPercent(-100)).toBe(0);
    expect(alignmentToPercent(0)).toBe(50);
    expect(alignmentToPercent(56)).toBe(78);
    expect(alignmentToPercent(100)).toBe(100);
  });

  it("formats with a sign and names the side", () => {
    expect(formatAlignment(56)).toBe("+56");
    expect(formatAlignment(-12)).toBe("-12");
    expect(formatAlignment(0)).toBe("0");
    expect(alignmentSide(56)).toBe("Servant of Freedom");
    expect(alignmentSide(-1)).toBe("Traitor");
  });
});
