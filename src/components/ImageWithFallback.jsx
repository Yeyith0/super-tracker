import { useState } from "react";

/**
 * Every entity image renders through this. When src is missing or fails to load it shows the
 * striped HUD placeholder with a mono "[LABEL]" (or a custom `fallback`, e.g. avatar initials).
 */
export default function ImageWithFallback({ src, alt = "", label, fallback, fit = "cover", className = "", ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !src || failedSrc === src;

  if (failed) {
    if (fallback) return fallback;
    return (
      <div role="img" aria-label={alt || label} className={`hud-stripes flex items-center justify-center p-3 ${className}`}>
        <span className="hud-label text-center text-text-2">[{label ?? alt ?? "Image"}]</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable="false"
      onError={() => setFailedSrc(src)}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      {...rest}
    />
  );
}
