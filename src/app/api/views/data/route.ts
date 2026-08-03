import { NextResponse } from "next/server";

import { hasSession, isConfigured } from "@/lib/analytics/auth";
import { readDashboard } from "@/lib/analytics/record";

/**
 * Dashboard feed. The /views page renders its first paint on the server; this
 * endpoint exists so the page can refresh itself without a full navigation.
 *
 * The session check is repeated here on purpose — the page gating its own
 * render is a UI decision, not a security boundary.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isConfigured() || !(await hasSession())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const data = await readDashboard();
    return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[analytics] failed to build dashboard", error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
