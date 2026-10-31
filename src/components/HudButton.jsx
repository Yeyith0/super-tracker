const VARIANTS = {
  primary: "border border-accent bg-accent text-on-accent hover:brightness-110",
  secondary: "border border-accent-2 bg-transparent text-accent-2 hover:bg-accent-2/10",
  danger: "border border-danger bg-danger text-on-accent hover:brightness-110",
  warning: "border border-accent-2 bg-accent-2 text-on-accent hover:brightness-110",
};

const SIZES = {
  md: "min-h-11 px-5 text-[14px]",
  sm: "min-h-9 px-3 text-[12px]",
};

/** Square HUD button: primary (solid accent), secondary (1px border), danger (solid red). */
export default function HudButton({
  variant = "primary",
  size = "md",
  type = "button",
  block = false,
  icon,
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`hud-transition inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.16em] transition-[filter,background-color,color] disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
      {icon}
    </button>
  );
}
