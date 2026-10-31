import { Link } from "react-router-dom";
import FanDisclaimer from "../../components/FanDisclaimer";
import Panel from "../../components/Panel";
import { COPYRIGHT_LINE } from "../../config";
import { DOC_IDS, REQUIRED_DOCS } from "../../legal/legalText";
import { formatDocDate, useLegal } from "../../legal/useLegal";
import { useSettingsStore } from "../../store/useSettingsStore";

const linkClass = "hud-label text-cyan hover:underline";

/** Settings → Legal & Licenses: documents, what the user accepted and when, licenses, disclaimer. */
export default function LegalPanel() {
  const { docs } = useLegal();
  const accepted = useSettingsStore((state) => state.legal);

  return (
    <Panel title="Legal & Licenses">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-8">
        <ul>
          {DOC_IDS.map((id) => (
            <li key={id} className="flex min-h-11 items-center justify-between gap-4 border-b border-line">
              <span className="text-[15px] text-text">{docs[id].title}</span>
              <span className="flex items-center gap-5">
                <span className="font-mono text-[12px] text-muted">
                  v{docs[id].version} · {formatDocDate(docs[id].updatedAt)}
                </span>
                <Link to={`/legal/${id}`} className={linkClass}>
                  Read →
                </Link>
              </span>
            </li>
          ))}
          <li className="flex min-h-11 items-center justify-between gap-4">
            <span className="text-[15px] text-text">Open-source licenses</span>
            <Link to="/legal/licenses" className={linkClass}>
              View →
            </Link>
          </li>
        </ul>

        <div>
          <p className="hud-label text-muted">Your acceptance</p>
          {accepted ? (
            <p className="mt-2 text-[14px] text-text-2">
              18+ confirmed ·{" "}
              {REQUIRED_DOCS.map((id) => `${docs[id].title} v${accepted.accepted[id]}`).join(" · ")}
              <br />
              Accepted {new Date(accepted.acceptedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          ) : (
            <p className="mt-2 text-[14px] text-text-2">Not accepted yet.</p>
          )}
          <FanDisclaimer variant="block" className="mt-5" />
          <p className="mt-4 font-mono text-[11px] text-muted">{COPYRIGHT_LINE}</p>
        </div>
      </div>
    </Panel>
  );
}
