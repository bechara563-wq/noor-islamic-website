import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Mail, Trash2 } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, type MessageStatus } from "@/db/schema";
import { deleteMessage, setMessageStatus } from "@/app/admin/actions/messages";
import { ConfirmDeleteButton } from "@/components/admin/confirm-button";
import { AdminCard } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "الرسالة" };

const STATUS_AR: Record<MessageStatus, string> = {
  NEW: "جديدة",
  READ: "مقروءة",
  REPLIED: "مُجابة",
  ARCHIVED: "مؤرشفة",
};

export default async function AdminMessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [m] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!m) notFound();

  // Opening a NEW message marks it READ (explicit, auditable).
  if (m.status === "NEW") {
    await setMessageStatus(id, "READ");
    m.status = "READ";
  }

  async function markStatus(status: MessageStatus) {
    "use server";
    await setMessageStatus(id, status);
  }

  async function remove() {
    "use server";
    const res = await deleteMessage(id);
    if (res.ok) redirect("/admin/messages");
    return res;
  }

  return (
    <div className="space-y-6">
      <nav aria-label="مسار التنقل">
        <Link
          href="/admin/messages"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ChevronRight className="size-4.5" aria-hidden />
          الرسائل
        </Link>
      </nav>

      <AdminCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink">{m.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-sub" dir="ltr">
              <Mail className="size-4" aria-hidden />
              {m.email}
            </p>
            <p className="mt-1 text-xs font-semibold text-sub">
              رسالة رقم {toArabicDigits(m.id)} ·{" "}
              <span dir="ltr">{m.createdAt.toLocaleString("en-GB")}</span>
            </p>
          </div>
          <ConfirmDeleteButton
            label="حذف الرسالة"
            message="هل أنت متأكد من حذف هذه الرسالة نهائيًا من قاعدة البيانات؟"
            onConfirm={remove as unknown as () => Promise<{ ok: boolean; error?: string }>}
          />
        </div>

        <div className="mt-6 rounded-2xl bg-canvas p-5 dark:bg-surface-2">
          <p className="whitespace-pre-wrap text-[0.95rem] leading-8 text-ink">{m.message}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
          <span className="text-xs font-bold text-sub">تغيير الحالة:</span>
          {(Object.keys(STATUS_AR) as MessageStatus[]).map((s) => (
            <form key={s} action={markStatus.bind(null, s)}>
              <button
                type="submit"
                disabled={m.status === s}
                aria-pressed={m.status === s}
                className={
                  m.status === s
                    ? "inline-flex h-10 items-center rounded-xl bg-brand px-4 text-xs font-bold text-brand-fg"
                    : "inline-flex h-10 items-center rounded-xl border border-line px-4 text-xs font-bold text-sub transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-100 focus-visible:outline-2 focus-visible:outline-brand"
                }
              >
                {STATUS_AR[s]}
              </button>
            </form>
          ))}
          <a
            href={`mailto:${m.email}?subject=${encodeURIComponent("ردًا على رسالتك في نور")}`}
            className="ms-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold px-4 text-xs font-bold text-navy transition-colors hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            <Mail className="size-4" aria-hidden />
            الرد بالبريد
          </a>
        </div>
      </AdminCard>
    </div>
  );
}
