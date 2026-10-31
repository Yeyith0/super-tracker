import { Link } from "react-router-dom";
import { useLegal } from "../legal/useLegal";
import { useSettingsStore } from "../store/useSettingsStore";
import HudAlert from "./HudAlert";

const TEXT = {
  treason:
    "Cases, verdicts and traitor labels are Super Earth roleplay about gameplay, not real accusations. Judge the play, not the person: never harass, stalk or grief anyone.",
  bounty: "Roleplay ranking: officers earn credit for resolved roleplay cases, never for punishing real players.",
  warrant:
    "Warrants are roleplay. Never sabotage a mission or follow a player across lobbies, and stop when someone asks you out of character.",
};

const RULES_PATH = "/legal/roleplay";

/**
 * Roleplay reminder for Treason pages, the bounty board and warrants.
 * box = amber alert, dismissible per context until the roleplay document version increases; line = one-line note.
 */
export default function RoleplayNotice({ context, variant = "box", className = "" }) {
  const version = useLegal().docs.roleplay.version;
  const dismissedVersion = useSettingsStore((state) => state.dismissedNotices[context] ?? 0);
  const dismissNotice = useSettingsStore((state) => state.dismissNotice);

  if (variant === "line") {
    return (
      <p className={`text-[12px] text-muted ${className}`}>
        <span className="hud-label mr-2 text-[10px] text-accent-2">Roleplay</span>
        {TEXT[context]}{" "}
        <Link to={RULES_PATH} className="text-cyan underline-offset-4 hover:underline">
          Read the rules
        </Link>
      </p>
    );
  }

  if (dismissedVersion >= version) return null;

  return (
    <HudAlert
      label="Roleplay notice"
      className={className}
      actions={
        <>
          <Link
            to={RULES_PATH}
            className="hud-transition inline-flex min-h-9 items-center border border-accent-2 px-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-2 transition-colors hover:bg-accent-2/10"
          >
            Read the roleplay rules
          </Link>
          <button
            type="button"
            onClick={() => dismissNotice(context, version)}
            className="hud-transition min-h-9 px-3 text-[12px] font-bold uppercase tracking-[0.16em] text-text-2 transition-colors hover:text-text"
          >
            Dismiss
          </button>
        </>
      }
    >
      {TEXT[context]}
    </HudAlert>
  );
}
