"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import Button from "@/components/ui/button";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

export type DhikrItem = { id: number; text: string; repeat: number; source: string };

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported — stay silent */
  }
}

export default function DhikrSession({ items }: { items: DhikrItem[] }) {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<Record<number, number>>({});

  const item = items[index];
  const current = counts[item.id] ?? 0;
  const done = current >= item.repeat;

  const totalDone = useMemo(
    () => items.filter((i) => (counts[i.id] ?? 0) >= i.repeat).length,
    [counts, items]
  );
  const sessionProgress = Math.round((totalDone / items.length) * 100);

  const increment = useCallback(() => {
    vibrate(8);
    setCounts((prev) => {
      const nextVal = Math.min((prev[item.id] ?? 0) + 1, item.repeat);
      if (nextVal === item.repeat && (prev[item.id] ?? 0) < item.repeat) {
        vibrate([20, 40, 20]);
        // Auto-advance after a short beat when the dhikr completes
        if (index < items.length - 1) {
          setTimeout(() => setIndex((i) => Math.min(i + 1, items.length - 1)), 450);
        }
      }
      return { ...prev, [item.id]: nextVal };
    });
  }, [item.id, item.repeat, index, items.length]);

  const reset = () => {
    vibrate(6);
    setCounts((prev) => ({ ...prev, [item.id]: 0 }));
  };

  const go = (dir: 1 | -1) => {
    vibrate(5);
    setIndex((i) => Math.min(Math.max(i + dir, 0), items.length - 1));
  };

  const counterProgress = Math.min((current / item.repeat) * 100, 100);

  return (
    <div>
      {/* Session progress */}
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between text-xs font-bold text-sub">
          <span>
            الذكر {toArabicDigits(index + 1)} من {toArabicDigits(items.length)}
          </span>
          <span>
            أُتمّ {toArabicDigits(totalDone)} — {toArabicDigits(sessionProgress)}٪
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={sessionProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="تقدم الجلسة"
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-brand to-gold transition-[width] duration-500"
            style={{ width: `${sessionProgress}%` }}
          />
        </div>
      </div>

      {/* Dhikr card */}
      <article
        key={item.id}
        className="mx-auto mt-6 max-w-xl animate-fade-up rounded-[1.6rem] border border-line bg-quran-surface p-6 shadow-[0_1px_2px_rgb(16_42_67/0.05),0_16px_40px_-24px_rgb(16_42_67/0.25)] sm:p-8"
      >
        <p className="quran-font min-h-28 text-[1.3rem] leading-[2.3] text-quran-ink sm:text-[1.45rem]">
          {item.text}
        </p>
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-4">
          <span className="text-[0.7rem] font-semibold leading-5 text-sub">{item.source}</span>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-[0.72rem] font-bold text-brand">
            التكرار: {toArabicDigits(item.repeat)} {item.repeat === 1 ? "مرة" : "مرات"}
          </span>
        </footer>
      </article>

      {/* Counter */}
      <div className="mx-auto mt-6 flex max-w-xl items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="الذكر التالي"
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-sub transition-[background-color,color,transform] duration-150 hover:border-brand hover:text-brand active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>

        <button
          type="button"
          onClick={done ? () => go(-1) : increment}
          aria-label={done ? "اكتمل — الانتقال للتالي" : `عدّ الذكر — ${toArabicDigits(current)} من ${toArabicDigits(item.repeat)}`}
          aria-live="polite"
          className={cn(
            "ripple-host relative h-16 flex-1 overflow-hidden rounded-2xl text-lg font-bold transition-[transform,box-shadow] duration-150 active:scale-[0.98]",
            "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
            done
              ? "bg-gold text-navy shadow-[0_10px_28px_-12px_rgb(212_175_106/0.7)]"
              : "bg-brand text-brand-fg shadow-[0_10px_28px_-12px_rgb(44_122_123/0.6)]"
          )}
        >
          {/* inline progress */}
          <span
            className={cn(
              "absolute inset-y-0 start-0 transition-[width] duration-200",
              done ? "bg-navy/10" : "bg-white/10"
            )}
            style={{ width: `${counterProgress}%` }}
            aria-hidden
          />
          <span className="relative flex items-center justify-center gap-2.5">
            {done ? (
              <>
                <Check className="size-6" aria-hidden />
                اكتمل — التالي
              </>
            ) : (
              <>
                <span className="text-2xl tabular-nums" dir="ltr">
                  {current}
                </span>
                <span className="text-sm opacity-80">/ {toArabicDigits(item.repeat)}</span>
                <span className="ms-1 hidden sm:inline">اضغط للعدّ</span>
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === items.length - 1}
          aria-label="الذكر السابق"
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-sub transition-[background-color,color,transform] duration-150 hover:border-brand hover:text-brand active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>

      {/* Reset */}
      <div className="mt-4 text-center">
        <Button variant="ghost" size="sm" onClick={reset} disabled={current === 0}>
          <RotateCcw className="size-4" aria-hidden />
          إعادة ضبط العدّاد
        </Button>
      </div>
    </div>
  );
}
