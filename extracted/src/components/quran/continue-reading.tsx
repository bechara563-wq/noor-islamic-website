"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, MoveLeft } from "lucide-react";
import { getLastReading, subscribeNoorStore, type LastReading } from "@/lib/noor-storage";
import { toArabicDigits } from "@/lib/arabic";

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${toArabicDigits(mins)} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${toArabicDigits(hours)} ساعة`;
  const days = Math.floor(hours / 24);
  return `قبل ${toArabicDigits(days)} ${days === 1 ? "يوم" : "أيام"}`;
}

export function ContinueReadingCard() {
  const [saved, setSaved] = useState<LastReading | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(getLastReading());
    return subscribeNoorStore(() => setSaved(getLastReading()));
  }, []);

  if (!mounted || !saved) return null;

  return (
    <Link
      href={`/quran/${saved.surahId}?v=${saved.ayah}`}
      className="ripple-host group flex items-center gap-4 rounded-2xl border border-gold/40 bg-gradient-to-l from-gold/10 to-transparent p-4 shadow-[0_1px_2px_rgb(16_42_67/0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold/70 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep dark:text-gold">
        <BookOpen className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.7rem] font-bold tracking-wide text-gold-deep dark:text-gold">
          متابعة آخر قراءة · {timeAgo(saved.at)}
        </span>
        <span className="mt-0.5 block truncate text-base font-bold text-ink">
          سورة {saved.surahName} — الآية {toArabicDigits(saved.ayah)}
        </span>
      </span>
      <MoveLeft
        className="size-5 shrink-0 text-gold-deep transition-transform duration-200 group-hover:-translate-x-1 dark:text-gold"
        aria-hidden
      />
    </Link>
  );
}

/** Smart button for home quran section — goes to saved position or /quran */
export function ContinueReadingButton({ className }: { className?: string }) {
  const [href, setHref] = useState("/quran");

  useEffect(() => {
    const saved = getLastReading();
    if (saved) setHref(`/quran/${saved.surahId}?v=${saved.ayah}`);
    return subscribeNoorStore(() => {
      const s = getLastReading();
      setHref(s ? `/quran/${s.surahId}?v=${s.ayah}` : "/quran");
    });
  }, []);

  return (
    <Link
      href={href}
      className={
        className ??
        "ripple-host inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-2xl border border-ivory/20 bg-navy px-7 text-base font-semibold text-ivory transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-navy-soft active:scale-[0.98] dark:bg-surface-2 dark:text-ink dark:hover:bg-line"
      }
    >
      <BookOpen className="size-5" aria-hidden />
      متابعة آخر قراءة
    </Link>
  );
}
