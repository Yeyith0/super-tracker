import FanDisclaimer from "./FanDisclaimer";
import Panel from "./Panel";

/** Screen for a tab whose feature flag is off (content/features.json). No phase numbers on purpose. */
export default function FeatureClosed({ tab }) {
  return (
    <div className="px-8 pb-10 pt-8">
      <Panel brackets className="px-10 py-14 text-center">
        <p className="hud-label text-text-2">
          {tab.number} // {tab.breadcrumb}
        </p>
        <h1 className="mt-3 text-[34px] font-bold uppercase leading-tight tracking-[0.04em] text-accent">
          {tab.title} <span className="text-text-2">// Under construction</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-text-2">{tab.closedText}</p>
        <div className="hud-stripes mx-auto mt-8 flex h-40 max-w-3xl items-center justify-center border border-line">
          <span className="hud-label text-text-2">[Stand by for deployment]</span>
        </div>
        <FanDisclaimer className="mt-8" />
      </Panel>
    </div>
  );
}
