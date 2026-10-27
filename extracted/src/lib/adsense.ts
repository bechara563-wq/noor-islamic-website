import "server-only";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adsenseSettings } from "@/db/schema";

export type AdSenseConfig = {
  enabled: boolean;
  clientId: string;
  metaTag: string;
};

const ROW_ID = 1;

/** Auto-generate the standard AdSense meta tag from a client id */
export function buildMetaTag(clientId: string): string {
  const id = clientId.trim();
  if (!/^ca-pub-[0-9]+$/.test(id)) return "";
  return `<meta name="google-adsense-account" content="${id}">`;
}

/** Extract the content attribute from a full meta tag string (fallback: client id) */
export function extractMetaContent(metaTag: string, fallback: string): string {
  const m = metaTag.match(/content="([^"]+)"/);
  return (m?.[1] ?? (fallback.startsWith("ca-pub-") ? fallback : "")).trim();
}

export const getAdSenseConfig = unstable_cache(
  async (): Promise<AdSenseConfig> => {
    const [row] = await db
      .select({
        enabled: adsenseSettings.enabled,
        clientId: adsenseSettings.clientId,
        metaTag: adsenseSettings.metaTag,
      })
      .from(adsenseSettings)
      .where(eq(adsenseSettings.id, ROW_ID))
      .limit(1);
    if (!row) return { enabled: false, clientId: "", metaTag: "" };
    return row;
  },
  ["adsense-config"],
  { revalidate: 60, tags: ["adsense"] }
);

export async function saveAdSenseConfig(cfg: AdSenseConfig) {
  await db
    .insert(adsenseSettings)
    .values({ id: ROW_ID, ...cfg })
    .onConflictDoUpdate({
      target: adsenseSettings.id,
      set: { ...cfg, updatedAt: new Date() },
    });
}
