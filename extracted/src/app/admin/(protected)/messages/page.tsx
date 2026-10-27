import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, MESSAGE_STATUSES, type MessageStatus } from "@/db/schema";
import { AdminCard, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "الرسائل" };

const PER_PAGE = 15;

const STATUS_AR: Record<MessageStatus, string> = {
  NEW: "جديدة",
  READ: "مقروءة",
  REPLIED: "مُجابة",
  ARCHIVED: "مؤرشفة",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = MESSAGE_STATUSES.includes(sp.status as MessageStatus) ? (sp.status as MessageStatus) : null;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = status ? eq(contactMessages.status, status) : undefined;

  const [messages, [{ count }]] = await Promise.all([
    db
      .select()
      .from(contactMessages)
      .where(where)
      .orderBy(desc(contactMessages.createdAt))
      .limit(PER_PAGE + 1)
      .offset((page - 1) * PER_PAGE),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(contactMessages)
      .where(where),
  ]);

  const hasNext = messages.length > PER_PAGE;
  const shown = messages.slice(0, PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));

  return (
    <div className="space-y-6">
      <PageHeader title="الرسائل" subtitle={`${toArabicDigits(count)} رسالة${status ? ` بحالة «${STATUS_AR[status]}»` : ""} — من نموذج اتصل بنا.`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="تصفية حسب الحالة">
        {[{ key: "", label: "الكل" }, ...MESSAGE_STATUSES.map((s) => ({ key: s, label: STATUS_AR[s] }))].map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/messages?status=${f.key}` : "/admin/messages"}
            role="tab"
            aria-selected={(status ?? "") === f.key}
            className={cn(
              "inline-flex h-10 items-center rounded-xl px-4 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
              (status ?? "") === f.key ? "bg-brand text-brand-fg" : "border border-line bg-surface text-sub hover:border-brand/50 hover:text-brand"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="لا توجد رسائل" hint="عندما يراسلك أحد من صفحة اتصل بنا ستظهر رسالته هنا." />
      ) : (
        <ul className="space-y-2">
          {shown.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/messages/${m.id}`}
                className="block focus-visible:outline-2 focus-visible:outline-brand rounded-2xl"
              >
                <AdminCard
                  className={cn(
                    "flex items-center gap-3.5 p-4 transition-colors hover:border-brand/40",
                    m.status === "NEW" && "border-s-4 border-s-gold"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink">{m.name}</p>
                      <Badge tone={m.status === "NEW" ? "gold" : m.status === "REPLIED" ? "teal" : "gray"}>
                        {STATUS_AR[m.status as MessageStatus]}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-sub" dir="ltr">{m.email}</p>
                    <p className="mt-1 line-clamp-1 text-sm leading-6 text-sub">{m.message}</p>
                  </div>
                  <span className="shrink-0 text-[0.68rem] font-semibold tabular-nums text-sub" dir="ltr">
                    {m.createdAt.toLocaleDateString("en-GB")}
                  </span>
                </AdminCard>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="ترقيم الصفحات" className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/messages?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="inline-flex h-10 items-center rounded-xl border border-line px-4 text-xs font-bold text-sub hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              السابق
            </Link>
          )}
          <span className="text-xs font-bold text-sub">
            صفحة {toArabicDigits(page)} من {toArabicDigits(totalPages)}
          </span>
          {hasNext && (
            <Link
              href={`/admin/messages?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="inline-flex h-10 items-center rounded-xl border border-line px-4 text-xs font-bold text-sub hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              التالي
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
