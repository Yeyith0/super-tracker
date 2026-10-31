import { IconStar, IconStarOutline } from "./icons";

/** Favorite toggle: filled accent star when on, outline when off. 44px hit area. */
export default function StarToggle({ active = false, onChange, label = "item", className = "" }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      onClick={(event) => {
        event.stopPropagation();
        onChange?.(!active);
      }}
      className={`hud-transition inline-flex h-11 w-11 shrink-0 items-center justify-center transition-colors ${
        active ? "text-accent" : "text-muted hover:text-text"
      } ${className}`}
    >
      {active ? <IconStar className="h-5 w-5" /> : <IconStarOutline className="h-5 w-5" />}
    </button>
  );
}
