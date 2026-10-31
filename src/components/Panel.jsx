import CornerBrackets from "./CornerBrackets";

const SURFACES = {
  panel: "bg-panel",
  inset: "bg-inset",
};

/**
 * Square HUD panel: 1px --line border on a --panel fill.
 * accentTop -> 4px accent top border (hero panels); brackets -> corner-bracket frame;
 * title -> small uppercase accent section title with a rule below it.
 */
export default function Panel({
  as: Tag = "section",
  title,
  titleId,
  actions,
  accentTop = false,
  brackets = false,
  surface = "panel",
  padded = true,
  className = "",
  children,
  ...rest
}) {
  const border = brackets ? "border border-line-strong" : "border border-line";
  const top = accentTop ? "border-t-4 border-t-accent" : "";
  const padding = padded ? (brackets ? "p-6" : "p-5") : "";

  return (
    <Tag
      className={`relative ${border} ${top} ${SURFACES[surface]} ${padding} ${className}`}
      aria-labelledby={title && titleId ? titleId : undefined}
      {...rest}
    >
      {brackets ? <CornerBrackets /> : null}
      {title ? (
        <header className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-4">
          <h2 id={titleId} className="section-title">
            {title}
          </h2>
          {actions}
        </header>
      ) : null}
      {children}
    </Tag>
  );
}
