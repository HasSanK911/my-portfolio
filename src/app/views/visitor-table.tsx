"use client";

import { ChevronDown, Monitor, Smartphone, Tablet, Tv } from "lucide-react";
import { useState } from "react";

import {
  countryFlag,
  formatCount,
  formatDuration,
  formatLocation,
  formatReferrer,
  formatRelative,
  formatTimestamp,
} from "@/lib/analytics/format";
import { LIVE_WINDOW_MS } from "@/lib/analytics/limits";
import type { VisitorRecord } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

/**
 * One row per visitor, newest activity first. Rows expand to show the paths
 * they read and the individual sessions.
 *
 * "Who" is as far as the web lets us go: an approximate place, a device, and
 * how they arrived. There is no name here and there cannot be one.
 */

function DeviceIcon({ device }: { device: string }) {
  const className = "h-3.5 w-3.5 text-fg-subtle";

  switch (device) {
    case "mobile":
      return <Smartphone className={className} aria-hidden />;
    case "tablet":
      return <Tablet className={className} aria-hidden />;
    case "smarttv":
    case "console":
      return <Tv className={className} aria-hidden />;
    default:
      return <Monitor className={className} aria-hidden />;
  }
}

function VisitorRow({ visitor, now }: { visitor: VisitorRecord; now: number }) {
  const [open, setOpen] = useState(false);
  const isLive = now - visitor.lastSeen < LIVE_WINDOW_MS;

  const pages = Object.entries(visitor.pages).sort((a, b) => b[1].views - a[1].views);
  const sessions = [...visitor.sessions].reverse();

  return (
    <>
      <tr className={cn("border-t border-line", open && "bg-surface-2")}>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="flex items-center gap-2.5 text-left transition-colors duration-[160ms] hover:text-accent"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-fg-subtle transition-transform duration-[260ms]",
                open && "rotate-180",
              )}
              aria-hidden
            />
            <span aria-hidden className="text-base leading-none">
              {countryFlag(visitor.countryCode)}
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-2 text-sm text-fg">
                {formatLocation(visitor.city, visitor.region, visitor.country)}
                {isLive ? (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand" title="On the site now">
                    <span className="sr-only">On the site now</span>
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-[0.6875rem] text-fg-subtle">{visitor.id}</span>
            </span>
          </button>
        </td>

        <td className="px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-fg-muted">
            <DeviceIcon device={visitor.device} />
            <span className="truncate">
              {[visitor.browser, visitor.os].filter(Boolean).join(" · ") || "Unknown"}
            </span>
          </span>
        </td>

        <td className="px-4 py-3 text-sm text-fg-muted">{formatReferrer(visitor.firstReferrer)}</td>

        <td className="px-4 py-3 text-right text-sm tabular-nums text-fg-muted">
          {formatCount(visitor.visits)}
        </td>

        <td className="px-4 py-3 text-right text-sm tabular-nums text-fg-muted">
          {formatCount(visitor.pageviews)}
        </td>

        <td className="px-4 py-3 text-right text-sm tabular-nums text-fg">
          {formatDuration(visitor.totalMs)}
        </td>

        <td className="px-4 py-3 text-right text-sm text-fg-muted" title={formatTimestamp(visitor.lastSeen)}>
          {formatRelative(visitor.lastSeen, now)}
        </td>
      </tr>

      {open ? (
        <tr className="bg-surface-2">
          <td colSpan={7} className="px-4 pb-5 pt-1">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-label text-fg-subtle">Pages read</h4>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {pages.length === 0 ? (
                    <li className="text-sm text-fg-subtle">No pages recorded</li>
                  ) : (
                    pages.map(([path, stat]) => (
                      <li key={path} className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="truncate font-mono text-[0.8125rem] text-fg-muted">
                          {path}
                        </span>
                        <span className="shrink-0 tabular-nums text-fg-subtle">
                          {formatCount(stat.views)} × · {formatDuration(stat.ms)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-label text-fg-subtle">Sessions</h4>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {sessions.map((session) => (
                    <li
                      key={session.start}
                      className="flex items-baseline justify-between gap-4 text-sm"
                    >
                      <span className="truncate text-fg-muted">
                        {formatTimestamp(session.start)}
                      </span>
                      <span className="shrink-0 tabular-nums text-fg-subtle">
                        {formatCount(session.views)} views · {formatDuration(session.ms)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-fg-subtle">
                  First seen {formatTimestamp(visitor.firstSeen)}
                  {visitor.timezone ? ` · ${visitor.timezone}` : ""}
                  {visitor.language ? ` · ${visitor.language}` : ""}
                </p>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function VisitorTable({ visitors, now }: { visitors: VisitorRecord[]; now: number }) {
  if (visitors.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm text-fg-muted">No visitors recorded yet.</p>
        <p className="mt-1 text-xs text-fg-subtle">
          Open the site in a private window to see a row appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* The table is wider than a phone; let it scroll inside its own box
          rather than pushing the page sideways. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[54rem] border-collapse text-left">
          <caption className="sr-only">
            Every recorded visitor, most recently active first
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-label text-fg-subtle">
                Visitor
              </th>
              <th scope="col" className="px-4 py-3 text-label text-fg-subtle">
                Device
              </th>
              <th scope="col" className="px-4 py-3 text-label text-fg-subtle">
                Source
              </th>
              <th scope="col" className="px-4 py-3 text-right text-label text-fg-subtle">
                Visits
              </th>
              <th scope="col" className="px-4 py-3 text-right text-label text-fg-subtle">
                Views
              </th>
              <th scope="col" className="px-4 py-3 text-right text-label text-fg-subtle">
                Time
              </th>
              <th scope="col" className="px-4 py-3 text-right text-label text-fg-subtle">
                Last seen
              </th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((visitor) => (
              <VisitorRow key={visitor.id} visitor={visitor} now={now} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
