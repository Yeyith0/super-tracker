import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import HudSelect from "../../components/HudSelect";
import { useContent } from "../../content/useContentStore";
import { useArsenalStore } from "../../store/useArsenalStore";
import { SORTS, penClassFor, searchWeapons, sortWeapons } from "./arsenalData";
import ComparePanel from "./ComparePanel";
import WeaponCard from "./WeaponCard";
import WeaponDrawer from "./WeaponDrawer";

/** Arsenal & Compare (design/03-arsenal.png): catalog per category, compare panel, detail drawer. */
export default function ArsenalTab({ subtab }) {
  const { weapons, sample, patch } = useContent("weapons");
  const { classes, scale } = useContent("ballistics");
  const { slotA, slotB, toggleCompare, swap, clear } = useArsenalStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [openId, setOpenId] = useState(null);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const classFor = (ap) => penClassFor(ap, classes);
  const byId = (id) => weapons.find((w) => w.id === id) ?? null;
  const slotOf = (id) => (id === slotA ? "A" : id === slotB ? "B" : null);

  // Deep links from Home (#/arsenal?item=railgun): jump to the item's category and open its drawer.
  const linked = params.get("item");
  useEffect(() => {
    if (!linked) return;
    const weapon = weapons.find((w) => w.id === linked);
    if (weapon && weapon.category !== subtab.id) {
      navigate(`/arsenal/${weapon.category}?item=${linked}`, { replace: true });
      return;
    }
    if (weapon) setOpenId(linked);
    setParams({}, { replace: true });
  }, [linked, subtab.id, weapons, navigate, setParams]);

  const list = sortWeapons(searchWeapons(weapons.filter((w) => w.category === subtab.id), query), sort);

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-6">
      <div>
        <div className="mb-4 flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${subtab.label.toLowerCase()}`}
            aria-label={`Search ${subtab.label}`}
            className="min-h-11 min-w-0 flex-1 border border-line-strong bg-inset px-3.5 text-[15px] text-text placeholder:text-muted"
          />
          <HudSelect options={SORTS} value={sort} onChange={setSort} label="Sort by" className="w-[150px]" />
        </div>

        {list.length ? (
          <div className="grid grid-cols-2 gap-3">
            {list.map((weapon) => (
              <WeaponCard
                key={weapon.id}
                weapon={weapon}
                penLabel={classFor(weapon.ap).label}
                slot={slotOf(weapon.id)}
                onCompare={() => toggleCompare(weapon.id)}
                onOpen={() => setOpenId(weapon.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState code="No results" title="Nothing matches your search" message="Try another name or type." />
        )}

        {sample ? (
          <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-muted">
            Sample data // approximate values, patch {patch}
          </p>
        ) : null}
      </div>

      <div className="sticky top-4">
        <ComparePanel a={byId(slotA)} b={byId(slotB)} classFor={classFor} scale={scale} onSwap={swap} onClear={clear} />
      </div>

      <WeaponDrawer
        weapon={byId(openId)}
        classFor={classFor}
        scale={scale}
        patch={patch}
        slot={slotOf(openId)}
        onCompare={() => toggleCompare(openId)}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
