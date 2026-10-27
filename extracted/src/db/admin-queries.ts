import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type DashboardStats = {
  surahs: number;
  verses: number;
  tafsirs: number;
  reciters: number;
  qaItems: number;
  adhkarCategories: number;
  adhkar: number;
  messagesTotal: number;
  messagesNew: number;
  adsTotal: number;
  adsActive: number;
  impressions: number;
  clicks: number;
  ctr: number; // 0..100, real only
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM surahs)::int AS surahs,
      (SELECT count(*) FROM verses)::int AS verses,
      (SELECT count(*) FROM tafsirs)::int AS tafsirs,
      (SELECT count(*) FROM reciters)::int AS reciters,
      (SELECT count(*) FROM ask_noor_qa)::int AS qa_items,
      (SELECT count(*) FROM adhkar_categories)::int AS adhkar_categories,
      (SELECT count(*) FROM adhkar)::int AS adhkar,
      (SELECT count(*) FROM contact_messages)::int AS messages_total,
      (SELECT count(*) FROM contact_messages WHERE status = 'NEW')::int AS messages_new,
      (SELECT count(*) FROM advertisements)::int AS ads_total,
      (SELECT count(*) FROM advertisements WHERE is_active)::int AS ads_active,
      (SELECT count(*) FROM ad_events WHERE type = 'impression')::int AS impressions,
      (SELECT count(*) FROM ad_events WHERE type = 'click')::int AS clicks
  `);
  const r = rows.rows[0] as Record<string, number>;
  const impressions = r.impressions ?? 0;
  const clicks = r.clicks ?? 0;
  return {
    surahs: r.surahs ?? 0,
    verses: r.verses ?? 0,
    tafsirs: r.tafsirs ?? 0,
    reciters: r.reciters ?? 0,
    qaItems: r.qa_items ?? 0,
    adhkarCategories: r.adhkar_categories ?? 0,
    adhkar: r.adhkar ?? 0,
    messagesTotal: r.messages_total ?? 0,
    messagesNew: r.messages_new ?? 0,
    adsTotal: r.ads_total ?? 0,
    adsActive: r.ads_active ?? 0,
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
  };
}
