import { NavLink, useLocation } from "react-router-dom";
import { TABS, SETTINGS_TAB } from "../../tabs/tabs";
import { APP_VERSION } from "../../config";
import { IconGear } from "../icons";

// Below the xl breakpoint (1280px window width) the sidebar collapses to numbers only.
const itemClass = ({ isActive }) =>
  `hud-transition flex h-11 items-center justify-center gap-3.5 px-3 uppercase transition-colors xl:justify-start ${
    isActive ? "bg-accent text-on-accent" : "text-text hover:bg-panel"
  }`;

function Brand() {
  return (
    <div className="px-2 pb-5 pt-6 text-center xl:px-6 xl:text-left">
      <p className="hud-label hidden text-[10px] tracking-[0.24em] text-text-2 xl:block">
        Companion // <span className="normal-case">v{APP_VERSION}</span>
      </p>
      <p className="mt-1.5 hidden text-[28px] font-bold uppercase leading-[0.98] tracking-[0.02em] text-accent xl:block">
        Super
        <br />
        Tracker
      </p>
      <p className="text-[22px] font-bold leading-none text-accent xl:hidden" aria-hidden="true">
        ST
      </p>
      <p className="hud-label mt-1.5 text-[9px] normal-case tracking-[0.1em] text-text-2 xl:hidden">v{APP_VERSION}</p>
      <span className="sr-only xl:hidden">Super Tracker</span>
    </div>
  );
}

export default function Sidebar() {
  // The legal reader is part of Settings, so Settings stays highlighted there.
  const inLegal = useLocation().pathname.startsWith("/legal");
  const settingsClass = ({ isActive }) => itemClass({ isActive: isActive || inLegal });

  return (
    <aside className="flex w-[72px] shrink-0 flex-col overflow-y-auto border-r-2 border-accent bg-sidebar xl:w-[220px]">
      <Brand />
      <div className="mx-3.5 border-t border-line" />
      <nav aria-label="Main" className="px-3.5 pt-4">
        <ul className="space-y-1">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <NavLink to={`/${tab.id}`} className={itemClass} title={tab.label}>
                {({ isActive }) => (
                  <>
                    <span className={`font-mono text-[12px] tracking-[0.08em] ${isActive ? "font-semibold" : "text-muted"}`}>
                      {tab.number}
                    </span>
                    <span
                      className={`hidden text-[15px] tracking-[0.14em] xl:inline ${isActive ? "font-bold" : "font-semibold"}`}
                    >
                      {tab.label}
                    </span>
                    <span className="sr-only xl:hidden">{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mx-3.5 mt-7 border-t border-line" />
      <div className="px-3.5 pb-6">
        <NavLink to={`/${SETTINGS_TAB.id}`} className={settingsClass} title={SETTINGS_TAB.label}>
          {({ isActive: onSettings }) => {
            const isActive = onSettings || inLegal;
            return (
              <>
                <IconGear className={`h-3 w-3 ${isActive ? "" : "text-text-2"}`} />
                <span
                  className={`hidden text-[14px] tracking-[0.14em] xl:inline ${isActive ? "font-bold" : "font-semibold text-text-2"}`}
                >
                  {SETTINGS_TAB.label}
                </span>
                <span className="sr-only xl:hidden">{SETTINGS_TAB.label}</span>
              </>
            );
          }}
        </NavLink>
      </div>
    </aside>
  );
}
