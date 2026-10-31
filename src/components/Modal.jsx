import { useEffect, useId, useRef } from "react";
import { IconClose } from "./icons";

/**
 * HUD modal on a native <dialog> (focus trap, Esc to close, inert background for free).
 * Closes on Esc, the close button or a click on the backdrop.
 */
export default function Modal({ open, onClose, title, footer, width = 560, children }) {
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
      className="hud-modal m-auto max-h-[85vh] max-w-[calc(100vw-48px)] border border-t-4 border-line border-t-accent bg-panel p-0 text-text"
      style={{ width }}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 id={titleId} className="section-title">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="hud-transition inline-flex h-9 w-9 items-center justify-center text-text-2 transition-colors hover:text-text"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <footer className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}
