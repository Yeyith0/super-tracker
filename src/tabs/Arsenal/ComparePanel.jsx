import EmptyState from "../../components/EmptyState";
import HudButton from "../../components/HudButton";
import Panel from "../../components/Panel";
import { STATS, compareStat, formatStat, statLabel, statValue } from "./arsenalData";
import DropoffChart from "./DropoffChart";
import { PenTierRow, penSummary } from "./PenTierBar";

const VALUE_COLOR = { better: "text-buff", worse: "text-danger-text" };
const BAR_COLOR = { better: "bg-buff", worse: "bg-danger" };

function StatRow({ stat, a, b, category }) {
  const cmp = compareStat(a, b, stat);
  return (
    <div className="grid h-[29px] grid-cols-[56px_minmax(0,1fr)_132px_minmax(0,1fr)_56px] items-center gap-2.5">
      <span className={`text-right font-mono text-[13px] ${VALUE_COLOR[cmp.a] ?? "text-text-2"}`}>{a ? formatStat(a, stat.key) : ""}</span>
      <div className="flex h-[9px] justify-end">
        <div className={`h-full ${BAR_COLOR[cmp.a] ?? "bg-muted"}`} style={{ width: `${cmp.widthA}%` }} />
      </div>
      <span className="text-center font-mono text-[12px] uppercase tracking-[0.14em] text-text-2">{statLabel(stat, category)}</span>
      <div className="flex h-[9px]">
        <div className={`h-full ${BAR_COLOR[cmp.b] ?? "bg-muted"}`} style={{ width: `${cmp.widthB}%` }} />
      </div>
      <span className={`font-mono text-[13px] ${VALUE_COLOR[cmp.b] ?? "text-text-2"}`}>{b ? formatStat(b, stat.key) : ""}</span>
    </div>
  );
}

function SlotHeading({ slot, weapon, align }) {
  const color = slot === "A" ? "text-cyan" : "text-accent-2";
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className={`hud-label ${color}`}>Slot {slot}</p>
      <p className={`mt-1 truncate text-[22px] font-bold ${weapon ? "text-text" : "text-muted"}`}>{weapon ? weapon.name : "Empty"}</p>
    </div>
  );
}

/** Side-by-side comparison of slot A and slot B (design/03-arsenal.png). */
export default function ComparePanel({ a, b, classFor, scale, onSwap, onClear }) {
  if (!a && !b) {
    return (
      <Panel>
        <EmptyState
          code="No items in the compare slots"
          title="Pick two items to compare"
          message="Press + COMPARE on any card: the first one goes to slot A, the second to slot B."
        />
      </Panel>
    );
  }

  const category = (a ?? b).category;
  const stats = STATS.filter((stat) => statValue(a, stat.key) != null || statValue(b, stat.key) != null);
  const items = [a, b].filter(Boolean);

  return (
    <Panel className="px-6 py-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4">
        <SlotHeading slot="A" weapon={a} />
        <span className="mt-4 font-mono text-[13px] text-muted">VS</span>
        <SlotHeading slot="B" weapon={b} align="right" />
      </div>

      <div className="mt-5">
        {stats.map((stat) => (
          <StatRow key={stat.key} stat={stat} a={a} b={b} category={category} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_200px] gap-5">
        <div>
          <p className="hud-label mb-2 text-text-2">Damage drop-off (dmg / meters)</p>
          <DropoffChart a={a} b={b} />
          <p className="mt-3 flex flex-wrap gap-x-4 text-[13px]">
            {a ? <span className="text-cyan">━ {a.name}</span> : null}
            {b ? <span className="text-accent-2">┅ {b.name}</span> : null}
          </p>
        </div>
        <div>
          <p className="hud-label mb-2 text-text-2">Armor pen tier</p>
          <div className="space-y-1.5">
            {a ? <PenTierRow ap={a.ap} scale={scale} slot="A" label={a.name} /> : null}
            {b ? <PenTierRow ap={b.ap} scale={scale} slot="B" label={b.name} /> : null}
          </div>
          {penSummary(items, classFor).map((line) => (
            <p key={line} className="mt-3 text-[14px] leading-snug text-text-2">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <HudButton size="sm" variant="secondary" onClick={onSwap} disabled={!a || !b}>
          Swap
        </HudButton>
        <HudButton size="sm" variant="secondary" onClick={onClear}>
          Clear
        </HudButton>
      </div>
    </Panel>
  );
}
