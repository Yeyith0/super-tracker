import { useProfileStore, selectAlignment } from "../../store/useProfileStore";
import UpdateNotice from "../../update/UpdateNotice";
import ImageWithFallback from "../ImageWithFallback";
import AlignmentMeter from "./AlignmentMeter";

// "SGT. NOVA-21" -> "SN" (rank + name, as in the mockup).
function initials(callsign) {
  return callsign
    .split(/[\s.-]+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Top bar: avatar, callsign, level, alignment meter; the right side is reserved for notifications. */
export default function ProfileBar({ notifications = <UpdateNotice /> }) {
  const { callsign, level, dives, avatar, verdictsInFavor } = useProfileStore();
  const alignment = useProfileStore(selectAlignment);
  const avatarInitials = initials(callsign) || "HD";

  return (
    <div className="flex min-h-[106px] items-center gap-4 border-b border-line bg-strip px-8 py-4">
      <div className="h-[60px] w-[60px] shrink-0 border-2 border-accent bg-panel">
        <ImageWithFallback
          src={avatar}
          alt={`${callsign} avatar`}
          className="h-full w-full"
          fallback={
            <div role="img" aria-label={`${callsign} avatar`} className="flex h-full w-full items-center justify-center">
              <span className="text-[20px] font-bold text-accent">{avatarInitials}</span>
            </div>
          }
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[19px] font-bold tracking-[0.04em] text-text">{callsign}</p>
        <p className="hud-label mt-1 whitespace-nowrap tracking-[0.1em] text-muted">
          Lvl {level} · {dives.toLocaleString("en-US")} dives
        </p>
      </div>
      <AlignmentMeter value={alignment} caption={`${verdictsInFavor} verdicts in your favor`} />
      <div data-slot="notifications" className="ml-auto flex min-w-0 items-center justify-end gap-3">
        {notifications}
      </div>
    </div>
  );
}
