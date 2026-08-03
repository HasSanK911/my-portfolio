"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { TrackEvent } from "@/lib/analytics/types";

/**
 * Client half of the analytics pipeline.
 *
 * It measures *engaged* time rather than wall-clock time: the counter only runs
 * while the tab is visible and the visitor has interacted within the last
 * IDLE_MS. A page left open in a background tab overnight should not report as
 * eight hours of reading.
 *
 * The provider also carries the site-wide view total, because the tracking
 * response already contains it — the chip gets its number for free rather than
 * costing a second request.
 */

const TRACK_ENDPOINT = "/api/views/track";
const STATS_ENDPOINT = "/api/views";

/** How often accumulated engaged time is flushed to the server. */
const HEARTBEAT_MS = 15_000;

/** Silence longer than this stops the clock until the visitor does something. */
const IDLE_MS = 60_000;

/** Don't spend a request on a rounding error. */
const MIN_FLUSH_MS = 1_000;

/** Guards against StrictMode double-mounts counting a view twice. */
const DEDUPE_MS = 1_000;

const INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "scroll",
  "wheel",
  "touchstart",
  "mousemove",
] as const;

type AnalyticsContextValue = {
  /** Total site views, or null until the first response arrives. */
  views: number | null;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({ views: null });

export function useSiteViews() {
  return useContext(AnalyticsContext).views;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [views, setViews] = useState<number | null>(null);

  /** Timestamp the engaged clock started, or null while it is paused. */
  const activeSince = useRef<number | null>(null);
  /** Engaged milliseconds measured but not yet sent. */
  const pending = useRef(0);
  /** Path the pending milliseconds belong to. */
  const trackedPath = useRef(pathname);
  /** Last interaction, used to decide whether the visitor is still there. */
  const lastInteraction = useRef(0);
  /** Path + timestamp of the last `view` beacon, for the dedupe guard. */
  const lastView = useRef<{ path: string; at: number } | null>(null);

  /** Roll the running clock into `pending` and stop it. */
  const pause = useCallback(() => {
    if (activeSince.current === null) return;
    pending.current += Date.now() - activeSince.current;
    activeSince.current = null;
  }, []);

  const resume = useCallback(() => {
    if (activeSince.current !== null) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    activeSince.current = Date.now();
  }, []);

  const send = useCallback((event: TrackEvent, useBeacon = false) => {
    const body = JSON.stringify(event);

    if (useBeacon && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      // The only transport guaranteed to survive the page going away.
      navigator.sendBeacon(TRACK_ENDPOINT, new Blob([body], { type: "application/json" }));
      return null;
    }

    return fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, []);

  /** Ship whatever engaged time has accrued for the path it was spent on. */
  const flush = useCallback(
    (type: "ping" | "end", useBeacon = false) => {
      pause();
      const ms = pending.current;
      if (ms < MIN_FLUSH_MS) return;
      pending.current = 0;

      void send({ t: type, p: trackedPath.current, ms }, useBeacon);
      if (!useBeacon) resume();
    },
    [pause, resume, send],
  );

  /* ------------------------------------------------------------ pageviews */

  useEffect(() => {
    const previous = lastView.current;
    if (previous && previous.path === pathname && Date.now() - previous.at < DEDUPE_MS) {
      return;
    }

    // Time spent so far belongs to the page being left, not the new one.
    flush("ping");
    trackedPath.current = pathname;
    lastView.current = { path: pathname, at: Date.now() };
    lastInteraction.current = Date.now();
    resume();

    const event: TrackEvent = {
      t: "view",
      p: pathname,
      // Referrer is only meaningful on the entry page; after that it is us.
      r: document.referrer || undefined,
      w: window.innerWidth,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
    };

    let cancelled = false;

    void (async () => {
      try {
        const response = await send(event);
        if (!response?.ok) throw new Error(`track responded ${response?.status}`);
        const data = (await response.json()) as { views?: number };
        if (!cancelled && typeof data.views === "number") setViews(data.views);
      } catch {
        // Tracking is best-effort, but the chip should still show a number.
        try {
          const fallback = await fetch(STATS_ENDPOINT, { cache: "no-store" });
          const data = (await fallback.json()) as { views?: number };
          if (!cancelled && typeof data.views === "number") setViews(data.views);
        } catch {
          /* offline — leave the chip in its loading state */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, flush, resume, send]);

  /* --------------------------------------------------- engagement plumbing */

  useEffect(() => {
    lastInteraction.current = Date.now();
    resume();

    const onInteraction = () => {
      lastInteraction.current = Date.now();
      resume();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastInteraction.current = Date.now();
        resume();
      } else {
        flush("end", true);
      }
    };

    const onPageHide = () => flush("end", true);

    const heartbeat = window.setInterval(() => {
      if (Date.now() - lastInteraction.current > IDLE_MS) {
        // Gone quiet: bank what we have and stop the clock until they return.
        pause();
        if (pending.current >= MIN_FLUSH_MS) {
          const ms = pending.current;
          pending.current = 0;
          void send({ t: "ping", p: trackedPath.current, ms });
        }
        return;
      }
      flush("ping");
    }, HEARTBEAT_MS);

    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, onInteraction, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(heartbeat);
      for (const event of INTERACTION_EVENTS) {
        window.removeEventListener(event, onInteraction);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      flush("end", true);
    };
  }, [flush, pause, resume, send]);

  const value = useMemo(() => ({ views }), [views]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
