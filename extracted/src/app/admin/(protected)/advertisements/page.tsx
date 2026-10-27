import { sql } from "drizzle-orm";
import { db } from "@/db";
import { PageHeader } from "@/components/admin/ui";
import AdsManager from "./ads-manager";
import { toArabicDigits } from "@/lib/arabic";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعلانات" };

export type AdRow = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  impressions: number;
  clicks: number;
};

export default async function AdminAdsPage() {
  await requireAdmin();
  const rows = await db.execute(sql`
    SELECT
      a.id, a.title, a.body, a.image_url AS "imageUrl", a.link_url AS "linkUrl",
      a.placement, a.is_active AS "isActive",
      to_char(a.starts_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS "startsAt",
      to_char(a.ends_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS "endsAt",
      a.sort_order AS "sortOrder",
      COALESCE(SUM(CASE WHEN e.type = 'impression' THEN 1 ELSE 0 END), 0)::int AS impressions,
      COALESCE(SUM(CASE WHEN e.type = 'click' THEN 1 ELSE 0 END), 0)::int AS clicks
    FROM advertisements a
    LEFT JOIN ad_events e ON e.ad_id = a.id
    GROUP BY a.id
    ORDER BY a.sort_order, a.id
  `);

  const ads = rows.rows as unknown as AdRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإعلانات"
        subtitle={`${toArabicDigits(ads.length)} إعلانًا — الإحصائيات من أحداث مشاهدة ونقر حقيقية فقط.`}
      />
      <AdsManager ads={ads} />
    </div>
  );
}
