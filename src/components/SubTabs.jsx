import { Link } from "react-router-dom";

// Active colors per tab tone (Enemies uses faction colors, the rest use the accent).
const TONES = {
  accent: { text: "text-accent", bar: "bg-accent" },
  danger: { text: "text-danger-text", bar: "bg-danger" },
  "accent-2": { text: "text-accent-2", bar: "bg-accent-2" },
  cyan: { text: "text-cyan", bar: "bg-cyan" },
};

/**
 * Inner tabs. With `hrefFor` every tab is a route link (the inner tab is part of the URL);
 * otherwise tabs are buttons calling onSelect.
 * variant "underline": uppercase letter-spaced labels with a 3px bar under the active tab.
 * variant "chips": boxed buttons, the active one solid accent (Divergram feed filters).
 */
export default function SubTabs({ tabs, active, hrefFor, onSelect, label, variant = "underline", className = "" }) {
  const isChips = variant === "chips";

  return (
    <nav aria-label={label} className={className}>
      <ul className={`flex flex-wrap ${isChips ? "gap-1.5" : ""}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          const tone = TONES[tab.tone ?? "accent"];
          const look = isChips
            ? `min-h-11 border px-4 text-[13px] ${
                isActive
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line-strong text-text hover:border-muted"
              }`
            : `relative h-12 px-3 text-[14px] xl:px-4 ${isActive ? tone.text : "text-text-2 hover:text-text"}`;
          const content = (
            <>
              {tab.label}
              {tab.count != null ? <span className="ml-1">· {tab.count}</span> : null}
              {!isChips && isActive ? (
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-[3px] ${tone.bar}`} />
              ) : null}
            </>
          );
          const classes = `hud-transition flex items-center whitespace-nowrap font-semibold uppercase tracking-[0.16em] transition-colors ${look}`;

          return (
            <li key={tab.id}>
              {hrefFor ? (
                <Link to={hrefFor(tab)} className={classes} aria-current={isActive ? "page" : undefined}>
                  {content}
                </Link>
              ) : (
                <button type="button" className={classes} aria-pressed={isActive} onClick={() => onSelect?.(tab.id)}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
