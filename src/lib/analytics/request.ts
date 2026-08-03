import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { userAgent } from "next/server";

/**
 * Everything we derive from the incoming request itself, as opposed to the
 * beacon body. None of it identifies a person: the IP is hashed and discarded,
 * and geo resolution stops at city level because that is all the edge gives us.
 */

export type RequestFacts = {
  isBot: boolean;
  ipHash: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  device: string;
  os: string | null;
  browser: string | null;
};

/**
 * Salt for the IP hash. Without a stable value the hash changes every deploy,
 * which is harmless but makes the rate limiter forgetful. Set ANALYTICS_SALT
 * in production.
 */
const IP_SALT =
  process.env.ANALYTICS_SALT ?? process.env.VIEWS_SECRET ?? "portfolio-analytics-dev-salt";

/**
 * `userAgent().isBot` covers the well-behaved crawlers. These are the extra
 * strings that show up in practice — preview renderers, uptime pingers and
 * headless browsers — none of which are a person reading the page.
 */
const EXTRA_BOT_PATTERN =
  /(bot|crawler|spider|crawling|slurp|headless|phantomjs|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|axios|python-requests|go-http|java\/|okhttp|scrapy|preview|facebookexternalhit|whatsapp|telegram|discord|slackbot|linkedinbot|embedly|quora link preview|nuzzel|bitlybot|vercel|netlify)/i;

/** Netlify's geo payload, as delivered in the base64 `x-nf-geo` header. */
type NetlifyGeo = {
  city?: string;
  country?: { code?: string; name?: string };
  subdivision?: { code?: string; name?: string };
  timezone?: string;
};

function decodeNetlifyGeo(header: string | null): NetlifyGeo | null {
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8")) as NetlifyGeo;
  } catch {
    return null;
  }
}

function clientIp(headers: Headers): string | null {
  // Netlify's own header is the trustworthy one on this deployment; the others
  // are fallbacks for local runs and other platforms.
  const direct = headers.get("x-nf-client-connection-ip") ?? headers.get("x-real-ip");
  if (direct) return direct.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return null;
}

/**
 * Truncated HMAC of the address. One-way, salted, and short enough that it is
 * only useful for equality checks — which is all we need it for.
 */
function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHmac("sha256", IP_SALT).update(ip).digest("hex").slice(0, 16);
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readRequestFacts(request: Request): RequestFacts {
  const headers = request.headers;
  const ua = userAgent({ headers });
  const rawUa = headers.get("user-agent") ?? "";

  const geo = decodeNetlifyGeo(headers.get("x-nf-geo"));

  return {
    isBot: ua.isBot || rawUa === "" || EXTRA_BOT_PATTERN.test(rawUa),
    ipHash: hashIp(clientIp(headers)),
    country: clean(geo?.country?.name) ?? clean(headers.get("x-vercel-ip-country")),
    countryCode: clean(geo?.country?.code) ?? clean(headers.get("x-country")),
    city: clean(geo?.city) ?? clean(headers.get("x-vercel-ip-city")),
    region: clean(geo?.subdivision?.name) ?? clean(geo?.subdivision?.code),
    timezone: clean(geo?.timezone),
    // `device.type` is undefined for desktop browsers — that absence is the
    // signal, not a gap.
    device: ua.device.type ?? "desktop",
    os: clean(ua.os.name),
    browser: clean(ua.browser.name),
  };
}

/** Hash used to bucket login attempts when there is no usable IP. */
export function rateLimitKey(request: Request): string {
  const facts = readRequestFacts(request);
  return facts.ipHash ?? "unknown";
}

export function newVisitorId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 20);
}

/**
 * Reduce a referrer URL to a display source. Same-origin referrers are dropped
 * — they are internal navigation, not a discovery channel.
 */
export function normaliseReferrer(referrer: string | null | undefined, host: string | null) {
  const raw = clean(referrer);
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (host && url.hostname.toLowerCase() === host.toLowerCase()) return null;
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
