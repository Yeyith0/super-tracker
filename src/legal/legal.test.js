import { readFileSync } from "node:fs";
import content from "../../content/legal.json";
import tauriConf from "../../src-tauri/tauri.conf.json";
import pkg from "../../package.json";
import { COPYRIGHT_HOLDER, COPYRIGHT_LINE } from "../config";
import { DOC_IDS, changedDocs, needsLegalAcceptance, requiredVersions, termsPlainText } from "./legalText";
import { LEGAL } from "./useLegal";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("legal content", () => {
  it.each(DOC_IDS)("%s has a version, date, title and filled-in body", (id) => {
    const doc = LEGAL.docs[id];
    expect(Number.isInteger(doc.version) && doc.version >= 1).toBe(true);
    expect(doc.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc.title).toBeTruthy();
    expect(doc.source).not.toMatch(/\{\{|\[PLACEHOLDER\]/);
  });

  it("has contact details", () => {
    expect(content.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
    expect(content.contact.country).toBeTruthy();
  });
});

describe("copyright notice", () => {
  it("is the same in config, tauri.conf.json, LICENSE and package.json", () => {
    expect(COPYRIGHT_LINE).toContain(COPYRIGHT_HOLDER);
    expect(tauriConf.bundle.copyright).toBe(COPYRIGHT_LINE);
    expect(tauriConf.bundle.publisher).toBe(COPYRIGHT_HOLDER);
    expect(read("../../LICENSE")).toContain(COPYRIGHT_HOLDER);
    expect(pkg.license).toBe("UNLICENSED");
  });

  it("installer Terms page is up to date (run `npm run licenses` after editing legal.json)", () => {
    expect(read("../../src-tauri/legal/TERMS.txt")).toBe(termsPlainText(LEGAL.docs, COPYRIGHT_LINE));
  });
});

describe("first-run acceptance", () => {
  const docs = LEGAL.docs;
  const current = { ageConfirmed: true, accepted: requiredVersions(docs), acceptedAt: "2026-11-01T10:00:00.000Z" };

  it("is needed before anything was accepted", () => {
    expect(needsLegalAcceptance(null, docs)).toBe(true);
  });

  it("is not needed once the current versions are accepted", () => {
    expect(needsLegalAcceptance(current, docs)).toBe(false);
    expect(changedDocs(current, docs)).toEqual([]);
  });

  it("is needed again when a required document gets a new version", () => {
    const bumped = { ...docs, roleplay: { ...docs.roleplay, version: docs.roleplay.version + 1 } };
    expect(needsLegalAcceptance(current, bumped)).toBe(true);
    expect(changedDocs(current, bumped)).toEqual(["roleplay"]);
  });

  it("is not needed for a new Privacy Notice version (informational)", () => {
    const bumped = { ...docs, privacy: { ...docs.privacy, version: docs.privacy.version + 1 } };
    expect(needsLegalAcceptance(current, bumped)).toBe(false);
  });

  it("is needed without the age confirmation", () => {
    expect(needsLegalAcceptance({ ...current, ageConfirmed: false }, docs)).toBe(true);
  });
});
