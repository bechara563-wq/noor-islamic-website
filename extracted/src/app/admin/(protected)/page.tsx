import { BookOpen, BookOpenCheck, Eye, FileText, Headphones, Mail, Megaphone, MessageCircleHeart, MousePointerClick, Percent, Sparkles, Users } from "lucide-react";
import { getDashboardStats } from "@/db/admin-queries";
import { db } from "@/db";
import { adminAuditLogs, contactMessages } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AdminCard, Badge, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة القيادة" };

const ACTION_AR: Record<string, string> = {
  CREATE: "إنشاء",
  UPDATE: "تعديل",
  DELETE: "حذف",
  LOGIN: "دخول",
  LOGOUT: "خروج",
  STATUS: "تغيير حالة",
};

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getDashboardStats();
  const [latestMessages, latestLogs] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(4),
    db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(6),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة القيادة" subtitle="نظرة حيّة على محتوى نور — كل الأرقام مأخوذة الآن من قاعدة البيانات." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard tone="navy" icon={<BookOpen className="size-6" aria-hidden />} label="سور القرآن" value={toArabicDigits(stats.surahs)} hint="مصدر: Tanzil Uthmani" />
        <StatCard tone="navy" icon={<FileText className="size-6" aria-hidden />} label="آيات المصحف" value={toArabicDigits(stats.verses)} />
        <StatCard icon={<BookOpenCheck className="size-6" aria-hidden />} label="التفسير الميسّر" value={toArabicDigits(stats.tafsirs)} hint="مجمع الملك فهد" />
        <StatCard icon={<Headphones className="size-6" aria-hidden />} label="مكتبة القرّاء" value={toArabicDigits(stats.reciters)} hint="١١٤ سورة لكل قارئ" />
        <StatCard icon={<MessageCircleHeart className="size-6" aria-hidden />} label="اسأل نور" value={toArabicDigits(stats.qaItems)} hint="مسائل شرعية موثقة" />
        <StatCard icon={<Sparkles className="size-6" aria-hidden />} label="الأذكار" value={toArabicDigits(stats.adhkar)} hint={`${toArabicDigits(stats.adhkarCategories)} فئة`} />
        <StatCard tone="gold" icon={<Mail className="size-6" aria-hidden />} label="رسائل التواصل" value={toArabicDigits(stats.messagesTotal)} hint={stats.messagesNew > 0 ? `${toArabicDigits(stats.messagesNew)} جديدة` : "لا جديد"} />
        <StatCard icon={<Megaphone className="size-6" aria-hidden />} label="الإعلانات" value={toArabicDigits(stats.adsTotal)} hint={`${toArabicDigits(stats.adsActive)} نشط`} />
      </div>

      <AdminCard className="flex items-center gap-4 p-4">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-surface-2 text-sub">
          <Users className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-bold text-sub">المستخدمون</p>
          <p className="mt-0.5 text-sm font-semibold leading-6 text-ink">
            لا يوجد نظام حسابات مستخدمين بعد — بيانات الزوار محلية على أجهزتهم (مفضلة/موضع قراءة).
          </p>
        </div>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Latest messages */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink">أحدث الرسائل</h2>
            <Link href="/admin/messages" className="text-xs font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">
              الكل
            </Link>
          </div>
          {latestMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-sub">لا توجد رسائل بعد</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {latestMessages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/admin/messages/${m.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{m.name}</p>
                      <p className="mt-0.5 truncate text-xs text-sub">{m.message}</p>
                    </div>
                    <Badge tone={m.status === "NEW" ? "gold" : "gray"}>
                      {m.status === "NEW" ? "جديدة" : m.status === "READ" ? "مقروءة" : m.status === "REPLIED" ? "مُجابة" : "مؤرشفة"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {/* Audit trail */}
        <AdminCard className="p-5">
          <h2 className="font-bold text-ink">سجل العمليات — Audit Log</h2>
          {latestLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-sub">لا توجد عمليات مسجلة بعد</p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {latestLogs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-surface-2">
                  <span className="font-bold text-ink">
                    {ACTION_AR[l.action] ?? l.action} · {l.entity}
                    {l.entityId ? ` #${l.entityId}` : ""}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-sub" dir="ltr">
                    {l.createdAt.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
