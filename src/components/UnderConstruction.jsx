import Panel from "./Panel";

/** Placeholder body for tabs whose content arrives in a later phase. */
export default function UnderConstruction({ tab, subtab }) {
  return (
    <Panel accentTop>
      <p className="hud-label text-accent-2">
        {tab.number} // {tab.label}
        {subtab ? ` // ${subtab.label}` : ""}
      </p>
      <h2 className="mt-2 text-[26px] font-bold uppercase tracking-[0.06em] text-text">Tab under construction</h2>
      <p className="mt-2 max-w-2xl text-text-2">
        This module deploys in Phase {tab.phase}. Navigation, header and inner tabs are already live.
      </p>
      <div className="hud-stripes mt-5 flex h-28 items-center justify-center border border-line">
        <span className="hud-label text-text-2">[Awaiting deployment]</span>
      </div>
    </Panel>
  );
}
