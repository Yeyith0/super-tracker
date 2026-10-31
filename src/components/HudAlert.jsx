import { IconWarning } from "./icons";

/**
 * Amber warning box (tone "warning") or red alert bar (tone "danger").
 * label is the mono uppercase line ("TACTICAL LOADOUT ADVISOR", "LOBBY ALERT").
 */
export default function HudAlert({ tone = "warning", label, actions, className = "", children }) {
  if (tone === "danger") {
    return (
      <div role="alert" className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-danger bg-alert-fill px-5 py-3 ${className}`}>
        {label ? (
          <span className="hud-label inline-flex items-center gap-2 bg-danger px-2.5 py-1 font-semibold text-on-accent">
            <IconWarning className="h-3.5 w-3.5" />
            {label}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 text-[16px] font-semibold text-text">{children}</div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    );
  }

  return (
    <div role="status" className={`border border-accent-2 bg-warn-fill px-4 py-3.5 ${className}`}>
      {label ? (
        <p className="hud-label mb-2 flex items-center gap-2 text-accent-2">
          <IconWarning className="h-3.5 w-3.5" />
          {label}
        </p>
      ) : null}
      <div className="text-[15px] text-text">{children}</div>
      {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
