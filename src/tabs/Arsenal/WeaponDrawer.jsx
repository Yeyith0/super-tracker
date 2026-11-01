import Drawer from "../../components/Drawer";
import HudButton from "../../components/HudButton";
import ImageWithFallback from "../../components/ImageWithFallback";
import PatchArrow from "../../components/PatchArrow";
import { STATS, formatStat, statLabel, statValue } from "./arsenalData";
import DropoffChart from "./DropoffChart";
import { PenTierRow } from "./PenTierBar";

/** Detail drawer: every stat, drop-off chart, armor pen tier, recoil and the latest patch note. */
export default function WeaponDrawer({ weapon, classFor, scale, patch, slot, onCompare, onClose }) {
  const penClass = weapon ? classFor(weapon.ap) : null;

  return (
    <Drawer open={Boolean(weapon)} onClose={onClose} title={weapon?.name ?? ""}>
      {weapon ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
              {weapon.designation ? `${weapon.designation} · ` : ""}
              {weapon.type} · {penClass.label}
            </p>
            <PatchArrow status={weapon.patchStatus} className="text-[14px]" />
          </div>

          <div className="mt-4 h-40 border border-line bg-inset">
            <ImageWithFallback src={weapon.image} alt={weapon.name} label={weapon.name} className="h-full w-full object-contain" />
          </div>

          {weapon.patchNote ? (
            <div className="mt-4 border border-line bg-inset px-4 py-3">
              <p className="hud-label text-accent-2">Patch {patch}</p>
              <p className="mt-1 text-[15px] text-text">{weapon.patchNote}</p>
            </div>
          ) : null}

          <dl className="mt-5 grid grid-cols-2 gap-x-6">
            {STATS.filter((stat) => statValue(weapon, stat.key) != null).map((stat) => (
              <div key={stat.key} className="flex items-baseline justify-between border-b border-line py-2.5">
                <dt className="hud-label text-muted">{statLabel(stat, weapon.category).replace(" ↓", "")}</dt>
                <dd className="font-mono text-[15px] text-text">
                  {formatStat(weapon, stat.key)}
                  {stat.unit === "rpm" ? <span className="ml-1 text-[11px] text-muted">rpm</span> : null}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b border-line py-2.5">
              <dt className="hud-label text-muted">Armor pen</dt>
              <dd className="font-mono text-[15px] text-text">AP {weapon.ap}</dd>
            </div>
          </dl>

          {weapon.damageText || weapon.penetrationText ? (
            <dl className="mt-4 space-y-2 text-[14px]">
              {weapon.damageText ? (
                <div>
                  <dt className="hud-label text-muted">Damage breakdown</dt>
                  <dd className="mt-0.5 text-text-2">{weapon.damageText}</dd>
                </div>
              ) : null}
              {weapon.penetrationText ? (
                <div>
                  <dt className="hud-label text-muted">Penetration</dt>
                  <dd className="mt-0.5 text-text-2">{weapon.penetrationText}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <p className="hud-label mb-2 mt-6 text-text-2">Damage drop-off (dmg / meters)</p>
          <DropoffChart a={weapon} height={200} />

          <p className="hud-label mb-2 mt-6 text-text-2">Armor pen tier</p>
          <PenTierRow ap={weapon.ap} scale={scale} label={weapon.name} />
          <p className="mt-2 text-[14px] text-text-2">
            {penClass.label} · {penClass.summary}
          </p>

          <HudButton block variant={slot ? "secondary" : "primary"} className="mt-6" onClick={onCompare}>
            {slot ? `Remove from slot ${slot}` : "Add to compare"}
          </HudButton>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">
            {weapon.wikiTitle ? "Stats from the Helldivers Wiki (CC BY-NC-SA 4.0); reload time and drop-off are approximate." : "Approximate values."}
          </p>
        </>
      ) : null}
    </Drawer>
  );
}
