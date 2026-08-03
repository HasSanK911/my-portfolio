import "server-only";

import { LIVE_WINDOW_MS, SESSION_GAP_MS } from "./limits";
import { mapLimit, readJson, update, analyticsStore } from "./store";
import { normaliseReferrer, type RequestFacts } from "./request";
import {
  EMPTY_STATS,
  type DashboardData,
  type SiteStats,
  type TrackEvent,
  type VisitorRecord,
} from "./types";

/* ------------------------------------------------------------------ tuning */

/** Upper bound on the engaged time a single beacon may claim. */
const MAX_BEACON_MS = 90 * 1000;

/** Most recent sessions retained per visitor. */
const MAX_SESSIONS = 25;

/** Distinct paths tracked per visitor before we stop adding new ones. */
const MAX_PAGES = 60;

/** Ceiling on visitor records the dashboard will pull in one request. */
const MAX_VISITORS_SCANNED = 2000;

/** Parallel blob reads when building the dashboard. */
const READ_CONCURRENCY = 24;

/* -------------------------------------------------------------------- keys */

const VISITOR_PREFIX = "v/";
const STATS_KEY = "stats";

const visitorKey = (id: string) => `${VISITOR_PREFIX}${id}`;

/* ------------------------------------------------------------ sanitisation */

/** Codepoints below this, plus DEL, are stripped from untrusted strings. */
const FIRST_PRINTABLE = 0x20;
const DEL = 0x7f;

function stripControlChars(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= FIRST_PRINTABLE && code !== DEL) out += char;
  }
  return out;
}

/**
 * Paths become object keys in the visitor record, so an unbounded value here
 * would let anyone inflate a blob with junk. Query and hash are dropped —
 * they carry no reporting value and often carry tracking parameters.
 */
export function normalisePath(input: unknown): string {
  if (typeof input !== "string") return "/";

  let path = stripControlChars(input.split("?")[0].split("#")[0]).trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.length > 120) path = path.slice(0, 120);

  return path || "/";
}

/** Clamp an untrusted duration into a range a real page visit could produce. */
function clampMs(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.round(value), MAX_BEACON_MS);
}

