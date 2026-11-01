import { useId } from "react";

// Inline SVG icons (no emoji, no icon font). Size and color come from className / currentColor.
// Icons are decorative (aria-hidden) unless a `title` is given.

function Svg({ className = "h-4 w-4", title, viewBox = "0 0 16 16", children, ...rest }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "square" };

export const IconMinimize = (p) => (
  <Svg viewBox="0 0 10 10" {...p}>
    <rect x="0" y="4.5" width="10" height="1" />
  </Svg>
);

export const IconMaximize = (p) => (
  <Svg viewBox="0 0 10 10" {...p}>
    <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" />
  </Svg>
);

export const IconRestore = (p) => (
  <Svg viewBox="0 0 10 10" {...p}>
    <rect x="0.5" y="2.5" width="7" height="7" fill="none" stroke="currentColor" />
    <path d="M2.5 2.5V0.5h7v7h-2" fill="none" stroke="currentColor" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg viewBox="0 0 10 10" {...p}>
    <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.1" />
  </Svg>
);

export function IconGear(p) {
  const mask = useId();
  return (
    <Svg {...p}>
      <defs>
        <mask id={mask}>
          <rect width="16" height="16" fill="white" />
          <circle cx="8" cy="8" r="2.3" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        <circle cx="8" cy="8" r="5.2" />
        {[0, 45, 90, 135].map((angle) => (
          <rect key={angle} x="6.8" y="0.6" width="2.4" height="14.8" transform={`rotate(${angle} 8 8)`} />
        ))}
      </g>
    </Svg>
  );
}

const STAR = "M8 1.2l2.05 4.3 4.75.62-3.47 3.27.87 4.69L8 11.8l-4.2 2.28.87-4.69L1.2 6.12l4.75-.62z";

export const IconStar = (p) => (
  <Svg {...p}>
    <path d={STAR} />
  </Svg>
);

export const IconStarOutline = (p) => (
  <Svg {...p}>
    <path d={STAR} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="miter" />
  </Svg>
);

export const IconTriangleUp = (p) => (
  <Svg {...p}>
    <path d="M8 3l6 10H2z" />
  </Svg>
);

export const IconTriangleDown = (p) => (
  <Svg {...p}>
    <path d="M2 3h12L8 13z" />
  </Svg>
);

export const IconTriangleRight = (p) => (
  <Svg {...p}>
    <path d="M4 2l9 6-9 6z" />
  </Svg>
);

export const IconWarning = (p) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M8 1l7.5 13.5H.5zM7.2 5.5h1.6V10H7.2zM7.2 11.2h1.6v1.6H7.2z"
    />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="9" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 6v3.4l2.2 1.4M6.4 1.2h3.2M12.6 3.4l1 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </Svg>
);

export const IconExternal = (p) => (
  <Svg {...p}>
    <path d="M5 11l6-6M6 4.5h5.5V10" {...stroke} />
  </Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p}>
    <path d="M4 6l4 4 4-4" {...stroke} />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M3 8.5l3 3 7-7" {...stroke} />
  </Svg>
);

export const IconCross = (p) => (
  <Svg {...p}>
    <path d="M4 4l8 8M12 4l-8 8" {...stroke} />
  </Svg>
);

export const IconDash = (p) => (
  <Svg {...p}>
    <rect x="3" y="7.2" width="10" height="1.6" />
  </Svg>
);
