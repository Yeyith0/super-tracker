/** Shown when a list has nothing to show (no favorites, no cases, no search results…). */
export default function EmptyState({ code = "No signal", title, message, action, className = "" }) {
  return (
    <div className={`border border-dashed border-line-strong bg-inset px-6 py-10 text-center ${className}`}>
      <p className="hud-label text-muted">// {code}</p>
      {title ? <p className="mt-3 text-[18px] font-semibold text-text">{title}</p> : null}
      {message ? <p className="mx-auto mt-2 max-w-md text-[15px] text-text-2">{message}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
