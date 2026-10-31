import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Checkbox from "../components/Checkbox";
import CornerBrackets from "../components/CornerBrackets";
import FanDisclaimer from "../components/FanDisclaimer";
import HudAlert from "../components/HudAlert";
import HudButton from "../components/HudButton";
import { useSettingsStore } from "../store/useSettingsStore";
import { COPYRIGHT_LINE } from "../config";
import { inTauri } from "../lib/tauri";
import DocumentModal from "./DocumentModal";
import { changedDocs, requiredVersions } from "./legalText";
import { useLegal } from "./useLegal";

const SUMMARY = [
  {
    code: "01",
    title: "Unofficial fan app",
    doc: "notices",
    text: (legal) => legal.disclaimer,
  },
  {
    code: "02",
    title: "Roleplay only",
    doc: "roleplay",
    text: () =>
      "Treason cases, verdicts and traitor labels are Super Earth satire about gameplay, never real accusations. Do not harass, stalk or grief anyone.",
  },
  {
    code: "03",
    title: "Community rules",
    doc: "guidelines",
    text: () => "No harassment, no personal data, no cheats. Share only screenshots and clips you are allowed to share.",
  },
];

const DOC_LINKS = ["terms", "privacy", "guidelines", "roleplay"];

/**
 * "BEFORE YOU DEPLOY": full-window screen shown before the app until the user confirms 18+ and accepts
 * the Terms of Use and Community Guidelines (again whenever a required document version increases).
 */
export default function FirstRunScreen() {
  const legal = useLegal();
  const accepted = useSettingsStore((state) => state.legal);
  const acceptLegal = useSettingsStore((state) => state.acceptLegal);
  const [adult, setAdult] = useState(Boolean(accepted?.ageConfirmed));
  const [agreed, setAgreed] = useState(false);
  const [openDoc, setOpenDoc] = useState(null);

  const changed = accepted ? changedDocs(accepted, legal.docs) : [];
  const ready = adult && agreed;

  const exit = () => {
    if (inTauri()) getCurrentWindow().close().catch(() => {});
  };

  return (
    <div className="hud-bg flex min-h-0 flex-1 overflow-y-auto">
      <div className="m-auto w-full max-w-[940px] px-8 py-10">
        <section aria-labelledby="first-run-title" className="relative border border-line-strong bg-panel p-8">
          <CornerBrackets />
          <p className="hud-label text-text-2">Super Earth // Enlistment terminal</p>
          <h1 id="first-run-title" className="mt-2 text-[34px] font-bold uppercase leading-none tracking-[0.04em] text-accent">
            Before you deploy
          </h1>

          {changed.length ? (
            <HudAlert label="Terms updated" className="mt-5">
              {changed.map((id) => legal.docs[id].title).join(", ")} changed. Review and accept the new version to continue.
            </HudAlert>
          ) : (
            <p className="mt-3 text-text-2">Super Tracker is a free companion app made by a fan. Three things to know before you enlist:</p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4">
            {SUMMARY.map((item) => (
              <div key={item.code} className="flex flex-col border border-line bg-inset p-4">
                <p className="font-mono text-[12px] text-accent">{item.code}</p>
                <h2 className="mt-1 text-[16px] font-bold uppercase tracking-[0.08em] text-text">{item.title}</h2>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-text-2">{item.text(legal)}</p>
                <button
                  type="button"
                  onClick={() => setOpenDoc(item.doc)}
                  className="hud-label mt-3 self-start text-cyan hover:underline"
                >
                  Read more →
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="hud-label text-muted">Full texts</span>
            {DOC_LINKS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setOpenDoc(id)}
                className="text-[14px] text-cyan underline-offset-4 hover:underline"
              >
                {legal.docs[id].title}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <Checkbox checked={adult} onChange={setAdult} label="I am 18 or older" />
            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              label="I accept the Terms of Use and Community Guidelines"
              description="This includes the Treason roleplay rules."
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <HudButton variant="secondary" onClick={exit}>
              Exit
            </HudButton>
            <HudButton disabled={!ready} onClick={() => acceptLegal(requiredVersions(legal.docs))} className="min-w-[220px]">
              Enlist
            </HudButton>
          </div>
        </section>

        <div className="mt-5 space-y-1 text-center">
          <FanDisclaimer />
          <p className="font-mono text-[11px] text-muted">{COPYRIGHT_LINE}</p>
        </div>
      </div>

      <DocumentModal docId={openDoc} onChange={setOpenDoc} onClose={() => setOpenDoc(null)} />
    </div>
  );
}
