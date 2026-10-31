import { useLegal } from "../legal/useLegal";

/** "Unofficial fan app" notice. line = one small mono line; block = disclaimer + trademark note. */
export default function FanDisclaimer({ variant = "line", className = "" }) {
  const { disclaimer, trademark } = useLegal();

  if (variant === "block") {
    return (
      <div className={`border-l-2 border-line-strong pl-3 text-[13px] leading-relaxed text-muted ${className}`}>
        <p>{disclaimer}</p>
        <p className="mt-1">{trademark}</p>
      </div>
    );
  }

  return <p className={`font-mono text-[11px] leading-relaxed tracking-[0.02em] text-muted ${className}`}>{disclaimer}</p>;
}
