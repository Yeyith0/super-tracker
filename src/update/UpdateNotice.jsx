import HudButton from "../components/HudButton";
import { IconWarning } from "../components/icons";
import { installNow } from "./updater";
import { useUpdateStore } from "./useUpdateStore";

/** Amber update box for the Home top bar (design/01-home.png): downloading, then ready with Restart. */
export default function UpdateNotice() {
  const { status, available, progress } = useUpdateStore();
  if (!available || (status !== "downloading" && status !== "ready")) return null;

  return (
    <div role="status" className="flex items-center gap-5 border border-accent-2 bg-warn-fill py-2 pl-4 pr-2">
      <span className="hud-label flex items-center gap-2 text-accent-2">
        <IconWarning className="h-3 w-3" />
        {status === "ready" ? "Update ready" : "Update available"}
      </span>
      <span className="text-[14px] text-text">
        v{available.version} {status === "ready" ? "downloaded from GitHub releases" : `downloading${progress != null ? ` ${progress}%` : "…"}`}
      </span>
      {status === "ready" ? (
        <HudButton variant="warning" onClick={installNow}>
          Restart
        </HudButton>
      ) : null}
    </div>
  );
}
