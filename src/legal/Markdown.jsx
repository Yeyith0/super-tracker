import { Link } from "react-router-dom";
import ExternalLink from "../components/ExternalLink";
import { parseInline, parseMarkdown } from "./markdownParser";

const HEADINGS = {
  1: { Tag: "h2", className: "text-[24px] font-bold uppercase tracking-[0.04em] text-text", margin: "mt-6" },
  2: { Tag: "h3", className: "section-title", margin: "mt-7" },
  3: { Tag: "h4", className: "text-[16px] font-semibold text-text", margin: "mt-5" },
};

function Inline({ text, onNavigate }) {
  return parseInline(text).map((part, index) => {
    if (part.type === "bold") {
      return (
        <strong key={index} className="font-semibold text-text">
          {part.text}
        </strong>
      );
    }
    if (part.type === "link" && part.kind === "external") {
      return (
        <ExternalLink key={index} href={part.href}>
          {part.text}
        </ExternalLink>
      );
    }
    if (part.type === "link") {
      const path = part.href.slice(1);
      const className = "text-cyan underline-offset-4 hover:underline";
      return onNavigate ? (
        <button key={index} type="button" className={className} onClick={() => onNavigate(path)}>
          {part.text}
        </button>
      ) : (
        <Link key={index} to={path} className={className}>
          {part.text}
        </Link>
      );
    }
    return part.text;
  });
}

/**
 * Renders the legal Markdown subset. Internal links (#/legal/...) use the router, or onNavigate(path)
 * when given (the first-run screen shows documents in a modal instead of navigating).
 */
export default function Markdown({ source, onNavigate, skipTitle = false, className = "" }) {
  let blocks = parseMarkdown(source);
  // skipTitle drops a leading "# Title" when the surrounding modal already shows it.
  if (skipTitle && blocks[0]?.type === "heading" && blocks[0].level === 1) blocks = blocks.slice(1);

  return (
    <div className={`max-w-[76ch] text-[15px] leading-relaxed text-text-2 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const { Tag, className: headingClass, margin } = HEADINGS[block.level];
          return (
            <Tag key={index} className={`${headingClass} ${index === 0 ? "" : margin}`}>
              <Inline text={block.text} onNavigate={onNavigate} />
            </Tag>
          );
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index} className={`mt-3 space-y-1.5 pl-6 ${block.ordered ? "list-decimal marker:font-mono marker:text-accent" : "list-[square] marker:text-accent"}`}>
              {block.items.map((item, i) => (
                <li key={i} className="pl-1">
                  <Inline text={item} onNavigate={onNavigate} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={index} className="mt-3">
            <Inline text={block.text} onNavigate={onNavigate} />
          </p>
        );
      })}
    </div>
  );
}
