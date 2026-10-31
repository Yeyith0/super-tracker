import { useState } from "react";
import HudButton from "../../components/HudButton";
import HudSelect from "../../components/HudSelect";
import Panel from "../../components/Panel";
import ProgressBar from "../../components/ProgressBar";
import { APP_VERSION, GITHUB_REPO } from "../../config";
import { useContentStore } from "../../content/useContentStore";
import { timeAgo } from "../../lib/time";
import { useSettingsStore } from "../../store/useSettingsStore";
import { checkAllNow } from "../../update/useBackgroundSync";
import { installNow } from "../../update/updater";
import { useUpdateStore } from "../../update/useUpdateStore";

const INTERVALS = [1, 3, 6, 12].map((hours) => ({ id: String(hours), label: hours === 1 ? "1 hour" : `${hours} hours` }));

function statusText({ status, available, error }) {
  switch (status) {
    case "checking":
      return "Checking GitHub releases…";
    case "downloading":
      return `v${available?.version} available (you have v${APP_VERSION}) · downloading`;
    case "ready":
      return `v${available?.version} downloaded · restart to install`;
    case "installing":
      return `Installing v${available?.version}…`;
    case "up-to-date":
      return `Up to date (v${APP_VERSION})`;
    case "dev":
      return `v${available?.version} available (you have v${APP_VERSION}) · development builds do not install updates`;
    case "unavailable":
      return "Updates work only in the installed desktop app";
    case "error":
      return `Check failed: ${error}`;
    default:
      return `You have v${APP_VERSION}`;
  }
}

/** Settings → App Update Checker (design/08-settings.png): version, last check, Check now, progress, content. */
export default function UpdatePanel() {
  const update = useUpdateStore();
  const content = useContentStore();
  const checkHours = useSettingsStore((state) => state.checkHours);
  const setCheckHours = useSettingsStore((state) => state.setCheckHours);
  const [checking, setChecking] = useState(false);

  const checkNow = async () => {
    setChecking(true);
    await checkAllNow();
    setChecking(false);
  };

  return (
    <Panel title="App Update Checker">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,320px)_auto] items-end gap-4">
        <div>
          <p className="mb-2 text-[14px] text-text-2">GitHub repository</p>
          <p className="flex min-h-11 items-center border border-line-strong bg-inset px-3.5 font-mono text-[14px] text-text-2">
            {GITHUB_REPO}
          </p>
        </div>
        <div>
          <label htmlFor="check-every" className="mb-2 block text-[14px] text-text-2">
            Check every
          </label>
          <HudSelect id="check-every" options={INTERVALS} value={String(checkHours)} onChange={(v) => setCheckHours(Number(v))} />
        </div>
        <HudButton onClick={checkNow} disabled={checking}>
          {checking ? "Checking…" : "Check now"}
        </HudButton>
      </div>

      <p className="mt-4 font-mono text-[13px] text-accent-2">
        Last check {timeAgo(update.lastCheckAt)} · {statusText(update)}
      </p>

      {update.status === "downloading" ? (
        <ProgressBar value={update.progress ?? 0} tone="accent-2" label="Update download" className="mt-3" />
      ) : null}
      {update.status === "ready" ? (
        <HudButton variant="warning" size="sm" className="mt-3" onClick={installNow}>
          Restart now
        </HudButton>
      ) : null}

      <div className="mt-5 border-t border-line pt-4 font-mono text-[12px] text-muted">
        <p>
          Content:{" "}
          {Object.entries(content.files)
            .map(([name, file]) => `${name} v${file.data.contentVersion} (${file.source})`)
            .join(" · ")}{" "}
          · checked {timeAgo(content.lastCheckAt)}
        </p>
        {content.lastError ? <p className="mt-1">Last content check: {content.lastError}</p> : null}
        {update.policy ? <p className="mt-1">Minimum supported version: v{update.policy.minimum}</p> : null}
      </div>
    </Panel>
  );
}
