"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, Layers, Search, Star, X } from "lucide-react";
import type { JuzMeta, SurahListItem } from "@/db/queries";
import { getFavoriteSurahs, subscribeNoorStore, toggleFavoriteSurah } from "@/lib/noor-storage";
import { normalizeArabic, surahDisplayName, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

type Tab = "surahs" | "juz";

export default function SurahIndex({
  surahs,
  juzList = [],
}: {
  surahs: SurahListItem[];
  juzList?: JuzMeta[];
}) {
  const [tab, setTab] = useState<Tab>("surahs");
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavs(getFavoriteSurahs());
    return subscribeNoorStore(() => setFavs(getFavoriteSurahs()));
  }, []);

  const filteredSurahs = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.nameSimple.includes(q.replace(/^سوره\s*/, "")) ||
        s.englishName.toLowerCase().includes(q.toLowerCase())
    );
  }, [query, surahs]);

  const filteredJuz = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) return juzList;
    return juzList.filter(
      (j) =>
        j.surahName.includes(q.replace(/^سوره\s*/, "")) ||
        String(j.juz).includes(q) ||
        toArabicDigits(j.juz).includes(q)
    );
  }, [query, juzList]);

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "surahs"}
          onClick={() => setTab("surahs")}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-200",
            tab === "surahs"
              ? "bg-brand text-brand-fg shadow-sm"
              : "border border-line bg-surface text-sub hover:border-brand/40 hover:text-brand"
          )}
        >
          <BookOpen className="size-4.5" aria-hidden />
          السور ({toArabicDigits(114)})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "juz"}
          onClick={() => setTab("juz")}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-200",
            tab === "juz"
              ? "bg-brand text-brand-fg shadow-sm"
              : "border border-line bg-surface text-sub hover:border-brand/40 hover:text-brand"
          )}
        >
          <Layers className="size-4.5" aria-hidden />
          الأجزاء ({toArabicDigits(30)})
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-sub"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === "surahs"
              ? "ابحث باسم السورة…"
              : "ابحث باسم السورة أو رقم الجزء…"
          }
          aria-label="بحث في الفهرس"
          className="h-13 w-full rounded-2xl border border-line bg-surface ps-12 pe-11 text-base text-ink shadow-[0_1px_2px_rgb(16_42_67/0.05)] placeholder:text-sub/70 focus:border-brand focus:outline-2 focus:outline-brand"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح البحث"
            className="absolute end-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="size-4.5" aria-hidden />
          </button>
        )}
      </div>

      {/* View: Surahs */}
      {tab === "surahs" && (
        <div>
          <p aria-live="polite" className="text-xs font-semibold text-sub">
            {query
              ? `${toArabicDigits(filteredSurahs.length)} ${
                  filteredSurahs.length === 1 ? "سورة" : "سور"
                } مطابقة`
              : `${toArabicDigits(114)} سورة — المصحف كاملًا بالرسم العثماني`}
          </p>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filteredSurahs.map((s) => {
              const isFav = mounted && favs.includes(s.id);
              return (
                <li key={s.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border bg-surface p-3.5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(16_42_67/0.06),0_14px_30px_-18px_rgb(16_42_67/0.22)]",
                      isFav ? "border-gold/50" : "border-line hover:border-brand/40"
                    )}
                  >
                    <Link
                      href={`/quran/${s.id}`}
                      aria-label={`سورة ${surahDisplayName(s.name)} — ${toArabicDigits(
                        s.ayahCount
                      )} آية`}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {/* Number diamond */}
                      <span className="relative inline-flex size-11 shrink-0 items-center justify-center text-sm font-bold text-brand">
                        <svg
                          viewBox="0 0 44 44"
                          className="absolute inset-0 size-full text-brand/25"
                          fill="none"
                          aria-hidden
                        >
                          <rect
                            x="8"
                            y="8"
                            width="28"
                            height="28"
                            rx="8"
                            transform="rotate(45 22 22)"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                        {toArabicDigits(s.id)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="quran-font truncate text-[1.15rem] leading-8 text-ink">
                            {surahDisplayName(s.name)}
                          </span>
                          <span
                            className="shrink-0 text-[0.62rem] font-medium tracking-wide text-sub"
                            dir="ltr"
                          >
                            {s.englishName}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-[0.7rem] font-semibold text-sub">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5",
                              s.revelation === "meccan"
                                ? "bg-gold/10 text-gold-deep dark:text-gold"
                                : "bg-brand-soft text-brand"
                            )}
                          >
                            {s.revelation === "meccan" ? "مكية" : "مدنية"}
                          </span>
                          <span>{toArabicDigits(s.ayahCount)} آية</span>
                          {s.juzStart && (
                            <span>الجزء {toArabicDigits(s.juzStart)}</span>
                          )}
                        </span>
                      </span>
                      <ChevronLeft
                        className="size-4 shrink-0 text-sub/50 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-brand"
                        aria-hidden
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteSurah(s.id)}
                      aria-pressed={isFav}
                      aria-label={
                        isFav
                          ? `إزالة سورة ${surahDisplayName(s.name)} من المفضلة`
                          : `إضافة سورة ${surahDisplayName(s.name)} إلى المفضلة`
                      }
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-150 active:scale-90",
                        "focus-visible:outline-2 focus-visible:outline-brand",
                        isFav
                          ? "text-gold-deep hover:bg-gold/10 dark:text-gold"
                          : "text-sub/40 hover:bg-brand-soft hover:text-brand"
                      )}
                    >
                      <Star
                        className={cn("size-5", isFav && "fill-current")}
                        aria-hidden
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* View: Juz */}
      {tab === "juz" && (
        <div>
          <p aria-live="polite" className="text-xs font-semibold text-sub">
            {query
              ? `${toArabicDigits(filteredJuz.length)} أجزاء مطابقة`
              : `${toArabicDigits(30)} جزءًا في كتاب الله الكريم`}
          </p>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filteredJuz.map((j) => (
              <li key={j.juz}>
                <Link
                  href={`/quran/${j.surahId}?v=${j.ayahNumber}`}
                  className="group block rounded-2xl border border-line bg-surface p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gold/15 text-sm font-bold text-gold-deep dark:text-gold">
                      {toArabicDigits(j.juz)}
                    </span>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                      سورة {j.surahName} : آية {toArabicDigits(j.ayahNumber)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-navy dark:text-ink">
                    الجزء {toArabicDigits(j.juz)}
                  </h3>
                  <p className="quran-font mt-2 line-clamp-2 text-sm leading-7 text-sub">
                    {j.verseText}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:underline">
                    فتح بداية الجزء
                    <ChevronLeft className="size-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {((tab === "surahs" && filteredSurahs.length === 0) ||
        (tab === "juz" && filteredJuz.length === 0)) && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="font-bold text-ink">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-sub">
            جرّب البحث في نصوص الآيات من صفحة البحث الشامل.
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            البحث في الآيات
          </Link>
        </div>
      )}
    </div>
  );
}
