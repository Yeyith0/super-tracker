import { render, screen } from "@testing-library/react";
import FeatureClosed from "../components/FeatureClosed";
import { TABS } from "../tabs/tabs";
import { BUNDLED, CONTENT_NAMES, pickNewest, useContentStore } from "./useContentStore";
import { validateContent, validateVersionPolicy } from "./validate";

const legal = BUNDLED.legal;

describe("content validation", () => {
  it.each(CONTENT_NAMES)("bundled %s.json is valid", (name) => {
    expect(validateContent(name, BUNDLED[name])).toEqual([]);
  });

  it("rejects files without versions or with an unsupported schemaVersion", () => {
    expect(validateContent("legal", { ...legal, contentVersion: undefined })).toContain("contentVersion must be a positive integer");
    expect(validateContent("legal", { ...legal, schemaVersion: 99 })[0]).toMatch(/schemaVersion 99 is not supported/);
    expect(validateContent("unknown", { contentVersion: 1, schemaVersion: 1 })[0]).toMatch(/unknown content file/);
    expect(validateContent("features", { contentVersion: 1, schemaVersion: 1, features: { divergram: "yes" } })).toEqual([
      "features.divergram must be true or false",
    ]);
  });

  it("validates version-policy.json", () => {
    expect(validateVersionPolicy({ minimum: "0.1.0", message: "" })).toEqual([]);
    expect(validateVersionPolicy({ minimum: "latest" })).toHaveLength(1);
  });
});

describe("content channel", () => {
  it("keeps the newest valid copy", () => {
    const newer = { ...legal, contentVersion: legal.contentVersion + 1 };
    const broken = { ...legal, contentVersion: legal.contentVersion + 5, schemaVersion: 99 };
    const picked = pickNewest("legal", [
      { data: legal, source: "bundled" },
      { data: broken, source: "cache" },
      { data: newer, source: "remote" },
    ]);
    expect(picked.source).toBe("remote");
  });

  it("applies a newer remote file and ignores older or invalid ones", () => {
    const { applyRemote } = useContentStore.getState();
    expect(applyRemote("features", { ...BUNDLED.features })).toBe(false);
    expect(applyRemote("features", { contentVersion: 99, schemaVersion: 2, features: {} })).toBe(false);
    expect(applyRemote("features", { contentVersion: 99, schemaVersion: 1, features: { divergram: true } })).toBe(true);
    expect(useContentStore.getState().files.features.data.features.divergram).toBe(true);
    useContentStore.setState({ files: { ...useContentStore.getState().files, features: { data: BUNDLED.features, source: "bundled" } } });
  });
});

describe("feature flags", () => {
  it("keeps Divergram closed by default", () => {
    expect(BUNDLED.features.features.divergram).toBe(false);
  });

  it("shows a closed feature without phase numbers", () => {
    render(<FeatureClosed tab={TABS.find((t) => t.id === "divergram")} />);
    expect(screen.getByRole("heading", { name: /Divergram/ })).toHaveTextContent("Under construction");
    expect(document.body).not.toHaveTextContent(/Phase \d/);
  });
});
