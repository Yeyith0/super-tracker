import { useState } from "react";
import Badge from "../components/Badge";
import Checkbox from "../components/Checkbox";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import ExternalLink from "../components/ExternalLink";
import FanDisclaimer from "../components/FanDisclaimer";
import RoleplayNotice from "../components/RoleplayNotice";
import FilterPanel from "../components/FilterPanel";
import HudAlert from "../components/HudAlert";
import HudButton from "../components/HudButton";
import ImageWithFallback from "../components/ImageWithFallback";
import Modal from "../components/Modal";
import Panel from "../components/Panel";
import PatchArrow from "../components/PatchArrow";
import ProgressBar from "../components/ProgressBar";
import StarToggle from "../components/StarToggle";
import SubTabs from "../components/SubTabs";
import { toast } from "../store/useToastStore";

// Dev-only page (#/dev/components) showing every shared component. Not included in release builds.
const CATEGORIES = [
  { id: "meta", label: "Meta" },
  { id: "off-meta", label: "Off-Meta" },
  { id: "experimental", label: "Experimental" },
  { id: "fun", label: "Fun" },
];
const SORTS = [
  { id: "liked", label: "Most Liked" },
  { id: "date", label: "Date" },
  { id: "viewed", label: "Most Viewed" },
];

export default function ComponentBench() {
  const [filters, setFilters] = useState(["meta"]);
  const [sort, setSort] = useState("liked");
  const [starred, setStarred] = useState(true);
  const [tab, setTab] = useState("one");
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-6 px-8 pb-10 pt-7">
      <header>
        <p className="hud-label text-text-2">Dev // Component bench</p>
        <h1 className="mt-2 text-[30px] font-bold uppercase tracking-[0.04em] text-accent">Shared components</h1>
      </header>

      <div className="grid grid-cols-3 gap-5">
        <Panel title="Buttons">
          <div className="flex flex-wrap gap-2">
            <HudButton>Deploy</HudButton>
            <HudButton variant="secondary">Secondary</HudButton>
            <HudButton variant="danger">Vote guilty</HudButton>
            <HudButton size="sm" variant="secondary">Small</HudButton>
            <HudButton disabled>Disabled</HudButton>
          </div>
        </Panel>
        <Panel title="Badges & patch arrows">
          <div className="flex flex-wrap gap-2">
            <Badge tone="danger">Breaking</Badge>
            <Badge tone="cyan">Patch</Badge>
            <Badge tone="amber">Event</Badge>
            <Badge tone="outline">Under jury review</Badge>
            <Badge>Diff 5+</Badge>
          </div>
          <div className="mt-4 flex gap-6">
            <PatchArrow status="buff" />
            <PatchArrow status="nerf" />
            <PatchArrow status="none" />
            <PatchArrow status="buff" showLabel={false} />
          </div>
        </Panel>
        <Panel title="Progress">
          <ProgressBar value={100} tone="buff" label="Varn Prime" />
          <ProgressBar value={64.2} label="Osk-IV" className="mt-3" />
          <ProgressBar value={12.8} tone="danger" label="Talmerra" className="mt-3" />
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Panel title="Chips & sub tabs">
          <div className="flex flex-wrap gap-1.5">
            <Chip active>Open</Chip>
            <Chip>Griefing</Chip>
            <Chip>Cheating</Chip>
          </div>
          <SubTabs
            className="mt-4"
            label="Demo tabs"
            tabs={[
              { id: "one", label: "Browse" },
              { id: "two", label: "Favorites", count: 3 },
              { id: "three", label: "Create" },
            ]}
            active={tab}
            onSelect={setTab}
          />
        </Panel>
        <FilterPanel
          categories={CATEGORIES}
          selected={filters}
          onToggle={(id) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))}
          sortOptions={SORTS}
          sort={sort}
          onSortChange={setSort}
        />
        <Panel brackets title="Salute card">
          <div className="flex items-center gap-2">
            <span className="text-text">Bot Breaker Doctrine</span>
            <StarToggle active={starred} onChange={setStarred} label="Bot Breaker Doctrine" />
          </div>
          <ImageWithFallback src="/images/loadouts/missing.png" alt="Salute render" label="Salute render" className="mt-3 h-32 w-full" />
        </Panel>
      </div>

      <HudAlert label="Tactical loadout advisor">
        WARNING: Duplicate Backpack systems equipped — Autocannon + Shield Gen Pack.
      </HudAlert>
      <HudAlert
        tone="danger"
        label="Lobby alert"
        actions={
          <>
            <HudButton variant="secondary" size="sm">View case</HudButton>
          </>
        }
      >
        Suspect “GR1EF-UNIT_404” joined your squad · 3 verified reports
      </HudAlert>

      <RoleplayNotice context="treason" />
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Legal components">
          <Checkbox checked={checked} onChange={setChecked} label="I am 18 or older" description="Checkbox with description" />
          <RoleplayNotice context="bounty" variant="line" className="mt-3" />
          <FanDisclaimer className="mt-4" />
          <FanDisclaimer variant="block" className="mt-4" />
        </Panel>
        <Panel title="Roleplay notice (warrant)">
          <RoleplayNotice context="warrant" />
          <p className="mt-3 text-[13px] text-muted">Dismissed boxes come back when the roleplay document version increases.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Panel title="Toasts, modal, links">
          <div className="flex flex-wrap gap-2">
            <HudButton size="sm" onClick={() => toast({ label: "Update ready v0.2.0", message: "Restart to install." })}>
              Info toast
            </HudButton>
            <HudButton
              size="sm"
              variant="secondary"
              onClick={() => toast({ tone: "warning", label: "Uplink unstable", message: "Retrying in 30 s." })}
            >
              Warning toast
            </HudButton>
            <HudButton size="sm" variant="danger" onClick={() => toast({ tone: "danger", label: "Traitor detected" })}>
              Danger toast
            </HudButton>
            <HudButton size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </HudButton>
          </div>
          <p className="mt-4">
            <ExternalLink href="https://github.com/helldivers-2/api">Community API on GitHub</ExternalLink>
          </p>
        </Panel>
        <EmptyState
          code="No favorites"
          title="No loadouts starred yet"
          message="Star a loadout in Browse and it shows up here."
          action={<HudButton size="sm">Browse loadouts</HudButton>}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report to High Command"
        footer={
          <>
            <HudButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</HudButton>
            <HudButton onClick={() => setModalOpen(false)}>Transmit</HudButton>
          </>
        }
      >
        <p className="text-text-2">Modal body. Esc, the close button or a click outside closes it.</p>
      </Modal>
    </div>
  );
}
