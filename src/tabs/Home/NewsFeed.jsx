import { useState } from "react";
import { Link } from "react-router-dom";
import Chip from "../../components/Chip";
import CornerBrackets from "../../components/CornerBrackets";
import EmptyState from "../../components/EmptyState";
import ImageWithFallback from "../../components/ImageWithFallback";
import Panel from "../../components/Panel";
import { useNow } from "../../lib/useNow";
import { filterNews } from "./homeData";
import NewsTags from "./NewsTags";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "official", label: "Official" },
  { id: "broadcasts", label: "Broadcasts" },
];

function RelatedLink({ itemId }) {
  return (
    <Link to={`/arsenal?item=${itemId}`} className="hud-label mt-4 inline-block text-cyan hover:underline">
      View in Arsenal →
    </Link>
  );
}

/** In-universe parody ad (format "ad"): framed card, always fully shown. */
function AdCard({ item, now }) {
  return (
    <li id={`news-${item.id}`} className="border-b border-line py-4 last:border-b-0">
      <article className="relative border border-line-strong bg-warn-fill/40 p-5">
        <CornerBrackets size={18} thickness={2} className="border-accent-2" />
        <NewsTags item={item} now={now} />
        <div className={`mt-3 grid gap-5 ${item.image ? "grid-cols-[minmax(0,1fr)_220px]" : ""}`}>
          <div>
            <p className="hud-label text-accent-2">{item.source}</p>
            <h3 className="mt-1 text-[21px] font-bold uppercase leading-tight tracking-[0.04em] text-text">{item.title}</h3>
            <p className="mt-2 max-w-[80ch] text-[15px] leading-relaxed text-text-2">{item.body}</p>
          </div>
          {item.image ? (
            <ImageWithFallback src={item.image} alt={item.title} label={item.source} className="h-full min-h-32 w-full border border-line" />
          ) : null}
        </div>
      </article>
    </li>
  );
}

function NewsItem({ item, open, onToggle, now }) {
  if (item.format === "ad") return <AdCard item={item} now={now} />;

  return (
    <li id={`news-${item.id}`} className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="hud-transition -mx-3 block w-[calc(100%+24px)] px-3 py-4 text-left transition-colors hover:bg-inset"
      >
        <NewsTags item={item} now={now} showSource />
        <h3 className="mt-2 text-[17px] font-semibold leading-snug text-text">{item.title}</h3>
        {!open ? <p className="mt-1 line-clamp-1 text-[14px] text-muted">{item.body}</p> : null}
      </button>
      {open ? (
        <div className="pb-5">
          <p className="max-w-[80ch] text-[15px] leading-relaxed text-text-2">{item.body}</p>
          {item.image ? (
            <ImageWithFallback src={item.image} alt={item.title} label={item.source ?? "News image"} className="mt-4 aspect-[16/7] w-full max-w-2xl border border-line" />
          ) : null}
          {item.relatedItem ? <RelatedLink itemId={item.relatedItem} /> : null}
          {item.sample ? <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Sample data</p> : null}
        </div>
      ) : null}
    </li>
  );
}

/** Full feed: official news and Super Earth Broadcasts, newest first, filterable, click to expand. */
export default function NewsFeed({ items, openId, onToggle }) {
  const [filter, setFilter] = useState("all");
  const now = useNow(60000);
  const shown = filterNews(items, filter);

  return (
    <Panel
      id="news-feed"
      title="All transmissions"
      actions={
        <div className="flex gap-1.5" role="group" aria-label="Filter news">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
      }
    >
      {shown.length ? (
        <ul>
          {shown.map((item) => (
            <NewsItem key={item.id} item={item} now={now} open={openId === item.id} onToggle={() => onToggle(item.id)} />
          ))}
        </ul>
      ) : (
        <EmptyState code="No transmissions" title="Nothing to show for this filter" />
      )}
    </Panel>
  );
}
