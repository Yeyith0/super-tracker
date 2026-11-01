import { IconClock, IconTriangleDown } from "../../components/icons";
import Panel from "../../components/Panel";
import ProgressBar from "../../components/ProgressBar";
import { useNow } from "../../lib/useNow";
import { effectiveEndsAt, formatCountdown } from "./homeData";

const STATUS = {
  liberated: { tone: "buff", color: "text-buff" },
  contested: { tone: "accent", color: "text-accent" },
  losing: { tone: "danger", color: "text-danger-text" },
};

function TargetProgress({ target }) {
  const { tone, color } = STATUS[target.status];
  const label = target.status === "liberated" ? "Liberated" : `${target.progress.toFixed(1)}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[15px] text-text">{target.planet}</span>
        <span className={`flex items-center gap-1.5 font-mono text-[14px] uppercase ${color}`}>
          {label}
          {target.trend === "down" ? (
            <>
              <IconTriangleDown className="h-2.5 w-2.5" />
              <span className="sr-only">falling</span>
            </>
          ) : null}
        </span>
      </div>
      <ProgressBar value={target.progress} tone={tone} label={`${target.planet} liberation`} className="mt-2" />
    </div>
  );
}

/**
 * Current Major Order (design/01-home.png hero). detailed adds the briefing, a seconds countdown and the reward.
 */
export default function MajorOrderHero({ order, sample, detailed = false }) {
  const now = useNow(detailed ? 1000 : 30000);
  const remaining = effectiveEndsAt(order, sample, now) - now;

  return (
    <Panel accentTop className="px-6 pb-6 pt-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="hud-label text-accent-2">Major order // Priority {order.priority}</p>
          <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[0.02em] text-text">{order.title}</h2>
        </div>
        <p className="flex shrink-0 items-center gap-2 font-mono text-[14px] text-text" aria-label="Time left">
          <IconClock className="h-3.5 w-3.5 text-text-2" />
          {formatCountdown(remaining, { seconds: detailed })}
        </p>
      </div>
      {detailed ? <p className="mt-3 max-w-[80ch] text-[15px] leading-relaxed text-text-2">{order.briefing}</p> : null}
      <div className={`grid grid-cols-3 gap-4 ${detailed ? "mt-6" : "mt-4"}`}>
        {order.targets.map((target) => (
          <TargetProgress key={target.planet} target={target} />
        ))}
      </div>
      {detailed ? (
        <div className="mt-6 flex items-center gap-4 border-t border-line pt-4">
          <span className="hud-label text-muted">Reward</span>
          <span className="font-mono text-[15px] font-semibold uppercase text-accent">
            {order.reward.amount.toLocaleString("en-US")} {order.reward.type}
          </span>
        </div>
      ) : null}
    </Panel>
  );
}
