import { openExternal } from "../lib/tauri";
import { IconExternal } from "./icons";

/** Link that always opens in the user's default browser or mail app (opener plugin), never inside the app. */
export default function ExternalLink({ href, className = "", children, ...rest }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.preventDefault();
        openExternal(href);
      }}
      className={`inline-flex items-center gap-1 text-cyan underline-offset-4 hover:underline ${className}`}
      {...rest}
    >
      {children}
      <IconExternal className="h-3.5 w-3.5" />
      <span className="sr-only">(opens outside the app)</span>
    </a>
  );
}
