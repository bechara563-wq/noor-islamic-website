"use client";

import { useEffect, useState } from "react";
import { Minus, RotateCcw, Target } from "lucide-react";
import { getTasbeeh, setTasbeeh, type TasbeehState } from "@/lib/noor-storage";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

const PHRASES = [
  "سُبْحَانَ الله",
  "الْحَمْدُ لِلَّه",
  "اللهُ أَكْبَر",
  "لَا إِلَهَ إِلَّا الله",
  "أَسْتَغْفِرُ الله",
  "سُبْحَانَ اللهِ وَبِحَمْدِه",
];
const GOALS = [33, 100, 1000];

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* silent */
  }
}

export default function TasbeehCounter() {
  const [state, setState] = useState<TasbeehState>({ v: 1, count: 0, total: 0, phraseIndex: 0, goal: 33 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(getTasbeeh());
    setMounted(true);
  }, []);

  const update = (patch: Partial<TasbeehState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      setTasbeeh(next);
      return next;
    });
  };

  const increment = () => {
    const done = state.count >= state.goal;
    vibrate(done ? 12 : 8);
    const nextCount = state.count + 1;
    if (nextCount === state.goal) vibrate([25, 50, 25]);
    else if (nextCount % 33 === 0) vibrate(20);
    update({ count: nextCount, total: state.total + 1 });
  };

  const decrement = () => {
    if (state.count === 0) return;
    vibrate(5);
    update({ count: state.count - 1 });
  };

  const reset = () => {
    vibrate(15);
    update({ count: 0 });
  };

  const progress = Math.min((state.count / state.goal) * 100, 100);
  const reachedGoal = state.count >= state.goal;
  const ring = 2 * Math.PI * 52;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      {/* Phrase picker */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar px-1 pb-1 -mx-1 max-w-full"
        role="listbox"
        aria-label="اختيار الذكر"
      >
        {PHRASES.map((p, i) => (
          <button
            key={p}
            type="button"
            role="option"
            aria-selected={state.phraseIndex === i}
            onClick={() => {
              vibrate(5);
              update({ phraseIndex: i });
            }}
            className={cn(
              "quran-font shrink-0 rounded-xl border px-4 py-2.5 text-[1.05rem] leading-8 transition-[background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-brand",
              state.phraseIndex === i
                ? "border-brand bg-brand-soft text-brand"
                : "border-line bg-surface text-sub hover:border-brand/50 hover:text-brand"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main counter */}
      <button
        type="button"
        onClick={increment}
        aria-label={`سبّح — العدد الحالي ${state.count}`}
        className={cn(
          "ripple-host group relative mt-8 flex size-64 touch-manipulation select-none flex-col items-center justify-center rounded-full border-4 bg-quran-surface transition-[transform,border-color,box-shadow] duration-150 active:scale-[0.97]",
          "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-4",
          reachedGoal
            ? "border-gold shadow-[0_0_60px_-12px_rgb(212_175_106/0.55)]"
            : "border-line shadow-[0_20px_50px_-20px_rgb(16_42_67/0.3)] hover:border-brand/50"
        )}
      >
        {/* progress ring */}
        <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r="52" fill="none" className="stroke-surface-2" strokeWidth="5" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={reachedGoal ? "#D4AF6A" : "var(--brand)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ring}
            strokeDashoffset={ring - (ring * progress) / 100}
            className="transition-[stroke-dashoffset] duration-200"
          />
        </svg>
        <span className="quran-font px-8 text-center text-2xl leading-snug text-quran-ink">
          {PHRASES[state.phraseIndex]}
        </span>
        <span
          className={cn(
            "mt-1 text-6xl font-bold tabular-nums tracking-tight",
            reachedGoal ? "text-gold-deep dark:text-gold" : "text-brand"
          )}
          dir="ltr"
          aria-live="polite"
        >
          {mounted ? state.count : 0}
        </span>
        <span className="mt-1 text-xs font-bold text-sub">اضغط للتسبيح</span>
      </button>

      {/* Secondary actions */}
      <div className="mt-7 flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={!mounted || state.count === 0}
          aria-label="إنقاص العدد"
          className="inline-flex size-13 items-center justify-center rounded-2xl border border-line bg-surface text-sub transition-[background-color,color,transform] duration-150 hover:border-brand hover:text-brand active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          <Minus className="size-5.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!mounted || state.count === 0}
          aria-label="إعادة ضبط العدد"
          className="inline-flex h-13 items-center gap-2 rounded-2xl border border-line bg-surface px-5 text-sm font-bold text-sub transition-[background-color,color,transform] duration-150 hover:border-gold hover:text-gold-deep active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 dark:hover:text-gold"
        >
          <RotateCcw className="size-4.5" aria-hidden />
          إعادة ضبط
        </button>
      </div>

      {/* Goal + total */}
      <div className="mt-7 flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center gap-2">
          <Target className="size-4.5 text-brand" aria-hidden />
          <span className="text-xs font-bold text-sub">الهدف</span>
          <div className="flex gap-1" role="radiogroup" aria-label="هدف التكرار">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={state.goal === g}
                onClick={() => update({ goal: g })}
                className={cn(
                  "h-9 rounded-lg px-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                  state.goal === g ? "bg-brand text-brand-fg" : "bg-surface-2 text-sub hover:text-brand"
                )}
              >
                {toArabicDigits(g)}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs font-bold text-sub">
          الإجمالي: <span className="text-brand">{toArabicDigits(mounted ? state.total : 0)}</span>
        </span>
      </div>
    </div>
  );
}
