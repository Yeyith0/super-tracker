// Tiny Markdown parser for the legal texts: headings (#, ##, ###), paragraphs, "-" and "1." lists,
// **bold** and [links](href). It returns plain data; <Markdown> renders it as React text, so raw HTML
// in the source is shown as text and never injected.

export function parseMarkdown(source) {
  const blocks = [];
  let paragraph = null;
  let list = null;

  const flush = () => {
    if (paragraph) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    if (list) blocks.push(list);
    paragraph = null;
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    const item = /^(?:([-*])|\d+[.)])\s+(.*)$/.exec(line);
    if (item) {
      const ordered = !item[1];
      if (paragraph) {
        blocks.push({ type: "paragraph", text: paragraph.join(" ") });
        paragraph = null;
      }
      if (!list || list.ordered !== ordered) {
        if (list) blocks.push(list);
        list = { type: "list", ordered, items: [] };
      }
      list.items.push(item[2]);
      continue;
    }

    if (list) {
      // A wrapped line continues the previous list item.
      list.items[list.items.length - 1] += ` ${line}`;
    } else {
      (paragraph ??= []).push(line);
    }
  }

  flush();
  return blocks;
}

/** Only these link targets become links; anything else (javascript:, data:, …) stays plain text. */
export function linkKind(href) {
  if (/^https:\/\//i.test(href) || /^mailto:/i.test(href)) return "external";
  if (href.startsWith("#/")) return "internal";
  return null;
}

export function parseInline(text) {
  const parts = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ type: "text", text: text.slice(last, match.index) });
    if (match[1] != null) {
      parts.push({ type: "bold", text: match[1] });
    } else {
      const kind = linkKind(match[3]);
      parts.push(kind ? { type: "link", kind, text: match[2], href: match[3] } : { type: "text", text: match[0] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}
