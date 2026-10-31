import { IconChevronDown } from "./icons";

/** Native <select> in HUD style (square, 1px border, dark popup via color-scheme). */
export default function HudSelect({ options, value, onChange, label, id, className = "", ...rest }) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        aria-label={id ? undefined : label}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="hud-transition min-h-11 w-full appearance-none border border-line-strong bg-inset pl-3.5 pr-10 text-[15px] text-text transition-colors hover:border-muted"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-2" />
    </div>
  );
}
