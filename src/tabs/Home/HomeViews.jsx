import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/Badge";
import Chip from "../../components/Chip";
import EmptyState from "../../components/EmptyState";
import HudSelect from "../../components/HudSelect";
import Panel from "../../components/Panel";
import PatchArrow from "../../components/PatchArrow";
import RoleplayNotice from "../../components/RoleplayNotice";
import { useContent } from "../../content/useContentStore";
import { useProfileStore } from "../../store/useProfileStore";
import { balanceGroups, latestChanges, padRank, rankOfficers, sortNewest } from "./homeData";
import MajorOrderHero from "./MajorOrderHero";
import NewsFeed from "./NewsFeed";
import { BalancePanel, BountyPanel, NewsPanel } from "./OverviewPanels";

const SampleBadge = ({ show }) => (show ? <Badge tone="neutral">Sample data</Badge> : null);

const formatDay = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Galactic News tab: the overview from design/01-home.png, then the full news feed. */
export function OverviewView() {
  const news = sortNewest(useContent("news").items);
  const orders = useContent("majorOrders");
  const balance = useContent("balance");
  const officers = useContent("officers");
  const [openId, setOpenId] = useState(null);

  const openInFeed = (id) => {
    setOpenId(id);
    requestAnimationFrame(() => document.getElementById(`news-${id}`)?.scrollIntoView?.({ behavior: "smooth", block: "center" }));
  };
  const sampleParts = [
    orders.sample && "major orders",
    news.some((item) => item.sample) && "official news",
    balance.sample && "balance changes",
    officers.sample && "the bounty board",
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <MajorOrderHero order={orders.current} sample={orders.sample} />
      <div className="grid grid-cols-3 gap-5">
        <NewsPanel items={news.slice(0, 3)} onOpen={openInFeed} />
        <BalancePanel changes={latestChanges(balance.patches, 4)} />
        <BountyPanel officers={officers.officers} />
      </div>
      {sampleParts.length ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Sample data // {sampleParts.join(", ")} are examples until live data is connected
        </p>
      ) : null}
      <NewsFeed items={news} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} />
    </div>
  );
}

export function MajorOrdersView() {
  const orders = useContent("majorOrders");
  const past = [...orders.past].sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));

  return (
    <div className="space-y-5">
      <MajorOrderHero order={orders.current} sample={orders.sample} detailed />
      <Panel title="Past orders" actions={<SampleBadge show={orders.sample} />}>
        <ul>
          {past.map((order) => {
            const success = order.result === "success";
            return (
              <li
                key={order.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-6 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-text">{order.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{order.summary}</p>
                </div>
                <p className="font-mono text-[12px] text-muted">
                  {formatDay(order.startedAt)} – {formatDay(order.endedAt)}
                </p>
                <div className="flex w-[230px] items-center justify-end gap-4">
                  <span className="font-mono text-[12px] uppercase text-text-2">
                    {order.reward.amount.toLocaleString("en-US")} {order.reward.type}
                  </span>
                  <Badge tone={success ? "buff" : "danger"}>{success ? "Success" : "Failed"}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "buff", label: "Buffs" },
  { id: "nerf", label: "Nerfs" },
];
const TYPE_OPTIONS = [
  { id: "all", label: "All types" },
  { id: "weapon", label: "Weapons" },
  { id: "stratagem", label: "Stratagems" },
];

export function BalanceView() {
  const balance = useContent("balance");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const groups = balanceGroups(balance.patches, { status, type });

  return (
    <Panel title="Weapon Balance Tracker" actions={<SampleBadge show={balance.sample} />}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Filter by change">
          {STATUS_FILTERS.map((f) => (
            <Chip key={f.id} active={status === f.id} onClick={() => setStatus(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <HudSelect options={TYPE_OPTIONS} value={type} onChange={setType} label="Filter by type" className="w-56" />
      </div>

      {groups.map((patch) => (
        <section key={patch.version} className="mt-6">
          <h3 className="hud-label text-accent-2">
            Patch {patch.version} <span className="text-muted">· {formatDay(patch.date)}</span>
          </h3>
          <ul className="mt-2 border border-line">
            {patch.changes.map((change) => (
              <li
                key={change.itemId}
                className="grid grid-cols-[minmax(0,1fr)_120px_110px] items-center gap-4 border-b border-line px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <Link to={`/arsenal?item=${change.itemId}`} className="text-[16px] font-semibold text-text hover:text-accent">
                    {change.item}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-muted">{change.change}</p>
                </div>
                <span>
                  <Badge>{change.type}</Badge>
                </span>
                <PatchArrow status={change.status} className="justify-self-end text-[15px]" />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length ? <EmptyState code="No changes" title="No balance changes match these filters" className="mt-6" /> : null}
    </Panel>
  );
}

export function BountyView() {
  const officers = useContent("officers");
  const { callsign, resolvedCases, bountyRank } = useProfileStore();
  const ranked = rankOfficers(officers.officers);

  return (
    <Panel title="Bounty Board // Top Officers" actions={<SampleBadge show={officers.sample} />}>
      <RoleplayNotice context="bounty" variant="line" />
      <p className="mt-1 text-[13px] text-muted">Anti-Treason Officers ranked by verified resolved cases.</p>
      <div className="mt-4 grid grid-cols-[64px_minmax(0,1fr)_200px] border-b border-line pb-2 hud-label text-muted">
        <span>Rank</span>
        <span>Officer</span>
        <span className="text-right">Verified cases</span>
      </div>
      <ol>
        {ranked.map((officer) => (
          <li
            key={officer.id}
            className={`grid grid-cols-[64px_minmax(0,1fr)_200px] items-center border-b border-line py-3.5 ${
              officer.rank <= 3 ? "border-l-2 border-l-accent pl-3" : "pl-[14px]"
            }`}
          >
            <span className={`font-mono text-[20px] font-semibold ${officer.rank <= 3 ? "text-accent" : "text-text-2"}`}>
              {padRank(officer.rank)}
            </span>
            <span className="truncate text-[16px] font-semibold text-text">{officer.callsign}</span>
            <span className="text-right font-mono text-[13px] uppercase tracking-[0.1em] text-text-2">{officer.resolvedCases} cases</span>
          </li>
        ))}
      </ol>
      <p className="py-2 text-center font-mono text-[12px] text-muted" aria-hidden="true">
        · · ·
      </p>
      <div className="sticky bottom-0 bg-panel">
        <div className="grid grid-cols-[64px_minmax(0,1fr)_200px] items-center bg-accent/5 py-3.5 pl-[14px]">
          <span className="font-mono text-[20px] font-semibold text-text-2">{padRank(bountyRank)}</span>
          <span className="truncate text-[16px] font-semibold text-accent">YOU · {callsign}</span>
          <span className="text-right font-mono text-[13px] uppercase tracking-[0.1em] text-text-2">{resolvedCases} cases</span>
        </div>
      </div>
    </Panel>
  );
}
