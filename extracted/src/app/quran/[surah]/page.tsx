import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBasmala, getSurahs, getSurahTafsir, getSurahWithVerses } from "@/db/queries";
import SurahReader from "@/components/quran/surah-reader";
import VerseActions from "@/components/quran/verse-actions";
import { surahDisplayName, toArabicDigits } from "@/lib/arabic";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ surah: string }>;
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number((await params).surah);
  if (!Number.isInteger(id) || id < 1 || id > 114) return { title: "سورة غير موجودة" };
  const data = await getSurahWithVerses(id);
  if (!data) return { title: "سورة غير موجودة" };
  return {
    title: `سورة ${surahDisplayName(data.surah.name)}`,
    description: `اقرأ سورة ${surahDisplayName(data.surah.name)} كاملة بالرسم العثماني — ${toArabicDigits(data.surah.ayahCount)} آية، ${data.surah.revelation === "meccan" ? "مكية" : "مدنية"}.`,
  };
}

export default async function SurahPage({ params, searchParams }: Props) {
  const [{ surah: surahParam }, sp] = await Promise.all([params, searchParams]);
  const id = Number(surahParam);
  if (!Number.isInteger(id) || id < 1 || id > 114) notFound();

  const data = await getSurahWithVerses(id);
  if (!data) notFound();
  const { surah, verses } = data;

  const showBasmala = id !== 1 && id !== 9;
  const [basmala, allSurahs, tafsirList] = await Promise.all([
    showBasmala ? getBasmala() : Promise.resolve(null),
    getSurahs(),
    getSurahTafsir(id),
  ]);
  const tafsirMap = new Map(tafsirList.map((t) => [t.numberInSurah, t.text]));
  const prev = allSurahs[id - 2] ?? null;
  const next = allSurahs[id] ?? null;
  const initialVerse = Math.min(Math.max(Number(sp.v) || 0, 0), surah.ayahCount);

  return (
    <article className="wrap max-w-4xl py-8 sm:py-10">
      {/* Surah header */}
      <header className="relative overflow-hidden rounded-[1.6rem] border border-gold/30 bg-quran-surface px-6 py-8 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 pattern-geo opacity-[0.05]" aria-hidden />
        <p className="text-[0.7rem] font-bold tracking-[0.25em] text-gold-deep dark:text-gold">
          سورة رقم {toArabicDigits(surah.id)}
        </p>
        <h1 className="quran-font mt-2 text-3xl leading-loose text-quran-ink sm:text-4xl">
          {surah.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[0.72rem] font-bold">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-brand">
            {surah.revelation === "meccan" ? "مكية" : "مدنية"}
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-sub">
            {toArabicDigits(surah.ayahCount)} آية
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-sub" dir="ltr">
            {surah.englishName}
          </span>
        </div>
      </header>

      {/* Basmala */}
      {basmala && (
        <p className="quran-font py-8 text-center text-3xl leading-relaxed text-quran-ink sm:text-4xl">
          {basmala}
        </p>
      )}

      {/* Reader */}
      <SurahReader surahId={surah.id} surahName={surahDisplayName(surah.name)} initialVerse={initialVerse}>
        {verses.map((v) => (
          <section
            key={v.numberInSurah}
            id={`v-${v.numberInSurah}`}
            data-ayah={v.numberInSurah}
            aria-label={`الآية ${toArabicDigits(v.numberInSurah)}`}
            className="group scroll-mt-40 rounded-2xl px-3 py-4 transition-colors duration-300 sm:px-5"
          >
            <p data-text>
              {v.text}
              <span className="ayah-marker quran-font" aria-label={`نهاية الآية ${toArabicDigits(v.numberInSurah)}`}>
                {toArabicDigits(v.numberInSurah)}
              </span>
              {v.sajda && (
                <span className="sajda-marker ms-1" title="سجدة تلاوة" aria-label="سجدة تلاوة">
                  ۩
                </span>
              )}
            </p>
            <VerseActions
              surahId={surah.id}
              surahName={surahDisplayName(surah.name)}
              ayah={v.numberInSurah}
              tafsirText={tafsirMap.get(v.numberInSurah)}
            />
          </section>
        ))}
      </SurahReader>

      {/* Prev / Next */}
      <nav aria-label="التنقل بين السور" className="mt-10 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/quran/${prev.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <ChevronRight className="size-5 shrink-0 text-sub transition-transform group-hover:translate-x-0.5" aria-hidden />
            <span>
              <span className="block text-[0.68rem] font-bold text-sub">السورة السابقة</span>
              <span className="quran-font mt-0.5 block text-lg leading-7 text-ink">{surahDisplayName(prev.name)}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/quran/${next.id}`}
            className="group flex items-center justify-end gap-3 rounded-2xl border border-line bg-surface p-4 text-end transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span>
              <span className="block text-[0.68rem] font-bold text-sub">السورة التالية</span>
              <span className="quran-font mt-0.5 block text-lg leading-7 text-ink">{surahDisplayName(next.name)}</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-sub transition-transform group-hover:-translate-x-0.5" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
