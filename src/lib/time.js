/** "just now", "3 min ago", "2 h ago", "4 d ago" for a millisecond timestamp. */
export function timeAgo(timestamp, now = Date.now()) {
  if (!timestamp) return "never";
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
