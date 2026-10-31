import { Link } from "react-router-dom";
import FanDisclaimer from "../../components/FanDisclaimer";
import Panel from "../../components/Panel";
import { COPYRIGHT_LINE } from "../../config";
import Markdown from "../../legal/Markdown";
import { REQUIRED_DOCS } from "../../legal/legalText";
import { formatDocDate, useLegal } from "../../legal/useLegal";
import { useSettingsStore } from "../../store/useSettingsStore";
import LicensesList from "./LicensesList";

function AcceptancePanel({ doc }) {
  const accepted = useSettingsStore((state) => state.legal);
  const required = REQUIRED_DOCS.includes(doc.id);
  const acceptedVersion = accepted?.accepted?.[doc.id];

  return (
    <Panel title="Status">
      <p className="text-[14px] text-text-2">
        Version <span className="font-mono text-text">{doc.version}</span> · updated {formatDocDate(doc.updatedAt)}
      </p>
      <p className="mt-2 text-[14px] text-text-2">
        {required
          ? acceptedVersion
            ? `You accepted version ${acceptedVersion} on ${new Date(accepted.acceptedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}.`
            : "Not accepted yet."
          : "For your information; no acceptance needed."}
      </p>
    </Panel>
  );
}

/** Legal reader: one document per inner tab, plus the open-source license list. */
export default function LegalTab({ subtab }) {
  const { docs } = useLegal();

  if (subtab.id === "licenses") return <LicensesList />;

  const doc = docs[subtab.id];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6">
      <Panel accentTop className="px-8 py-7">
        <Markdown source={doc.source} />
      </Panel>
      <aside className="space-y-5">
        <AcceptancePanel doc={doc} />
        <Panel title="Super Tracker">
          <FanDisclaimer variant="block" />
          <p className="mt-4 font-mono text-[11px] text-muted">{COPYRIGHT_LINE}</p>
          <Link to="/settings" className="hud-label mt-4 inline-block text-cyan hover:underline">
            ← Back to settings
          </Link>
        </Panel>
      </aside>
    </div>
  );
}
