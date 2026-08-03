/**
 * Presentation helpers shared by the chip and the dashboard. Kept free of
 * server imports so client components can use them too.
 */

/** Locale-stable thousands separator — avoids an SSR/client mismatch. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(Math.max(0, Math.round(value)));
}

/** Compact engaged time: "0s", "48s", "3m 12s", "1h 04m". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));

  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** "just now", "6m ago", "3h ago", "12 Mar" — relative until it stops helping. */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;

  if (diff < 45_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / (60 * 60_000))}h ago`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.round(diff / (24 * 60 * 60_000))}d ago`;

  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(timestamp);
}

/** Full timestamp for tooltips. */
export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

/** Turn a bare hostname into something readable in a table. */
export function formatReferrer(referrer: string | null): string {
  if (!referrer) return "Direct";

  const known: Record<string, string> = {
    "google.com": "Google",
    "linkedin.com": "LinkedIn",
    "lnkd.in": "LinkedIn",
    "github.com": "GitHub",
    "t.co": "X / Twitter",
    "x.com": "X / Twitter",
    "facebook.com": "Facebook",
    "instagram.com": "Instagram",
    "reddit.com": "Reddit",
    "bing.com": "Bing",
    "duckduckgo.com": "DuckDuckGo",
    "news.ycombinator.com": "Hacker News",
  };

  const host = referrer.replace(/^www\./, "");
  if (known[host]) return known[host];

  // google.co.uk, google.com.pk and friends all read as Google.
  const base = host.split(".")[0];
  return known[`${base}.com`] ?? host;
}

/** Location line, degrading gracefully as the edge tells us less. */
export function formatLocation(
  city: string | null,
  region: string | null,
  country: string | null,
): string {
  const parts = [city, country ?? region].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}

/** Regional-indicator flag for a two-letter country code. */
export function countryFlag(code: string | null): string {
  if (!code || code.length !== 2 || !/^[a-z]{2}$/i.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
}
