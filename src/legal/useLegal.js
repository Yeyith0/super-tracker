import { BUNDLED, useContent } from "../content/useContentStore";
import { COPYRIGHT_HOLDER, COPYRIGHT_LINE } from "../config";
import { legalTokens, prepareDocs } from "./legalText";

const built = new WeakMap();

/** Legal texts ready for display, built from a content/legal.json object (memoized per object). */
export function buildLegal(content) {
  if (!built.has(content)) {
    built.set(content, {
      contact: content.contact,
      disclaimer: content.disclaimer,
      trademark: content.trademark,
      docs: prepareDocs(content, legalTokens(content, { owner: COPYRIGHT_HOLDER, copyright: COPYRIGHT_LINE })),
    });
  }
  return built.get(content);
}

// Bundled version (tests, scripts). The app uses useLegal(), which follows the content channel.
export const LEGAL = buildLegal(BUNDLED.legal);

export function useLegal() {
  return buildLegal(useContent("legal"));
}

export function formatDocDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
