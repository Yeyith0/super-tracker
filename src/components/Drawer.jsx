import { useEffect, useId, useRef } from "react";
import { IconClose } from "./icons";

/**
 * Side drawer from the right on a native <dialog> (focus trap, Esc, inert background).
 * Closes on Esc, the close button or a click on the backdrop.
 */
export default function Drawer({ open, onClose, title, width = 500, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (dialog.close) dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}
      className="hud-modal m-0 ml-auto h-dvh max-h-dvh max-w-[100vw] border-0 border-l-4 border-l-accent bg-panel p-0 text-text"
      style={{ width }}
    >
      {open ? (
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <h2 id={titleId} className="section-title">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close panel"
              onClick={onClose}
              className="hud-transition inline-flex h-9 w-9 items-center justify-center text-text-2 transition-colors hover:text-text"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
