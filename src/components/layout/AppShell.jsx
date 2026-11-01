import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isExternalHref, openExternal } from "../../lib/tauri";
import { useSettingsStore } from "../../store/useSettingsStore";
import FirstRunScreen from "../../legal/FirstRunScreen";
import { needsLegalAcceptance } from "../../legal/legalText";
import { useLegal } from "../../legal/useLegal";
import { useBackgroundSync } from "../../update/useBackgroundSync";
import { InstallingScreen, UpdateRequiredScreen } from "../../update/UpdateScreens";
import { useUpdateStore } from "../../update/useUpdateStore";
import HudToaster from "../HudToast";
import Sidebar from "./Sidebar";
import TitleBar from "./TitleBar";

// Any <a href="https://..."> in the app opens in the default browser instead of navigating the window.
function useExternalLinks() {
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button > 1) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || !isExternalHref(anchor.href)) return;
      event.preventDefault();
      openExternal(anchor.href);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, []);
}

// Release builds hide the browser context menu (Back / Reload / Print) except in text fields.
function useDesktopContextMenu() {
  useEffect(() => {
    if (import.meta.env.DEV) return undefined;
    const onContextMenu = (event) => {
      if (!event.target.closest?.("input, textarea, [contenteditable='true']")) event.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);
}

export default function AppShell() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  const { docs } = useLegal();
  const accepted = useSettingsStore((state) => state.legal);
  // Until 18+ and the current Terms / Guidelines / Roleplay versions are accepted, only the first-run screen shows.
  const gated = needsLegalAcceptance(accepted, docs);
  const policyBlocked = useUpdateStore((state) => state.policyBlocked);
  const installing = useUpdateStore((state) => state.status === "installing");

  useExternalLinks();
  useDesktopContextMenu();
  useBackgroundSync();

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      {/* Priority: version lock > installing an update > first-run legal screen > the app. */}
      {policyBlocked ? (
        <UpdateRequiredScreen />
      ) : installing ? (
        <InstallingScreen />
      ) : gated ? (
        <FirstRunScreen />
      ) : (
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          {/* relative: absolutely positioned children (sr-only labels) stay inside the scroll area. */}
          <main ref={mainRef} className="hud-bg relative min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      )}
      <HudToaster />
    </div>
  );
}
