import ImageWithFallback from "../../components/ImageWithFallback";
import PatchArrow from "../../components/PatchArrow";

const SLOT_STYLE = {
  A: { border: "border-2 border-cyan", label: "text-cyan" },
  B: { border: "border-2 border-accent-2", label: "text-accent-2" },
};

/** Vertical bar placeholder from design/03-arsenal.png, used until a weapon photo exists. */
function WeaponPlaceholder({ name }) {
  return (
    <div
      role="img"
      aria-label={name}
      className="h-full w-full"
      style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--line) 0 9px, transparent 9px 18px)" }}
    />
  );
}

/** Catalog card: compare toggle (slot A / B), patch arrow, image, name, type and penetration class. */
export default function WeaponCard({ weapon, penLabel, slot, onCompare, onOpen }) {
  const style = SLOT_STYLE[slot];
  return (
    <article className={`flex flex-col bg-panel ${style ? style.border : "border border-line"} hud-transition transition-colors`}>
      <div className="flex items-center justify-between px-3.5 pt-3">
        <button
          type="button"
          aria-pressed={Boolean(slot)}
          aria-label={slot ? `Remove ${weapon.name} from slot ${slot}` : `Compare ${weapon.name}`}
          onClick={onCompare}
          className={`hud-label min-h-8 text-[10px] tracking-[0.12em] hover:text-text ${style ? style.label : "text-text-2"}`}
        >
          {slot ? `Slot ${slot}` : "+ Compare"}
        </button>
        <PatchArrow status={weapon.patchStatus} showLabel={false} className="[&_svg]:h-3.5 [&_svg]:w-3.5" />
      </div>
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2 text-left">
        <span className="block h-14 w-full overflow-hidden">
          <ImageWithFallback
            src={weapon.image}
            alt={weapon.name}
            className="h-full w-full object-contain"
            fallback={<WeaponPlaceholder name={weapon.name} />}
          />
        </span>
        <span className="mt-3 block text-[16px] font-semibold leading-tight text-text">{weapon.name}</span>
        <span className="mt-2 block font-mono text-[11px] uppercase leading-snug tracking-[0.1em] text-muted">
          {weapon.type} · {penLabel}
        </span>
      </button>
    </article>
  );
}
