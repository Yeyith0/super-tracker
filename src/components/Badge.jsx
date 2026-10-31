const TONES = {
  danger: "bg-danger text-on-accent border-danger",
  cyan: "bg-cyan text-on-accent border-cyan",
  amber: "bg-accent-2 text-on-accent border-accent-2",
  accent: "bg-accent text-on-accent border-accent",
  buff: "bg-buff text-on-accent border-buff",
  outline: "bg-transparent text-accent-2 border-accent-2",
  "outline-danger": "bg-transparent text-danger-text border-danger",
  neutral: "bg-line text-text-2 border-line",
};

/** Small mono uppercase tag: BREAKING (danger), PATCH (cyan), EVENT (amber), UNDER JURY REVIEW (outline)… */
export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase leading-none tracking-[0.06em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
