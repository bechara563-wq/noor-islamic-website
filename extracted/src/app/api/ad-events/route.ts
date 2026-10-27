import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { adEvents, advertisements, AD_EVENT_TYPES } from "@/db/schema";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public endpoint: record an ad impression or click. Heavily validated + rate-limited. */
export async function POST(req: Request) {
  const ip = clientIpFromHeaders(await headers());
  if (!rateLimit(`ad-event:${ip}`, 30, 60 * 1000)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  let body: { adId?: unknown; type?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const adId = Number(body.adId);
  const type = String(body.type);
  if (!Number.isInteger(adId) || !(AD_EVENT_TYPES as readonly string[]).includes(type)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const [{ exists }] = await db
    .select({ exists: sql<number>`count(*)::int` })
    .from(advertisements)
    .where(eq(advertisements.id, adId));
  if (exists === 0) {
    return Response.json({ ok: false, error: "not found" }, { status: 404 });
  }

  await db.insert(adEvents).values({ adId, type });
  return Response.json({ ok: true });
}
