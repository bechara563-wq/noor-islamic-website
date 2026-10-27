"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookA, Check, ChevronLeft, Loader2, Pencil, Plus, Search, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions/adhkar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-button";
import { AdminCard, EmptyState } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

type Category = { id: number; title: string; count: number };

export default function CategoriesManager({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = query.trim()
    ? categories.filter((c) => c.title.includes(query.trim()))
    : categories;

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    fd.set("title", newTitle);
    startTransition(async () => {
      const res = await createCategory(fd);
      if (res.ok) {
        setNewTitle("");
        flash("أُضيفت الفئة بنجاح");
        router.refresh();
      } else setError(res.error ?? "تعذّرت الإضافة");
    });
  };

  const submitEdit = (id: number) => {
    setError("");
    const fd = new FormData();
    fd.set("title", editTitle);
    startTransition(async () => {
      const res = await updateCategory(id, fd);
      if (res.ok) {
        setEditingId(null);
        flash("حُفظ التعديل");
        router.refresh();
      } else setError(res.error ?? "تعذّر الحفظ");
    });
  };

  return (
    <div className="space-y-4">
      {/* Create */}
      <AdminCard className="p-4 sm:p-5">
        <form onSubmit={submitNew} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Plus className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sub" aria-hidden />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="اسم فئة جديدة (مثال: أذكار الصدقة)"
              aria-label="اسم فئة جديدة"
              className="h-12 w-full rounded-xl border border-line bg-canvas ps-11 pe-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
            />
          </div>
          <button
            type="submit"
            disabled={pending || newTitle.trim().length < 3}
            aria-busy={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            {pending && <Loader2 className="size-4.5 animate-spin" aria-hidden />}
            إضافة فئة
          </button>
        </form>
        {error && <p role="alert" className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs font-bold text-gold-deep dark:text-gold">{error}</p>}
        {notice && <p role="status" className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-soft px-3 py-2 text-xs font-bold text-brand"><Check className="size-4" aria-hidden />{notice}</p>}
      </AdminCard>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sub" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="تصفية الفئات…"
          aria-label="تصفية الفئات"
          className="h-11 w-full rounded-xl border border-line bg-surface ps-11 pe-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد فئات مطابقة" hint="جرّب كلمة أخرى أو أضف فئة جديدة." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => (
            <li key={c.id}>
              <AdminCard className="flex items-center gap-3 p-3.5">
                {editingId === c.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="تعديل اسم الفئة"
                      autoFocus
                      className="h-11 flex-1 rounded-xl border border-brand bg-canvas px-3.5 text-sm font-bold text-ink focus:outline-2 focus:outline-brand dark:bg-surface-2"
                    />
                    <button
                      type="button"
                      onClick={() => submitEdit(c.id)}
                      disabled={pending}
                      aria-label="حفظ"
                      className="inline-flex size-11 items-center justify-center rounded-xl bg-brand text-brand-fg transition-colors hover:bg-brand-deep disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <Check className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="إلغاء"
                      className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-sub hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <X className="size-5" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <BookA className="size-5.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{c.title}</p>
                      <p className="text-[0.7rem] font-semibold text-sub">{toArabicDigits(c.count)} ذكرًا</p>
                    </div>
                    <Link
                      href={`/admin/adhkar/${c.id}`}
                      aria-label={`إدارة أذكار ${c.title}`}
                      className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-xs font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      الأذكار
                      <ChevronLeft className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditTitle(c.title);
                      }}
                      aria-label={`تعديل فئة ${c.title}`}
                      className="inline-flex size-10 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <Pencil className="size-4.5" aria-hidden />
                    </button>
                    <ConfirmDeleteButton
                      compact
                      label={`حذف فئة «${c.title}»`}
                      message={`سيتم حذف الفئة وجميع أذكارها (${toArabicDigits(c.count)}). هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه.`}
                      onConfirm={() => deleteCategory(c.id)}
                    />
                  </>
                )}
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
