"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, Pencil, Plus, RotateCcw, Search, X } from "lucide-react";
import {
  createDhikr, deleteDhikr, toggleDhikrPublished, updateDhikr,
} from "@/app/admin/actions/adhkar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-button";
import { AdminCard, Badge, EmptyState } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

type Item = { id: number; text: string; repeat: number; source: string; isPublished: boolean };

export default function DhikrManager({ categoryId, items }: { categoryId: number; items: Item[] }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = query.trim()
    ? items.filter((i) => i.text.includes(query.trim()) || i.source.includes(query.trim()))
    : items;

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing
        ? await updateDhikr(editing.id, categoryId, fd)
        : await createDhikr(categoryId, fd);
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        flash(editing ? "حُفظ التعديل" : "أُضيف الذكر بنجاح");
        router.refresh();
      } else setError(res.error ?? "تعذّر الحفظ");
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setEditing(null);
            setError("");
          }}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          {showForm ? <X className="size-4.5" aria-hidden /> : <Plus className="size-4.5" aria-hidden />}
          {showForm ? "إغلاق النموذج" : "إضافة ذكر"}
        </button>
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sub" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في نص الذكر أو مصدره…"
            aria-label="ابحث في الأذكار"
            className="h-12 w-full rounded-xl border border-line bg-surface ps-11 pe-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand"
          />
        </div>
      </div>

      {notice && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-4 py-2.5 text-xs font-bold text-brand">
          <Check className="size-4" aria-hidden />
          {notice}
        </p>
      )}

      {/* Create / Edit form */}
      {(showForm || editing) && (
        <AdminCard className="p-5">
          <h2 className="font-bold text-ink">{editing ? "تعديل الذكر" : "ذكر جديد"}</h2>
          <form key={editing?.id ?? "new"} onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="text" className="mb-1.5 block text-sm font-bold text-ink">نص الذكر</label>
              <textarea
                id="text"
                name="text"
                required
                minLength={10}
                rows={4}
                defaultValue={editing?.text ?? ""}
                placeholder="اكتب نص الذكر كاملًا بدقة…"
                className="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-8 text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="repeat" className="mb-1.5 block text-sm font-bold text-ink">عدد التكرار</label>
                <input
                  id="repeat"
                  name="repeat"
                  type="number"
                  required
                  min={1}
                  max={10000}
                  defaultValue={editing?.repeat ?? 1}
                  className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
                />
              </div>
              <div>
                <label htmlFor="source" className="mb-1.5 block text-sm font-bold text-ink">
                  المصدر <span className="text-gold-deep dark:text-gold">*</span>
                </label>
                <input
                  id="source"
                  name="source"
                  required
                  minLength={3}
                  defaultValue={editing?.source ?? ""}
                  placeholder="مثال: صحيح مسلم ٢٦٦٣"
                  className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
                />
                <p className="mt-1.5 text-[0.68rem] font-semibold text-sub">إلزامي — لا ننشر ذكرًا أو حديثًا بلا مصدر.</p>
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
                {editing ? "حفظ التعديلات" : "إضافة الذكر"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setError(""); }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-line px-5 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <RotateCcw className="size-4" aria-hidden />
                إلغاء
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState title="لا توجد أذكار" hint="أضف أول ذكر لهذه الفئة من الزر أعلاه." />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item, idx) => (
            <li key={item.id}>
              <AdminCard className={cn("p-4 transition-opacity", !item.isPublished && "opacity-60")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.68rem] font-bold text-sub">#{toArabicDigits(idx + 1)}</span>
                      <Badge tone="teal">تكرار {toArabicDigits(item.repeat)}</Badge>
                      <Badge tone={item.isPublished ? "navy" : "gold"}>{item.isPublished ? "منشور" : "مخفي"}</Badge>
                    </div>
                    <p className="quran-font mt-2 line-clamp-2 text-[1.05rem] leading-8 text-quran-ink">{item.text}</p>
                    <p className="mt-1.5 text-[0.7rem] font-semibold text-sub">المصدر: {item.source}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          await toggleDhikrPublished(item.id, categoryId, !item.isPublished);
                          router.refresh();
                        })
                      }
                      disabled={pending}
                      aria-label={item.isPublished ? "إخفاء الذكر" : "نشر الذكر"}
                      title={item.isPublished ? "إخفاء" : "نشر"}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {item.isPublished ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditing(item); setShowForm(false); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      aria-label="تعديل الذكر"
                      className="inline-flex size-9 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <Pencil className="size-4.5" aria-hidden />
                    </button>
                    <ConfirmDeleteButton
                      compact
                      label="حذف الذكر"
                      message="هل أنت متأكد من حذف هذا الذكر نهائيًا؟ لا يمكن التراجع."
                      onConfirm={() => deleteDhikr(item.id, categoryId)}
                    />
                  </div>
                </div>
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
