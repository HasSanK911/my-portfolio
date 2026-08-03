import { countryFlag, formatReferrer } from "@/lib/analytics/format";
import type { VisitorRecord } from "@/lib/analytics/types";

/**
 * Pure rollups over the visitor list. Kept out of the components so the
 * dashboard renders derived numbers rather than computing them inline.
 */

export type RankedItem = {
  key: string;
  label: string;
  /** Optional leading glyph — a flag, in practice. */
  glyph?: string;
  value: number;
  /** Secondary figure shown after the value, e.g. engaged time. */
  meta?: string;
};

/** Sort descending, cap the list, and fold the remainder into "Other". */
function rank(counts: Map<string, RankedItem>, limit: number): RankedItem[] {
  const sorted = [...counts.values()].sort((a, b) => b.value - a.value);
  if (sorted.length <= limit) return sorted;

  const head = sorted.slice(0, limit);
  const tail = sorted.slice(limit);
  head.push({
    key: "__other",
    label: `Other (${tail.length})`,
    value: tail.reduce((sum, item) => sum + item.value, 0),
  });

  return head;
}

export function topCountries(visitors: VisitorRecord[], limit = 6): RankedItem[] {
  const counts = new Map<string, RankedItem>();

  for (const visitor of visitors) {
    const key = visitor.countryCode ?? visitor.country ?? "unknown";
    const existing = counts.get(key);
    if (existing) {
      existing.value += 1;
      continue;
    }
    counts.set(key, {
      key,
      label: visitor.country ?? visitor.countryCode ?? "Unknown",
      glyph: countryFlag(visitor.countryCode),
      value: 1,
    });
  }

  return rank(counts, limit);
}

export function topReferrers(visitors: VisitorRecord[], limit = 6): RankedItem[] {
  const counts = new Map<string, RankedItem>();

  for (const visitor of visitors) {
    const label = formatReferrer(visitor.firstReferrer);
    const existing = counts.get(label);
    if (existing) {
      existing.value += 1;
      continue;
    }
    counts.set(label, { key: label, label, value: 1 });
  }

  return rank(counts, limit);
}

export function topPages(visitors: VisitorRecord[], limit = 6): RankedItem[] {
  const counts = new Map<string, RankedItem>();

  for (const visitor of visitors) {
    for (const [path, stat] of Object.entries(visitor.pages)) {
      const existing = counts.get(path);
      if (existing) {
        existing.value += stat.views;
        continue;
      }
      counts.set(path, { key: path, label: path, value: stat.views });
    }
  }

  return rank(counts, limit);
}

export function topDevices(visitors: VisitorRecord[], limit = 4): RankedItem[] {
  const counts = new Map<string, RankedItem>();

  for (const visitor of visitors) {
    const label = visitor.device === "desktop" ? "Desktop" : titleCase(visitor.device);
    const existing = counts.get(label);
    if (existing) {
      existing.value += 1;
      continue;
    }
    counts.set(label, { key: label, label, value: 1 });
  }

  return rank(counts, limit);
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Engaged time averaged over visitors who actually registered any. */
export function averageEngagedMs(visitors: VisitorRecord[]): number {
  const engaged = visitors.filter((visitor) => visitor.totalMs > 0);
  if (engaged.length === 0) return 0;
  return engaged.reduce((sum, visitor) => sum + visitor.totalMs, 0) / engaged.length;
}

/** Visitors who came back for a second session. */
export function returningCount(visitors: VisitorRecord[]): number {
  return visitors.filter((visitor) => visitor.visits > 1).length;
}