function clampString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = stripControlChars(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/* --------------------------------------------------------------- recording */

function blankVisitor(id: string, now: number, path: string, facts: RequestFacts): VisitorRecord {
  return {
    id,
    firstSeen: now,
    lastSeen: now,
    visits: 0,
    pageviews: 0,
    totalMs: 0,
    country: facts.country,
    countryCode: facts.countryCode,
    city: facts.city,
    region: facts.region,
    timezone: facts.timezone,
    language: null,
    device: facts.device,
    os: facts.os,
    browser: facts.browser,
    firstReferrer: null,
    firstLanding: path,
    ipHash: facts.ipHash,
    pages: {},
    sessions: [],
  };
}

export type RecordOutcome = {
  /** Total site views after this event. */
  views: number;
};

/**
 * Fold one beacon into the visitor's record and, when it opens a pageview or a
 * new visitor, into the site totals.
 */
export async function recordEvent(
  event: TrackEvent,
  facts: RequestFacts,
  visitorId: string,
  host: string | null,
): Promise<RecordOutcome> {
  const now = Date.now();
  const path = normalisePath(event.p);
  const isView = event.t === "view";
  const engagedMs = isView ? 0 : clampMs(event.ms);
  const referrer = normaliseReferrer(event.r, host);
  const language = clampString(event.lang, 12);
  const timezone = clampString(event.tz, 64);

  // These are set by the mutate closure below. Because `update` calls mutate
  // immediately before each write attempt and returns as soon as one succeeds,
  // the values left here always describe the attempt that actually landed.
  let createdVisitor = false;
  let countedView = false;

  await update<VisitorRecord>(
    visitorKey(visitorId),
    () => blankVisitor(visitorId, now, path, facts),
    (current, exists) => {
      createdVisitor = !exists;
      countedView = false;

      const record: VisitorRecord = {
        ...current,
        pages: { ...current.pages },
        sessions: [...current.sessions],
      };

      // Geo and device come from the current request, so they self-heal if a
      // visitor moves or upgrades a browser.
      record.country = facts.country ?? record.country;
      record.countryCode = facts.countryCode ?? record.countryCode;
      record.city = facts.city ?? record.city;
      record.region = facts.region ?? record.region;
      record.timezone = timezone ?? facts.timezone ?? record.timezone;
      record.language = language ?? record.language;
      record.device = facts.device;
      record.os = facts.os ?? record.os;
      record.browser = facts.browser ?? record.browser;
      record.ipHash = facts.ipHash ?? record.ipHash;

      const lastSession = record.sessions[record.sessions.length - 1];
      const startsSession = !lastSession || now - record.lastSeen > SESSION_GAP_MS;

      if (startsSession) {
        record.visits += 1;
        record.sessions.push({
          start: now,
          end: now,
          ms: 0,
          views: 0,
          landing: path,
          referrer,
        });
        if (record.sessions.length > MAX_SESSIONS) {
          record.sessions = record.sessions.slice(-MAX_SESSIONS);
        }
        // Only the very first session tells us how they originally found us.
        if (record.visits === 1 && !record.firstReferrer) {
          record.firstReferrer = referrer;
        }
      }

      const session = record.sessions[record.sessions.length - 1];
      session.end = now;
      session.ms += engagedMs;

      if (isView) {
        record.pageviews += 1;
        session.views += 1;
        countedView = true;

        const page = record.pages[path];
        if (page) {
          page.views += 1;
        } else if (Object.keys(record.pages).length < MAX_PAGES) {
          record.pages[path] = { views: 1, ms: 0 };
        }
      } else if (engagedMs > 0) {
        const page = record.pages[path];
        if (page) {
          page.ms += engagedMs;
        } else if (Object.keys(record.pages).length < MAX_PAGES) {
          record.pages[path] = { views: 0, ms: engagedMs };
        }
      }

      record.totalMs += engagedMs;
      record.lastSeen = now;

      return record;
    },
  );

  if (!countedView && !createdVisitor) {
    // A heartbeat: the visitor record moved, the site totals did not.
    const stats = await readJson<SiteStats>(STATS_KEY);
    return { views: stats?.views ?? 0 };
  }

  const stats = await update<SiteStats>(
    STATS_KEY,
    () => ({ ...EMPTY_STATS }),
    (current) => ({
      views: current.views + (countedView ? 1 : 0),
      visitors: current.visitors + (createdVisitor ? 1 : 0),
      updatedAt: now,
    }),
  );

  return { views: stats.views };
}

/** Site totals for the public chip. */
export async function readStats(): Promise<SiteStats> {
  return (await readJson<SiteStats>(STATS_KEY)) ?? { ...EMPTY_STATS };
}

/* --------------------------------------------------------------- dashboard */

/**
 * Pull every visitor record and roll it up. This is an O(visitors) fan-out, so
 * it is capped — the dashboard reports when it truncates rather than quietly
 * showing a partial picture.
 */
export async function readDashboard(): Promise<DashboardData> {
  const store = analyticsStore();
  const [stats, allKeys] = await Promise.all([
    readStats(),
    store.listKeys(VISITOR_PREFIX).catch((error) => {
      console.warn("[analytics] visitor listing failed", error);
      return [] as string[];
    }),
  ]);

  const truncated = allKeys.length > MAX_VISITORS_SCANNED;
  const keys = truncated ? allKeys.slice(0, MAX_VISITORS_SCANNED) : allKeys;

  const records = await mapLimit(keys, READ_CONCURRENCY, (key) => readJson<VisitorRecord>(key));

  const visitors = records
    .filter((record): record is VisitorRecord => Boolean(record?.id))
    .sort((a, b) => b.lastSeen - a.lastSeen);

  const generatedAt = Date.now();
  const cutoff = generatedAt - LIVE_WINDOW_MS;

  return {
    generatedAt,
    stats,
    live: visitors.filter((visitor) => visitor.lastSeen >= cutoff).length,
    totalMs: visitors.reduce((sum, visitor) => sum + visitor.totalMs, 0),
    visitors,
    truncated,
    ephemeral: store.ephemeral,
  };
}
