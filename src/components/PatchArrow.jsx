import { IconDash, IconTriangleDown, IconTriangleUp } from "./icons";

const STATUS = {
  buff: { label: "Buff", Icon: IconTriangleUp, color: "text-buff" },
  nerf: { label: "Nerf", Icon: IconTriangleDown, color: "text-danger-text" },
  none: { label: "No change", Icon: IconDash, color: "text-muted" },
};

/** Patch status: buff = green ▲, nerf = red ▼, none = —. Icon plus text, never color alone. */
export default function PatchArrow({ status = "none", showLabel = true, className = "" }) {
  const { label, Icon, color } = STATUS[status] ?? STATUS.none;
  const visibleLabel = showLabel && status !== "none";

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] ${color} ${className}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className={visibleLabel ? undefined : "sr-only"}>{label}</span>
    </span>
  );
}
