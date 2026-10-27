"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AArrowDown, AArrowUp, BookmarkCheck, RotateCcw } from "lucide-react";
import { getFontScale, getLastReading, setFontScale, setLastReading, subscribeNoorStore } from "@/lib/noor-storage";
import { toArabicDigits } from "@/lib/arabic";

const SIZES_REM = [1.375, 1.625, 1.875, 2.25, 2.625, 3] as const;

export default function SurahReader({
  surahId,
  surahName,
  initialVerse,
  children,
}: {
  surahId: number;
  surahName: string;
  initialVerse?: number;
  children: ReactNode;
}) {
  const [sizeIdx, setSizeIdx] = useState<number>(2);
  const [savedAyah, setSavedAyah] = useState<number | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Mount: restore settings + scroll to requested verse + save for offline */
  useEffect(() => {
    setSizeIdx(Math.min(Math.max(getFontScale(), 0), SIZES_REM.length - 1));
    const saved = getLastReading();
    if (saved?.surahId === surahId) setSavedAyah(saved.ayah);

    // Auto-save surah verses for offline reading when mounted online
    import("@/lib/offline-store").then(({ noorOffline }) => {
      if (!noorOffline.isOffline) {
        // This place would call API. We could fetch and store individually per requirement
        // For standard optimization, we let the service worker cache the HTML/API responses
        // but initiating a background preload of this surah to IndexedDB is a plus
        noorOffline.getVerses(surahId).then((existing) => {
          if (existing.length === 0) {
            fetch(`/api/quran/surah/${surahId}`)
              .then((res) => res.json())
              .then((json) => {
                if (json.verses) {
                  noorOffline.saveVerses(json.verses);
                }
              })
              .catch(() => {});
          }
        });
        setIsOfflineReady(true);
      }
    });

    if (initialVerse && initialVerse > 1) {
      const t = setTimeout(() => {
        const el = document.getElementById(`v-${initialVerse}`);
        el?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        el?.classList.add("!bg-gold/10");
        setTimeout(() => el?.classList.remove("!bg-gold/10"), 2200);
      }, 80);
      return () => clearTimeout(t);
    }
  }, [surahId, initialVerse]);

  /* Track visible ayah → auto-save last reading position */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const ayahs = Array.from(root.querySelectorAll<HTMLElement>("[data-ayah]"));
    if (!ayahs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number((e.target as HTMLElement).dataset.ayah))
          .sort((a, b) => a - b)[0];
        if (!visible) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          setLastReading({ surahId, surahName, ayah: visible });
        }, 900);
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    ayahs.forEach((a) => observer.observe(a));
    return () => {
      observer.disconnect();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [surahId, surahName]);

  useEffect(() => {
    return subscribeNoorStore(() => {
      const saved = getLastReading();
      if (saved?.surahId === surahId) setSavedAyah(saved.ayah);
    });
  }, [surahId]);

  const changeSize = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), SIZES_REM.length - 1);
    setSizeIdx(clamped);
    setFontScale(clamped);
  };

  return (
    <div>
      {/* Reading toolbar */}
      <div className="sticky top-16 z-30 mx-auto -mt-2 mb-6 w-fit max-w-full md:top-[5.25rem]">
        <div
          className="flex items-center gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-[0_8px_24px_-12px_rgb(16_42_67/0.3)] backdrop-blur-lg"
          role="toolbar"
          aria-label="أدوات القراءة"
        >
          <button
            type="button"
            onClick={() => changeSize(sizeIdx + 1)}
            disabled={sizeIdx >= SIZES_REM.length - 1}
            aria-label="تكبير خط المصحف"
            className="inline-flex size-10 items-center justify-center rounded-xl text-sub transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-sub focus-visible:outline-2 focus-visible:outline-brand"
          >
            <AArrowUp className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => changeSize(sizeIdx - 1)}
            disabled={sizeIdx <= 0}
            aria-label="تصغير خط المصحف"
            className="inline-flex size-10 items-center justify-center rounded-xl text-sub transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-sub focus-visible:outline-2 focus-visible:outline-brand"
          >
            <AArrowDown className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => changeSize(2)}
            aria-label="إعادة حجم الخط الافتراضي"
            className="inline-flex size-10 items-center justify-center rounded-xl text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <RotateCcw className="size-4.5" aria-hidden />
          </button>

          <span className="mx-1 h-6 w-px bg-line" aria-hidden />

          <span
            className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-3 py-2 text-[0.72rem] font-bold text-brand"
            aria-live="polite"
          >
            <BookmarkCheck className="size-4" aria-hidden />
            {savedAyah ? `محفوظ: آية ${toArabicDigits(savedAyah)}` : "يُحفظ موضعك تلقائيًا"}
          </span>
        </div>
      </div>

      {/* Mushaf text */}
      <div
        ref={containerRef}
        className="quran-text"
        style={{ fontSize: `${SIZES_REM[sizeIdx]}rem` }}
      >
        {children}
      </div>
    </div>
  );
}
