import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import TabPage from "./components/layout/TabPage";
import { LEGAL_TAB, SETTINGS_TAB, TABS } from "./tabs/tabs";
import HomeTab from "./tabs/Home/HomeTab";
import DivergramTab from "./tabs/Divergram/DivergramTab";
// Loaded on first visit: the Arsenal brings in the chart library.
const ArsenalTab = lazy(() => import("./tabs/Arsenal/ArsenalTab"));
import LoadoutTab from "./tabs/Loadout/LoadoutTab";
import TreasonTab from "./tabs/Treason/TreasonTab";
import EnemiesTab from "./tabs/Enemies/EnemiesTab";
import SeafTab from "./tabs/Seaf/SeafTab";
import SettingsTab from "./tabs/Settings/SettingsTab";
import LegalTab from "./tabs/Legal/LegalTab";

// Dev-only component bench; the dynamic import keeps it out of release builds.
const ComponentBench = import.meta.env.DEV ? lazy(() => import("./dev/ComponentBench")) : null;

const TAB_COMPONENTS = {
  home: HomeTab,
  divergram: DivergramTab,
  arsenal: ArsenalTab,
  loadout: LoadoutTab,
  treason: TreasonTab,
  enemies: EnemiesTab,
  seaf: SeafTab,
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/home" replace />} />
          {TABS.map((tab) => (
            <Route
              key={tab.id}
              path={`${tab.id}/:subtab?`}
              element={<TabPage tab={tab} component={TAB_COMPONENTS[tab.id]} />}
            />
          ))}
          <Route path={SETTINGS_TAB.id} element={<TabPage tab={SETTINGS_TAB} component={SettingsTab} />} />
          <Route path={`${LEGAL_TAB.id}/:subtab?`} element={<TabPage tab={LEGAL_TAB} component={LegalTab} />} />
          {ComponentBench ? (
            <Route
              path="dev/components"
              element={
                <Suspense fallback={null}>
                  <ComponentBench />
                </Suspense>
              }
            />
          ) : null}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
