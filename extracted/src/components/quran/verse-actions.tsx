"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Bookmark, Check, Copy, Share2, Star, X } from "lucide-react";
import { getFavoriteVerses, setLastReading, subscribeNoorStore, toggleFavoriteVerse } from "@/lib/noor-storage";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

type Done = "copy" | "share" | "pin" | null;

export default function VerseActions({
  surahId,
  surahName,
  ayah,
  tafsirText,
}: {
  surahId: number;
  surahName: string;
  ayah: number;
  tafsirText?: string;
}) {
  const [isFav, setIsFav] = useState(false);
  const [done, setDone] = useState<Done>(null);
  const [mounted, setMounted] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () =>
      setIsFav(getFavoriteVerses().some((f) => f.surahId === surahId && f.ayah === ayah));
    sync();
    return subscribeNoorStore(sync);
  }, [surahId, ayah]);

  const verseText = () =>
    hostRef.current
      ?.closest("[data-ayah]")
      ?.querySelector("[data-text]")
      ?.textContent?.trim() ?? "";

  const flash = (kind: Exclude<Done, null>) => {
    setDone(kind);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(null), 1600);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${verseText()}\n﴾${toArabicDigits(ayah)}﴿ — سورة ${surahName}`
      );
      flash("copy");
    } catch {
      flash("copy");
    }
  };

  const share = async () => {
    const text = `${verseText()}\n﴾${toArabicDigits(ayah)}﴿ — سورة ${surahName}`;
    const url = `${window.location.origin}/quran/${surahId}?v=${ayah}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `سورة ${surahName} — الآية ${ayah}`, text, url });
        flash("share");
        return;
      } catch {
        return; // user dismissed — stay silent
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      flash("share");
    } catch {
      /* ignore */
    }
  };

  const pin = () => {
    setLastReading({ surahId, surahName, ayah });
    flash("pin");
  };

  const favorite = () => {
    const now = toggleFavoriteVerse({ surahId, surahName, ayah });
    setIsFav(now);
  };

  const btn =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[0.72rem] font-bold transition-[background-color,color,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <div
      ref={hostRef}
      className="mt-1 flex items-center justify-end gap-0.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
      role="group"
      aria-label="أدوات الآية"
    >
      {tafsirText && (
        <button
          type="button"
          onClick={() => setShowTafsir(true)}
          aria-label="تفسير الآية"
          className={cn(btn, "text-sub hover:bg-brand-soft hover:text-brand")}
        >
          <BookOpen className="size-4" aria-hidden />
          <span className="hidden sm:inline">التفسير</span>
        </button>
      )}
      <button type="button" onClick={pin} aria-label="تثبيت موضع القراءة عند هذه الآية" className={cn(btn, "text-sub hover:bg-brand-soft hover:text-brand")}>
        {done === "pin" ? <Check className="size-4 text-brand" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        <span className="hidden sm:inline">{done === "pin" ? "تم" : "تثبيت"}</span>
      </button>
      <button type="button" onClick={copy} aria-label="نسخ الآية" className={cn(btn, "text-sub hover:bg-brand-soft hover:text-brand")}>
        {done === "copy" ? <Check className="size-4 text-brand" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span className="hidden sm:inline">{done === "copy" ? "تم النسخ" : "نسخ"}</span>
      </button>
      <button type="button" onClick={share} aria-label="مشاركة الآية" className={cn(btn, "text-sub hover:bg-brand-soft hover:text-brand")}>
        {done === "share" ? <Check className="size-4 text-brand" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
        <span className="hidden sm:inline">{done === "share" ? "تم" : "مشاركة"}</span>
      </button>
      <button
        type="button"
        onClick={favorite}
        aria-pressed={mounted && isFav}
        aria-label={isFav ? "إزالة الآية من المفضلة" : "إضافة الآية إلى المفضلة"}
        className={cn(btn, isFav ? "text-gold-deep hover:bg-gold/10 dark:text-gold" : "text-sub hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold")}
      >
        <Star className={cn("size-4", mounted && isFav && "fill-current")} aria-hidden />
        <span className="hidden sm:inline">{mounted && isFav ? "محفوظة" : "مفضلة"}</span>
      </button>

      {/* Tafsir Modal */}
      {showTafsir && tafsirText && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`تفسير الآية ${toArabicDigits(ayah)} من سورة ${surahName}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowTafsir(false)}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-2xl animate-scale-in sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <BookOpen className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-ink">
                    تفسير الآية {toArabicDigits(ayah)}
                  </h3>
                  <p className="text-xs font-semibold text-gold-deep dark:text-gold">
                    سورة {surahName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTafsir(false)}
                aria-label="إغلاق"
                className="inline-flex size-9 items-center justify-center rounded-xl text-sub hover:bg-brand-soft hover:text-brand"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {/* Ayah snippet */}
            <div className="my-5 rounded-2xl border border-gold/30 bg-quran-surface p-4">
              <p className="quran-font text-center text-lg leading-loose text-quran-ink">
                {verseText()}
                <span className="ayah-marker quran-font ms-2">
                  {toArabicDigits(ayah)}
                </span>
              </p>
            </div>

            {/* Tafsir text */}
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest text-brand">
                التفسير الميسّر
              </p>
              <p className="text-sm leading-8 text-ink sm:text-[0.95rem]">
                {tafsirText}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs text-sub">
              <span>المصدر: مجمع الملك فهد لطباعة المصحف الشريف</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `تفسير الآية (${ayah}) من سورة ${surahName}:\n${tafsirText}\n— التفسير الميسر`
                  );
                  flash("copy");
                }}
                className="inline-flex items-center gap-1 font-bold text-brand hover:underline"
              >
                <Copy className="size-3.5" aria-hidden />
                نسخ التفسير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
