import Modal from "../components/Modal";
import HudButton from "../components/HudButton";
import Markdown from "./Markdown";
import { formatDocDate, useLegal } from "./useLegal";

/** Shows one legal document in a modal; links to other documents switch the modal content. */
export default function DocumentModal({ docId, onChange, onClose }) {
  const { docs } = useLegal();
  const doc = docId ? docs[docId] : null;

  const navigate = (path) => {
    const target = path.replace(/^\/legal\//, "");
    if (docs[target]) onChange(target);
  };

  return (
    <Modal
      open={Boolean(doc)}
      onClose={onClose}
      title={doc?.title ?? ""}
      width={760}
      footer={<HudButton onClick={onClose}>Close</HudButton>}
    >
      {doc ? (
        <>
          <p className="hud-label mb-4 text-muted">
            Version {doc.version} · updated {formatDocDate(doc.updatedAt)}
          </p>
          <Markdown source={doc.source} onNavigate={navigate} skipTitle />
        </>
      ) : null}
    </Modal>
  );
}
