import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { adEvents, advertisements } from "@/db/schema";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** GET /api/ad-click?id=N — validate, record click, then redirect to the ad target. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const adId = Number(url.searchParams.get("id"));

  const fallback = new URL("/", url.origin);
  if (!Number.isInteger(adId)) return NextResponse.redirect(fallback);

  const ip = clientIpFromHeaders(await headers());
  if (!rateLimit(`ad-click:${ip}`, 10, 60 * 1000)) {
    return NextResponse.redirect(fallback);
  }

  const [ad] = await db
    .select({ linkUrl: advertisements.linkUrl, isActive: advertisements.isActive })
    .from(advertisements)
    .where(eq(advertisements.id, adId))
    .limit(1);

  if (!ad?.linkUrl) return NextResponse.redirect(fallback);

  // Safe targets only: absolute http(s) or site-relative
  const target = ad.linkUrl;
  const safe = target.startsWith("/") || target.startsWith("https://") || target.startsWith("http://");
  if (!safe) return NextResponse.redirect(fallback);

  await db
    .insert(adEvents)
    .values({ adId, type: "click" })
    .catch(() => {});

  return NextResponse.redirect(
    target.startsWith("/") ? new URL(target, url.origin) : target
  );
}
