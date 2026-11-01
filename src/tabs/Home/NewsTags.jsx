import Badge from "../../components/Badge";
import { newsAge } from "./homeData";

const OFFICIAL_TONES = { BREAKING: "danger", PATCH: "cyan", EVENT: "amber" };

/** Tag line of a news item: BREAKING / PATCH / EVENT, or IN-UNIVERSE + tone + source for broadcasts. */
export default function NewsTags({ item, now, showSource = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {item.kind === "official" ? (
        <Badge tone={OFFICIAL_TONES[item.tag]}>{item.tag}</Badge>
      ) : (
        <>
          <Badge tone="outline">{item.format === "ad" ? "In-universe ad" : "In-universe"}</Badge>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2">{item.tone}</span>
        </>
      )}
      <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">{newsAge(item.publishedAt, now)}</span>
      {showSource && item.source ? (
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">· {item.source}</span>
      ) : null}
    </div>
  );
}
