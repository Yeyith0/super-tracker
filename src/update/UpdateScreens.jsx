import { getCurrentWindow } from "@tauri-apps/api/window";
import CornerBrackets from "../components/CornerBrackets";
import ExternalLink from "../components/ExternalLink";
import FanDisclaimer from "../components/FanDisclaimer";
import HudAlert from "../components/HudAlert";
import HudButton from "../components/HudButton";
import ProgressBar from "../components/ProgressBar";
import { APP_VERSION, RELEASES_URL } from "../config";
import { inTauri } from "../lib/tauri";
import { installRequiredUpdate } from "./updater";
import { useUpdateStore } from "./useUpdateStore";

function Frame({ label, title, titleClass = "text-accent", children }) {
  return (
    <div className="hud-bg flex min-h-0 flex-1 overflow-y-auto">
      <div className="m-auto w-full max-w-[680px] px-8 py-10">
        <section className="relative border border-line-strong bg-panel p-8">
          <CornerBrackets className={titleClass === "text-accent" ? "border-accent" : "border-danger"} />
          <p className="hud-label text-text-2">{label}</p>
          <h1 className={`mt-2 text-[34px] font-bold uppercase leading-none tracking-[0.04em] ${titleClass}`}>{title}</h1>
          {children}
        </section>
        <FanDisclaimer className="mt-5 text-center" />
      </div>
    </div>
  );
}

function DownloadProgress() {
  const { status, progress } = useUpdateStore();
  if (status !== "downloading" && status !== "installing") return null;
  return (
    <div className="mt-6">
      <p className="hud-label mb-2 text-accent-2">
        {status === "installing" ? "Installing…" : `Downloading${progress != null ? ` ${progress}%` : "…"}`}
      </p>
      <ProgressBar value={status === "installing" ? 100 : (progress ?? 0)} tone="accent-2" label="Update download" />
    </div>
  );
}

/** Full-screen block while the running version is below version-policy.json "minimum". */
export function UpdateRequiredScreen() {
  const { policy, status, error, available } = useUpdateStore();
  const busy = ["checking", "downloading", "installing"].includes(status);

  return (
    <Frame label="System // Version lock" title="Update required" titleClass="text-danger-text">
      <p className="mt-4 text-[15px] leading-relaxed text-text-2">
        This version (v{APP_VERSION}) can no longer be used. Install version v{policy?.minimum}
        {available ? ` (latest: v${available.version})` : ""} or newer to continue.
      </p>
      {policy?.message ? (
        <HudAlert label="Message from High Command" className="mt-5">
          {policy.message}
        </HudAlert>
      ) : null}
      <DownloadProgress />
      {error ? <p className="mt-4 text-[14px] text-danger-text">{error}</p> : null}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <HudButton variant="secondary" onClick={() => inTauri() && getCurrentWindow().close().catch(() => {})}>
          Exit
        </HudButton>
        <div className="flex items-center gap-5">
          <ExternalLink href={RELEASES_URL}>Download page</ExternalLink>
          <HudButton disabled={busy} onClick={installRequiredUpdate} className="min-w-[220px]">
            {busy ? "Updating…" : "Install update"}
          </HudButton>
        </div>
      </div>
    </Frame>
  );
}

/** Shown while a postponed update installs on launch; the installer then restarts the app. */
export function InstallingScreen() {
  const available = useUpdateStore((state) => state.available);
  return (
    <Frame label="System // Update" title="Installing update">
      <p className="mt-4 text-[15px] text-text-2">
        Installing v{available?.version}. Super Tracker restarts by itself when it is done.
      </p>
      <DownloadProgress />
    </Frame>
  );
}
