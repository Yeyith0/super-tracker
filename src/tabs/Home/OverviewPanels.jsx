import Panel from "../../components/Panel";
import PatchArrow from "../../components/PatchArrow";
import RoleplayNotice from "../../components/RoleplayNotice";
import { useNow } from "../../lib/useNow";
import { useProfileStore } from "../../store/useProfileStore";
import { padRank, rankOfficers } from "./homeData";
import NewsTags from "./NewsTags";

const row = "border-b border-line py-3.5 first:pt-0 last:border-b-0 last:pb-0";

/** Three newest news items of either kind; clicking one opens it in the feed below. */
export function NewsPanel({ items, onOpen }) {
  const now = useNow(60000);
  return (
    <Panel title="Galactic News & Events">
      <ul>
        {items.map((item) => (
          <li key={item.id} className={row}>
            <button type="button" onClick={() => onOpen(item.id)} className="block w-full text-left">
              <NewsTags item={item} now={now} />
              <span className="mt-2 block text-[16px] font-semibold leading-snug text-text hover:text-accent">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Latest balance changes with buff / nerf arrows. */
export function BalancePanel({ changes }) {
  return (
    <Panel title="Weapon Balance Tracker">
      <ul>
        {changes.map((change) => (
          <li key={`${change.version}-${change.itemId}`} className={`flex items-center justify-between gap-4 ${row}`}>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-text">{change.item}</p>
              <p className="mt-0.5 text-[13px] text-muted">{change.change}</p>
            </div>
            <PatchArrow status={change.status} className="shrink-0 text-[15px]" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function OfficerRow({ rank, callsign, cases, you = false }) {
  return (
    <li className={`flex items-center gap-5 ${you ? "-mx-2 bg-accent/5 px-2 py-3.5" : row}`}>
      <span className={`w-8 font-mono text-[20px] font-semibold ${!you && rank <= 3 ? "text-accent" : "text-text-2"}`}>{padRank(rank)}</span>
      <span className={`flex-1 truncate text-[16px] font-semibold ${you ? "text-accent" : "text-text"}`}>{callsign}</span>
      <span className="shrink-0 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">{cases} cases</span>
    </li>
  );
}

/** Top 3 Anti-Treason Officers plus the user's own position. */
export function BountyPanel({ officers }) {
  const { callsign, resolvedCases, bountyRank } = useProfileStore();
  const top = rankOfficers(officers).slice(0, 3);
  return (
    <Panel title="Bounty Board // Top Officers">
      <RoleplayNotice context="bounty" variant="line" className="-mt-1 mb-3" />
      <ul>
        {top.map((officer) => (
          <OfficerRow key={officer.id} rank={officer.rank} callsign={officer.callsign} cases={officer.resolvedCases} />
        ))}
        <OfficerRow you rank={bountyRank} callsign={`YOU · ${callsign}`} cases={resolvedCases} />
      </ul>
    </Panel>
  );
}
