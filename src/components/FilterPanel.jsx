import { useId } from "react";
import Chip from "./Chip";
import HudSelect from "./HudSelect";

/**
 * Reusable "FILTER // SORT" block: category chips + sort select.
 * selected is an array of category ids (multi) or a single id; onToggle(id) flips one chip.
 * variant "panel" = accent-bordered panel (Loadout); "bare" = chips and select only (Treason).
 */
export default function FilterPanel({
  title = "Filter // Sort",
  categories = [],
  selected = [],
  onToggle,
  sortOptions = [],
  sort,
  onSortChange,
  sortLabel = "Sort by",
  variant = "panel",
  className = "",
}) {
  const sortId = useId();
  const isSelected = (id) => (Array.isArray(selected) ? selected.includes(id) : selected === id);
  const frame = variant === "panel" ? "border border-accent bg-panel p-4" : "";

  return (
    <section aria-label={title} className={`${frame} ${className}`}>
      {variant === "panel" ? <h2 className="hud-label mb-3 text-accent">{title}</h2> : null}
      {categories.length ? (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <Chip key={category.id} active={isSelected(category.id)} onClick={() => onToggle?.(category.id)}>
              {category.label}
            </Chip>
          ))}
        </div>
      ) : null}
      {sortOptions.length ? (
        <div className={categories.length ? "mt-4" : ""}>
          <label htmlFor={sortId} className="mb-2 block text-[14px] text-text-2">
            {sortLabel}
          </label>
          <HudSelect id={sortId} options={sortOptions} value={sort} onChange={onSortChange} />
        </div>
      ) : null}
    </section>
  );
}
