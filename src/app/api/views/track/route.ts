import { NextResponse, type NextRequest } from "next/server";

import { EXCLUDE_COOKIE, VISITOR_COOKIE } from "@/lib/analytics/auth";
import { readStats, recordEvent } from "@/lib/analytics/record";
import { newVisitorId, readRequestFacts } from "@/lib/analytics/request";
import type { TrackEvent } from "@/lib/analytics/types";

/**
 * Ingest endpoint for the client tracker. Every beacon — first pageview,
 * heartbeat, and the final flush on unload — lands here.
 *
 * It always answers 200 with the current total, even when it decided not to
 * record anything. The chip reads that number, and a bot or an excluded owner
 * should still see a correct site total rather than an error.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Beacon bodies are tiny; anything larger is not ours. */
const MAX_BODY_BYTES = 2048;

const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function isTrackEvent(value: unknown): value is TrackEvent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.t === "view" || candidate.t === "ping" || candidate.t === "end") &&
    typeof candidate.p === "string"
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ views: 0 }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ views: 0 }, { status: 400 });
  }

  if (!isTrackEvent(parsed)) {
    return NextResponse.json({ views: 0 }, { status: 400 });
  }

  const facts = readRequestFacts(request);
  const excluded = request.cookies.get(EXCLUDE_COOKIE)?.value === "1";

  // Bots and the site owner both move the numbers without being an audience.
  if (facts.isBot || excluded) {
    const stats = await readStats();
    return NextResponse.json({ views: stats.views, tracked: false });
  }

  const existingId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = /^[a-f0-9]{20}$/.test(existingId ?? "") ? existingId! : newVisitorId();

  let views = 0;
  try {
    const outcome = await recordEvent(parsed, facts, visitorId, request.headers.get("host"));
    views = outcome.views;
  } catch (error) {
    // Analytics must never break the page it is measuring.
    console.error("[analytics] failed to record event", error);
  }

  const response = NextResponse.json({ views, tracked: true });

  if (existingId !== visitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }

  return response;
}
