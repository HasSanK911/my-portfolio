import { NextResponse } from "next/server";

import { readStats } from "@/lib/analytics/record";

/**
 * Public counter behind the home-page chip. Deliberately returns nothing but
 * the two totals — no visitor detail is reachable without a dashboard session.
 *
 * The tracker already receives the fresh total in its own response, so this is
 * only the fallback path for when tracking is skipped (bots, the excluded
 * owner) or a beacon fails.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await readStats();
    return NextResponse.json(
      { views: stats.views, visitors: stats.visitors },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[analytics] failed to read stats", error);
    return NextResponse.json({ views: 0, visitors: 0 }, { status: 200 });
  }
}
