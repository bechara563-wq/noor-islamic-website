"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Eye, EyeOff, LayoutTemplate, Loader2, Megaphone,
  MousePointerClick, Percent, Pencil, Plus, X, Eye as ViewIcon,
} from "lucide-react";
import { createAd, deleteAd, toggleAd, updateAd } from "@/app/admin/actions/ads";
import { ConfirmDeleteButton } from "@/components/admin/confirm-button";
import { AdminCard, Badge, EmptyState } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";
import type { AdRow } from "./page";

const PLACEMENT_AR: Record<string, string> = {
  homepage: "الرئيسية",
  tools: "الأدوات",
  content: "المحتوى",
  footer: "الفوتر",
};

export default function AdsManager({ ads }: { ads: AdRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdRow | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing ? await updateAd(editing.id, fd) : await createAd(fd);
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        flash(editing ? "حُفظ الإعلان" : "أُنشئ الإعلان");
        router.refresh();
      } else setError(res.error ?? "تعذّر الحفظ");
    });
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2";

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => { setShowForm((v) => !v); setEditing(null); setError(""); }}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        {showForm ? <X className="size-4.5" aria-hidden /> : <Plus className="size-4.5" aria-hidden />}
        {showForm ? "إغلاق النموذج" : "إنشاء إعلان"}
      </button>

      {notice && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-4 py-2.5 text-xs font-bold text-brand">
          <Check className="size-4" aria-hidden />
          {notice}
        </p>
      )}

      {(showForm || editing) && (
        <AdminCard className="p-5">
          <h2 className="font-bold text-ink">{editing ? `تعديل: ${editing.title}` : "إعلان جديد"}</h2>
          <form key={editing?.id ?? "new"} onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-bold text-ink">العنوان *</label>
                <input id="title" name="title" required minLength={3} maxLength={180} defaultValue={editing?.title ?? ""} className={inputCls} />
              </div>
              <div>
                <label htmlFor="placement" className="mb-1.5 block text-sm font-bold text-ink">مكان العرض *</label>
                <select id="placement" name="placement" defaultValue={editing?.placement ?? "homepage"} className={inputCls}>
                  {Object.entries(PLACEMENT_AR).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="body" className="mb-1.5 block text-sm font-bold text-ink">النص الوصفي</label>
              <textarea id="body" name="body" rows={2} maxLength={600} defaultValue={editing?.body ?? ""} className="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-7 text-ink focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-bold text-ink">رابط الصورة</label>
                <input id="imageUrl" name="imageUrl" dir="ltr" defaultValue={editing?.imageUrl ?? ""} placeholder="https://…" className={cn(inputCls, "text-left")} />
              </div>
              <div>
                <label htmlFor="linkUrl" className="mb-1.5 block text-sm font-bold text-ink">رابط الوجهة</label>
                <input id="linkUrl" name="linkUrl" dir="ltr" defaultValue={editing?.linkUrl ?? ""} placeholder="https://…" className={cn(inputCls, "text-left")} />
              </div>
              <div>
                <label htmlFor="startsAt" className="mb-1.5 block text-sm font-bold text-ink">يبدأ في</label>
                <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={editing?.startsAt ?? ""} className={inputCls} />
              </div>
              <div>
                <label htmlFor="endsAt" className="mb-1.5 block text-sm font-bold text-ink">ينتهي في</label>
                <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={editing?.endsAt ?? ""} className={inputCls} />
              </div>
              <div>
                <label htmlFor="sortOrder" className="mb-1.5 block text-sm font-bold text-ink">الترتيب</label>
                <input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={editing?.sortOrder ?? 0} className={inputCls} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editing?.isActive ?? false}
                    className="size-4.5 accent-[#2C7A7B]"
                  />
                  <span className="text-sm font-bold text-ink">نشط — يظهر فورًا على الموقع</span>
                </label>
              </div>
            </div>
            {error && <p role="alert" className="rounded-lg bg-gold/10 px-3 py-2 text-xs font-bold text-gold-deep dark:text-gold">{error}</p>}
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                {pending && <Loader2 className="size-4.5 animate-spin" aria-hidden />}
                {editing ? "حفظ التعديلات" : "إنشاء الإعلان"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setError(""); }}
                className="inline-flex h-12 items-center rounded-xl border border-line px-5 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                إلغاء
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {ads.length === 0 ? (
        <EmptyState title="لا توجد إعلانات بعد" hint="أنشئ أول إعلان من الزر أعلاه — سيظهر فقط عند تفعيله وضمن مواعيده." />
      ) : (
        <ul className="space-y-2.5">
          {ads.map((ad) => {
            const ctr = ad.impressions > 0 ? Math.round((ad.clicks / ad.impressions) * 1000) / 10 : 0;
            return (
              <li key={ad.id}>
                <AdminCard className={cn("p-4", !ad.isActive && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Megaphone className="size-5.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-ink">{ad.title}</p>
                          <Badge tone="navy">{PLACEMENT_AR[ad.placement] ?? ad.placement}</Badge>
                          <Badge tone={ad.isActive ? "teal" : "gray"}>{ad.isActive ? "نشط" : "معطّل"}</Badge>
                        </div>
                        {ad.body && <p className="mt-1 line-clamp-1 text-sm text-sub">{ad.body}</p>}
                        <div className="mt-2 flex flex-wrap gap-4 text-[0.72rem] font-bold text-sub">
                          <span className="flex items-center gap-1"><ViewIcon className="size-3.5" aria-hidden /> مشاهدات: {toArabicDigits(ad.impressions)}</span>
                          <span className="flex items-center gap-1"><MousePointerClick className="size-3.5" aria-hidden /> نقرات: {toArabicDigits(ad.clicks)}</span>
                          <span className="flex items-center gap-1 text-gold-deep dark:text-gold"><Percent className="size-3.5" aria-hidden /> CTR: {toArabicDigits(ctr)}٪</span>
                          {(ad.startsAt || ad.endsAt) && (
                            <span dir="ltr">{ad.startsAt ?? "…"} → {ad.endsAt ?? "…"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            await toggleAd(ad.id, !ad.isActive);
                            router.refresh();
                            flash(ad.isActive ? "عُطِّل الإعلان" : "فُعِّل الإعلان");
                          })
                        }
                        disabled={pending}
                        aria-label={ad.isActive ? "تعطيل" : "تفعيل"}
                        title={ad.isActive ? "تعطيل" : "تفعيل"}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        {ad.isActive ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(ad); setShowForm(false); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        aria-label="تعديل الإعلان"
                        className="inline-flex size-9 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <Pencil className="size-4.5" aria-hidden />
                      </button>
                      <ConfirmDeleteButton
                        compact
                        label="حذف الإعلان"
                        message={`هل أنت متأكد من حذف إعلان «${ad.title}» وكل إحصائياته؟ لا يمكن التراجع.`}
                        onConfirm={() => deleteAd(ad.id)}
                      />
                    </div>
                  </div>
                </AdminCard>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center gap-2 text-center text-[0.7rem] font-semibold text-sub">
        <LayoutTemplate className="size-4 shrink-0" aria-hidden />
        الإعلانات تظهر في أماكنها المخصصة فقط — ولن تظهر أبدًا داخل نص المصحف أو بين الآيات.
      </p>
    </div>
  );
}
