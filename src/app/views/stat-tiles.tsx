"use client";

import { formatCount, formatDuration } from "@/lib/analytics/format";

/**
 * The dashboard's headline numbers.
 *
 * Exactly one hero figure — total views — because that is the number the page
 * exists to report. Everything else is a stat tile at body scale. The hero uses
 * the sans stack and proportional figures; `tabular-nums` is reserved for the
 * columns in the visitor table where digits have to line up.
 */

export function HeroFigure({ views, live }: { views: number; live: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-fg-subtle">Total views</span>
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-sans text-5xl font-semibold leading-none tracking-tight text-fg sm:text-6xl">
          {formatCount(views)}
        </span>
        <LivePill count={live} />
      </div>
    </div>
  );
}

function LivePill({ count }: { count: number }) {
  const active = count > 0;

  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {active ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
        ) : null}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            active ? "bg-brand" : "bg-fg-subtle"
          }`}
        />
      </span>
      <span className="text-label text-fg-muted">
        {count === 1 ? "1 reading now" : `${formatCount(count)} reading now`}
      </span>
    </span>
  );
}

export type Tile = {
  label: string;
  value: string;
  hint?: string;
};

export function StatTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1.5 bg-surface p-5">
          <dt className="text-label text-fg-subtle">{tile.label}</dt>
          <dd className="text-2xl font-medium leading-none text-fg">{tile.value}</dd>
          {tile.hint ? <p className="text-xs text-fg-subtle">{tile.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

/** Build the tile row from the numbers the dashboard already has. */
export function buildTiles({
  visitors,
  returning,
  totalMs,
  averageMs,
}: {
  visitors: number;
  returning: number;
  totalMs: number;
  averageMs: number;
}): Tile[] {
  return [
    {
      label: "Unique visitors",
      value: formatCount(visitors),
      hint: visitors === 0 ? undefined : `${formatCount(returning)} came back`,
    },
    {
      label: "Avg time on site",
      value: formatDuration(averageMs),
      hint: "Engaged time per visitor",
    },
    {
      label: "Total time read",
      value: formatDuration(totalMs),
      hint: "Across every visit",
    },
    {
      label: "Return rate",
      value: visitors === 0 ? "—" : `${Math.round((returning / visitors) * 100)}%`,
      hint: "Visitors with 2+ sessions",
    },
  ];
}
