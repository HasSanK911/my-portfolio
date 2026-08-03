"use client";

import { EyeOff, LogOut, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { formatDuration, formatRelative } from "@/lib/analytics/format";
import type { DashboardData } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

import { logout, toggleSelfExclusion } from "./actions";
import { BarList } from "./bar-list";
import {
  averageEngagedMs,
  returningCount,
  topCountries,
  topDevices,
  topPages,
  topReferrers,
} from "./rollups";
import { buildTiles, HeroFigure, StatTiles } from "./stat-tiles";
import { VisitorTable } from "./visitor-table";

/**
 * Dashboard shell.
 *
 * First paint is server-rendered so the page is useful immediately; from then
 * on it polls its own endpoint. `now` starts at the server's timestamp rather
 * than `Date.now()` so the relative times hydrate byte-identically, then
 * starts ticking on the client.
 */

const REFRESH_MS = 20_000;
const CLOCK_MS = 30_000;

export function Dashboard({
  initialData,
  initiallyExcluded,
}: {
  initialData: DashboardData;
  initiallyExcluded: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [now, setNow] = useState(initialData.generatedAt);
  const [lastSync, setLastSync] = useState(initialData.generatedAt);
  const [refreshing, setRefreshing] = useState(false);
  const [excluded, setExcluded] = useState(initiallyExcluded);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/views/data", { cache: "no-store" });
      if (!response.ok) return;
      const next = (await response.json()) as DashboardData;
      setData(next);
      setLastSync(next.generatedAt);
      setNow(next.generatedAt);
    } catch {
      // A dropped poll is not worth surfacing — the next one is 20s away.
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const poll = window.setInterval(() => void refresh(), REFRESH_MS);
    const clock = window.setInterval(() => setNow(Date.now()), CLOCK_MS);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [refresh]);

  const { visitors } = data;
  const tiles = buildTiles({
    visitors: data.stats.visitors,
    returning: returningCount(visitors),
    totalMs: data.totalMs,
    averageMs: averageEngagedMs(visitors),
  });

  return (
    // Same top inset as /work — the nav is fixed, so content has to clear it.
    <div className="shell relative z-10 flex flex-col gap-8 pb-24 pt-36 md:pt-44">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <HeroFigure views={data.stats.views} live={data.live} />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label text-fg-subtle">
            Synced {formatRelative(lastSync, now)}
          </span>

          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-fg transition-colors duration-[260ms] hover:border-brand hover:text-accent"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin motion-reduce:animate-none")}
              aria-hidden
            />
            Refresh
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const next = !excluded;
              setExcluded(next);
              startTransition(async () => {
                await toggleSelfExclusion(next);
              });
            }}
            aria-pressed={excluded}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-[260ms] disabled:opacity-60",
              excluded
                ? "border-brand text-accent"
                : "border-line-strong text-fg hover:border-brand hover:text-accent",
            )}
          >
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
            {excluded ? "Not counting me" : "Counting me"}
          </button>

          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-fg transition-colors duration-[260ms] hover:border-brand hover:text-accent"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Lock
            </button>
          </form>
        </div>
      </header>

      {data.ephemeral ? (
        <Notice>
          Netlify Blobs is not available in this environment, so visits are held in memory
          and vanish on restart. On the deployed site this stores permanently.
        </Notice>
      ) : null}

      {data.truncated ? (
        <Notice>
          More visitors exist than this page loads at once — the table shows the first 2,000
          records and the totals above count only those.
        </Notice>
      ) : null}

      <StatTiles tiles={tiles} />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <BarList title="Where they are" items={topCountries(visitors)} unit="visitors" />
        <BarList title="How they found you" items={topReferrers(visitors)} unit="visitors" />
        <BarList title="What they read" items={topPages(visitors)} unit="views" />
        <BarList title="What they used" items={topDevices(visitors)} unit="visitors" />
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-label text-fg-subtle">Visitors</h2>
        <p className="text-xs text-fg-subtle">
          {formatDuration(data.totalMs)} of reading across {visitors.length} people
        </p>
      </div>

      <VisitorTable visitors={visitors} now={now} />

      <p className="max-w-2xl text-xs leading-relaxed text-fg-subtle">
        Location is derived from the network edge and is accurate to roughly a city. IP
        addresses are hashed on arrival and never stored. There is no name attached to any
        row here — the web does not expose one.
      </p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line-strong bg-surface-2 px-5 py-4 text-sm text-fg-muted">
      {children}
    </p>
  );
}
