import { useId } from "react";
import { IconCheck } from "./icons";

/** Square HUD checkbox on a native input (keyboard and screen readers work as usual). */
export default function Checkbox({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`hud-transition mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
          checked ? "border-accent bg-accent" : "border-line-strong bg-inset"
        }`}
      >
        {checked ? <IconCheck className="h-3.5 w-3.5 text-on-accent" /> : null}
      </span>
      <span>
        <span className="block text-[15px] text-text">{label}</span>
        {description ? <span className="mt-0.5 block text-[13px] text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
