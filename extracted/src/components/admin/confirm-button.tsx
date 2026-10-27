"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmDeleteButton({
  label,
  message,
  onConfirm,
  compact = false,
}: {
  /** النص على الزر */
  label: string;
  /** نص التأكيد داخل النافذة */
  message: string;
  /** server action يحذف ويعيد { ok, error? } */
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = () => {
    setError("");
    startTransition(async () => {
      const res = await onConfirm();
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "تعذّر الحذف — حاول مجددًا.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-bold transition-[background-color,color,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand",
          compact
            ? "size-9 text-sub hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold"
            : "h-10 border border-line bg-surface px-3.5 text-xs text-sub hover:border-gold hover:text-gold-deep dark:hover:text-gold"
        )}
      >
        <Trash2 className="size-4" aria-hidden />
        {!compact && label}
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="تأكيد الحذف" className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-navy-deep/50 backdrop-blur-sm animate-fade-in"
          />
          <div className="relative w-full max-w-sm animate-scale-in rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold-deep dark:text-gold">
                <TriangleAlert className="size-6" aria-hidden />
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق النافذة"
                className="inline-flex size-9 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">{label}</h2>
            <p className="mt-2 text-sm leading-7 text-sub">{message}</p>
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs font-bold text-gold-deep dark:text-gold">
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={run}
                disabled={pending}
                aria-busy={pending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gold-deep text-sm font-bold text-white transition-[transform,background-color] duration-150 hover:bg-gold-deep/90 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                {pending && <Loader2 className="size-4.5 animate-spin" aria-hidden />}
                {pending ? "جارٍ الحذف…" : "نعم، احذف"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
