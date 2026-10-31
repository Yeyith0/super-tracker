// Pure helpers for the legal texts in content/legal.json. Shared by the app and by
// scripts/generate-licenses.mjs (Node), so no JSX, browser APIs or Vite-only imports here.

export const DOC_IDS = ["terms", "privacy", "guidelines", "roleplay", "notices"];

// Documents the user must accept; a higher version of any of them shows the first-run screen again.
export const REQUIRED_DOCS = ["terms", "guidelines", "roleplay"];

/** Token values for {{owner}}, {{email}}, {{country}}, {{disclaimer}}, {{trademark}}, {{copyright}}. */
export function legalTokens(content, { owner, copyright }) {
  const { email, country } = content.contact;
  return {
    owner,
    copyright,
    country,
    email: `[${email}](mailto:${email})`,
    disclaimer: content.disclaimer,
    trademark: content.trademark,
  };
}

export function fillTokens(text, tokens) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in tokens ? tokens[key] : match));
}

/** Document bodies are stored as an array of Markdown lines so they stay readable in JSON. */
export function docSource(doc) {
  return Array.isArray(doc.body) ? doc.body.join("\n") : doc.body;
}

export function prepareDocs(content, tokens) {
  return Object.fromEntries(
    DOC_IDS.map((id) => {
      const doc = content.documents[id];
      return [id, { id, title: doc.title, version: doc.version, updatedAt: doc.updatedAt, source: fillTokens(docSource(doc), tokens) }];
    }),
  );
}

export function requiredVersions(docs) {
  return Object.fromEntries(REQUIRED_DOCS.map((id) => [id, docs[id].version]));
}

/** Required documents whose current version is newer than the one the user accepted. */
export function changedDocs(legal, docs) {
  return REQUIRED_DOCS.filter((id) => (legal?.accepted?.[id] ?? 0) < docs[id].version);
}

export function needsLegalAcceptance(legal, docs) {
  return !legal?.ageConfirmed || changedDocs(legal, docs).length > 0;
}

/** Markdown -> plain text for the installer's license page (headings in capitals, links as text). */
export function markdownToPlainText(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      const heading = /^(#{1,3})\s+(.*)$/.exec(line.trim());
      const text = (heading ? heading[2].toUpperCase() : line)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1");
      return text.replace(/^- /, "  * ");
    })
    .join("\r\n");
}

/** Text of the NSIS installer license page (src-tauri/legal/TERMS.txt). */
export function termsPlainText(docs, copyright) {
  const terms = docs.terms;
  return [
    `SUPER TRACKER - ${terms.title.toUpperCase()} (version ${terms.version}, updated ${terms.updatedAt})`,
    "",
    markdownToPlainText(terms.source),
    "",
    copyright,
    "",
  ].join("\r\n");
}
