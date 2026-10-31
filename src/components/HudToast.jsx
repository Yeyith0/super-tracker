import { useEffect } from "react";
import { useToastStore } from "../store/useToastStore";
import HudButton from "./HudButton";
import { IconClose } from "./icons";

const TONES = {
  info: { border: "border-l-accent", label: "text-accent" },
  warning: { border: "border-l-accent-2", label: "text-accent-2" },
  danger: { border: "border-l-danger", label: "text-danger-text" },
};

function Toast({ toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const tone = TONES[toast.tone] ?? TONES.info;

  useEffect(() => {
    if (!toast.duration) return undefined;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      className={`hud-toast-enter pointer-events-auto w-[360px] border border-l-4 border-line bg-panel shadow-[0_8px_24px_rgb(0_0_0/0.5)] ${tone.border}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          {toast.label ? <p className={`hud-label mb-1 ${tone.label}`}>{toast.label}</p> : null}
          {toast.message ? <p className="text-[15px] text-text">{toast.message}</p> : null}
          {toast.actions ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.isArray(toast.actions)
                ? toast.actions.map((action) => (
                    <HudButton
                      key={action.label}
                      size="sm"
                      variant={action.variant ?? "primary"}
                      onClick={() => {
                        dismiss(toast.id);
                        action.onClick?.();
                      }}
                    >
                      {action.label}
                    </HudButton>
                  ))
                : toast.actions}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismiss(toast.id)}
          className="hud-transition -mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-text"
        >
          <IconClose className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

/** Toast stack (bottom right). Mount once in the app shell; show one with toast({...}) from the store. */
export default function HudToaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
