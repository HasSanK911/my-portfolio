/**
 * Shapes shared between the tracking endpoint, the blob store and the /views
 * dashboard. Field names on the wire payload are deliberately terse — every
 * heartbeat carries them, and the body is capped by the ingest route.
 */

/** Beacon sent by the client tracker. */
export type TrackEvent = {
  /** `view` on navigation, `ping` on heartbeat, `end` on unload. */
  t: "view" | "ping" | "end";
  /** Pathname only — query strings and hashes are dropped client-side. */
  p: string;
  /** Referrer, only sent on the first view of a session. */
  r?: string;
  /** Milliseconds of engaged time since the previous beacon. */
  ms?: number;
  /** Viewport width, used purely to label the device. */
  w?: number;
  /** IANA timezone, e.g. "Europe/London". */
  tz?: string;
  /** Primary browser language, e.g. "en-GB". */
  lang?: string;
};

/** Per-path rollup inside a visitor record. */
export type PageStat = {
  views: number;
  /** Engaged milliseconds attributed to this path. */
  ms: number;
};

/** One visit — a run of activity with no gap longer than SESSION_GAP_MS. */
export type SessionRecord = {
  start: number;
  end: number;
  ms: number;
  views: number;
  /** First path of the session. */
  landing: string;
  referrer: string | null;
};

/**
 * Everything known about one visitor. Keyed by an opaque cookie id — there is
 * no identity here, only shape of behaviour plus coarse origin.
 */
export type VisitorRecord = {
  id: string;
  firstSeen: number;
  lastSeen: number;
  /** Number of distinct sessions. */
  visits: number;
  pageviews: number;
  /** Total engaged milliseconds across all sessions. */
  totalMs: number;

  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  language: string | null;

  device: string;
  os: string | null;
  browser: string | null;

  /** Referrer of the very first session — how they originally found the site. */
  firstReferrer: string | null;
  /** First path ever landed on. */
  firstLanding: string;

  /** Salted hash of the IP. Never the address itself. */
  ipHash: string | null;

  pages: Record<string, PageStat>;
  /** Most recent sessions, newest last, capped at MAX_SESSIONS. */
  sessions: SessionRecord[];
};

/**
 * Aggregate counters kept in a single blob so the chip on the home page costs
 * exactly one read. Engaged time is deliberately *not* here — it changes on
 * every heartbeat, and keeping it out means heartbeats never contend for this
 * key. The dashboard sums it from the visitor records instead.
 */
export type SiteStats = {
  views: number;
  visitors: number;
  updatedAt: number;
};

/** Payload returned to the dashboard. */
export type DashboardData = {
  /**
   * When the snapshot was taken. The dashboard seeds its clock from this so
   * server and client agree on relative times through hydration.
   */
  generatedAt: number;
  stats: SiteStats;
  /** Visitors active within LIVE_WINDOW_MS. */
  live: number;
  /** Engaged milliseconds summed across every visitor scanned. */
  totalMs: number;
  visitors: VisitorRecord[];
  /** True when the visitor list hit MAX_VISITORS_SCANNED and was truncated. */
  truncated: boolean;
  /** Set when the store is the non-persistent in-memory dev fallback. */
  ephemeral: boolean;
};

export const EMPTY_STATS: SiteStats = {
  views: 0,
  visitors: 0,
  updatedAt: 0,
};
