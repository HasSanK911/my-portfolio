"use client";

import { formatCount } from "@/lib/analytics/format";
import type { RankedItem } from "./rollups";

/**
 * Ranked magnitude list — the honest form for "top countries / referrers /
 * pages", where the reader compares lengths and reads an exact figure.
 *
 * All bars share one hue on purpose. These categories are nominal, so colouring
 * them individually would spend the identity channel re-encoding what the bar
 * length already says. #d44a60 is validated for lightness, chroma and 3:1
 * contrast against both the light and dark chart surfaces.
 */

const BAR_COLOR = "var(--brand-500)";

export function BarList({
  title,
  items,
  empty = "Nothing yet",
  unit,
}: {
  title: string;
  items: RankedItem[];
  empty?: string;
  unit: string;
}) {
  // Scale to the largest bar rather than the total, so the top row always
  // fills the track and small differences stay visible.
  const max = items.reduce((peak, item) => Math.max(peak, item.value), 0);

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-label text-fg-subtle">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-fg-subtle">{empty}</p>
      ) : (
        <ol className="mt-5 flex flex-col gap-3.5">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex min-w-0 items-baseline gap-2">
                  {item.glyph ? (
                    <span aria-hidden className="text-sm leading-none">
                      {item.glyph}
                    </span>
                  ) : null}
                  <span className="truncate text-sm text-fg">{item.label}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-fg-muted">
                  {formatCount(item.value)}
                  <span className="sr-only">{` ${unit}`}</span>
                </span>
              </div>

              {/* Track is a step off the surface so the bar reads as the ink. */}
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-[2px] bg-surface-2">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{
                    width: `${max > 0 ? Math.max(2, (item.value / max) * 100) : 0}%`,
                    backgroundColor: BAR_COLOR,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
