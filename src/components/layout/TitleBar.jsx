import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { inTauri } from "../../lib/tauri";
import { APP_NAME } from "../../config";
import { IconClose, IconMaximize, IconMinimize, IconRestore } from "../icons";

function WindowButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`hud-transition inline-flex h-full w-[46px] items-center justify-center text-text-2 transition-colors ${
        danger ? "hover:bg-danger hover:text-on-accent" : "hover:bg-panel hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

/** Custom HUD title bar (the window has decorations: false). Drag anywhere on the bar; double-click maximizes. */
export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const desktop = inTauri();

  useEffect(() => {
    if (!desktop) return undefined;
    const win = getCurrentWindow();
    const sync = () => win.isMaximized().then(setMaximized).catch(() => {});
    sync();
    const unlisten = win.onResized(sync);
    return () => {
      unlisten.then((stop) => stop());
    };
  }, [desktop]);

  const run = (action) => () => {
    if (desktop) getCurrentWindow()[action]().catch(() => {});
  };

  return (
    <header data-tauri-drag-region className="flex h-8 shrink-0 select-none items-center border-b border-line bg-sidebar">
      <div data-tauri-drag-region className="flex h-full flex-1 items-center gap-2.5 px-3.5">
        <span aria-hidden="true" className="pointer-events-none h-2 w-2 bg-accent" />
        <span className="hud-label pointer-events-none text-[10px] text-text-2">
          {APP_NAME} <span className="text-muted">// Helldivers 2 companion</span>
        </span>
      </div>
      <div className="flex h-full">
        <WindowButton label="Minimize" onClick={run("minimize")}>
          <IconMinimize className="h-2.5 w-2.5" />
        </WindowButton>
        <WindowButton label={maximized ? "Restore" : "Maximize"} onClick={run("toggleMaximize")}>
          {maximized ? <IconRestore className="h-2.5 w-2.5" /> : <IconMaximize className="h-2.5 w-2.5" />}
        </WindowButton>
        <WindowButton label="Close" danger onClick={run("close")}>
          <IconClose className="h-2.5 w-2.5" />
        </WindowButton>
      </div>
    </header>
  );
}
