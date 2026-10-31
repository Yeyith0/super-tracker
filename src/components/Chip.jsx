/** Toggle chip: transparent with a 1px border, solid accent when active. */
export default function Chip({ active = false, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`hud-transition min-h-10 border px-3 text-[14px] uppercase transition-colors ${
        active
          ? "border-accent bg-accent font-semibold text-on-accent"
          : "border-line-strong text-text hover:border-muted"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
