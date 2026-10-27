import { BadgeDollarSign, Code2, Globe2, Power } from "lucide-react";
import { getAdSenseConfig } from "@/lib/adsense";
import { requireAdmin } from "@/lib/auth";
import { AdminCard, Badge, PageHeader } from "@/components/admin/ui";
import AdSenseForm from "./adsense-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Google AdSense" };

export default async function AdminAdSensePage() {
  await requireAdmin();
  const cfg = await getAdSenseConfig();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Google AdSense"
        subtitle="إدارة معرّف الناشر وعلامة إثبات الملكية الوصفية — القيم محفوظة في PostgreSQL وتُحقن تلقائيًا داخل ‹head› لكل الصفحات."
      />

      {/* Live status */}
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard className="flex items-center gap-3 p-4">
          <span className={`inline-flex size-11 items-center justify-center rounded-xl ${cfg.enabled ? "bg-brand-soft text-brand" : "bg-surface-2 text-sub"}`}>
            <Power className="size-5.5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold text-sub">الحالة</p>
            <Badge tone={cfg.enabled ? "teal" : "gray"}>
              {cfg.enabled ? "مفعّل — ON" : "معطّل — OFF"}
            </Badge>
          </div>
        </AdminCard>
        <AdminCard className="flex items-center gap-3 p-4">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-surface-2 text-sub">
            <BadgeDollarSign className="size-5.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sub">Client ID الحالي</p>
            <p className="truncate font-mono text-xs font-bold text-ink" dir="ltr">
              {cfg.clientId || "—"}
            </p>
          </div>
        </AdminCard>
        <AdminCard className="flex items-center gap-3 p-4 sm:col-span-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-deep dark:text-gold">
            <Code2 className="size-5.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sub">العلامة المحقونة حاليًا داخل ‹head›</p>
            <p className="break-all font-mono text-[0.7rem] leading-5 text-ink" dir="ltr">
              {cfg.enabled && cfg.metaTag ? cfg.metaTag : "لا شيء — التفعيل معطّل"}
            </p>
          </div>
        </AdminCard>
      </div>

      <AdSenseForm initial={cfg} />

      <AdminCard className="flex items-start gap-3 p-4">
        <Globe2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <p className="text-xs leading-6 text-sub">
          عند الحفظ يُبطَل الكاش ويُعاد بناء ‹head› لجميع الصفحات تلقائيًا. عند التعطيل تُزال
          العلامة الوصفية ويتوقف تحميل سكربت AdSense تمامًا دون حذف إعداداتك المحفوظة.
        </p>
      </AdminCard>
    </div>
  );
}
