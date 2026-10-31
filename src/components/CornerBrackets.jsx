// L-shaped accent corners around visual cards (salute card, SEAF frame).
// The parent must be `relative`.
const CORNERS = [
  { position: "left-0 top-0", sides: ["Left", "Top"] },
  { position: "right-0 top-0", sides: ["Right", "Top"] },
  { position: "left-0 bottom-0", sides: ["Left", "Bottom"] },
  { position: "right-0 bottom-0", sides: ["Right", "Bottom"] },
];

export default function CornerBrackets({ size = 32, thickness = 3, className = "border-accent" }) {
  return CORNERS.map(({ position, sides }) => (
    <span
      key={position}
      aria-hidden="true"
      className={`pointer-events-none absolute border-solid ${position} ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: 0,
        ...Object.fromEntries(sides.map((side) => [`border${side}Width`, thickness])),
      }}
    />
  ));
}
