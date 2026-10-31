// Navigation model: sidebar items, page headers and inner tabs (routes are #/<tab>/<subtab>).
// `phase` is the PROMPTS.md phase that builds the tab's real content.

export const TABS = [
  {
    id: "home",
    number: "01",
    label: "Home",
    breadcrumb: "Command Deck",
    title: "Home",
    header: "profile",
    phase: 4,
    subtabs: [
      { id: "galactic-news", label: "Galactic News" },
      { id: "major-orders", label: "Major Orders" },
      { id: "balance-tracker", label: "Balance Tracker" },
      { id: "bounty-board", label: "Bounty Board" },
    ],
  },
  {
    id: "divergram",
    number: "02",
    label: "Divergram",
    breadcrumb: "Social Feed",
    title: "Divergram",
    phase: 17,
    // Closed for players until content/features.json switches it on (Phase 3 feature flags).
    feature: "divergram",
    closedText: "Super Earth's social network is being built. Stand by for deployment.",
    subtabs: [
      { id: "hot", label: "Hot" },
      { id: "new", label: "New" },
      { id: "clips", label: "Clips" },
      { id: "opinions", label: "Opinions" },
    ],
  },
  {
    id: "arsenal",
    number: "03",
    label: "Arsenal",
    breadcrumb: "Armory Catalog",
    title: "Arsenal & Compare",
    phase: 5,
    subtabs: [
      { id: "primary", label: "Primary" },
      { id: "secondary", label: "Secondary" },
      { id: "support", label: "Support" },
      { id: "grenades", label: "Grenades" },
      { id: "stratagems", label: "Stratagems" },
    ],
  },
  {
    id: "loadout",
    number: "04",
    label: "Loadout",
    breadcrumb: "Loadout Bay",
    title: "Loadouts",
    phase: 6,
    subtabs: [
      { id: "browse", label: "Browse" },
      { id: "favorites", label: "Favorites" },
      { id: "create", label: "Create" },
    ],
  },
  {
    id: "treason",
    number: "05",
    label: "Treason",
    breadcrumb: "Community Court",
    title: "Treason",
    titleTone: "danger",
    phase: 7,
    subtabs: [
      { id: "cases", label: "Cases" },
      { id: "submit", label: "Submit a Case" },
    ],
  },
  {
    id: "enemies",
    number: "06",
    label: "Enemies",
    breadcrumb: "Tactical Bestiary",
    title: "Enemies",
    phase: 8,
    subtabs: [
      { id: "automatons", label: "Automatons", tone: "danger" },
      { id: "terminids", label: "Terminids", tone: "accent-2" },
      { id: "illuminates", label: "Illuminates", tone: "cyan" },
    ],
  },
  {
    id: "seaf",
    number: "07",
    label: "SEAF",
    breadcrumb: "Companion Link",
    title: "SEAF",
    phase: 11,
    subtabs: [],
  },
];

export const SETTINGS_TAB = {
  id: "settings",
  number: "SYS",
  label: "Settings",
  breadcrumb: "Configuration",
  title: "Settings",
  subtabs: [],
};

// Legal reader (#/legal/<doc>), opened from Settings → Legal & Licenses; not in the sidebar.
export const LEGAL_TAB = {
  id: "legal",
  number: "SYS",
  label: "Legal",
  breadcrumb: "Legal",
  title: "Legal & Licenses",
  subtabs: [
    { id: "terms", label: "Terms" },
    { id: "privacy", label: "Privacy" },
    { id: "guidelines", label: "Guidelines" },
    { id: "roleplay", label: "Roleplay" },
    { id: "notices", label: "Notices" },
    { id: "licenses", label: "Licenses" },
  ],
};

export const tabPath = (tab, subtabId) => (subtabId ? `/${tab.id}/${subtabId}` : `/${tab.id}`);
