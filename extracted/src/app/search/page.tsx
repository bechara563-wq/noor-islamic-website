import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileText, MessageCircleHeart, MoveLeft, Search } from "lucide-react";
import { searchAskNoor, searchQuran } from "@/db/queries";
import SearchBox from "@/components/search/search-box";
import { surahDisplayName, toArabicDigits } from "@/lib/arabic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "البحث في القرآن",
  description: "بحث حقيقي وفوري في نصوص القرآن الكريم وأسماء السور — بالرسم العثماني.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const hasQuery = query.length >= 2;

  const [results, qaResults] = hasQuery
    ? await Promise.all([searchQuran(query), searchAskNoor(query)])
    : [null, []];

  return (
    <div className="wrap max-w-3xl py-10 sm:py-14">
      <div className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <Search className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink">البحث في القرآن</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-sub">
          بحث مباشر في قاعدة نص المصحف — يتجاهل التشكيل وصور الهمزات وصلات الألفاظ.
        </p>
      </div>

      <div className="mt-7">
        <SearchBox initialValue={query} />
      </div>

      {/* Empty state */}
      {!hasQuery && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="text-sm font-semibold leading-7 text-sub">
            اكتب كلمتين أو أكثر للبحث في ٦٢٣٦ آية و١١٤ سورة.
            <br />
            مثال: «الصبر»، «قيام الليل»، «يس»
          </p>
        </div>
      )}

      {hasQuery && results && (
        <div className="mt-8" aria-live="polite">
          <p className="text-sm font-bold text-ink">
            نتائج البحث عن «{query}»
            <span className="ms-2 font-semibold text-sub">
              {results.totalVerses > 0
                ? `— ${toArabicDigits(results.totalVerses)} ${results.totalVerses === 1 ? "آية" : "آيات"}${
                    results.totalVerses > results.verseHits.length ? ` (معروض ${toArabicDigits(results.verseHits.length)})` : ""
                  }`
                : ""}
            </span>
          </p>

          {/* Surah matches */}
          {results.surahs.length > 0 && (
            <section aria-labelledby="surah-matches" className="mt-5">
              <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
                <BookOpen className="size-4" aria-hidden />
                سور مطابقة
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {results.surahs.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/quran/${s.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <span className="font-bold text-ink">سورة {surahDisplayName(s.name)}</span>
                      <span className="text-[0.7rem] font-semibold text-sub">
                        رقم {toArabicDigits(s.id)} · {toArabicDigits(s.ayahCount)} آية
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Verse matches */}
          {results.verseHits.length > 0 && (
            <section aria-labelledby="verse-matches" className="mt-7">
              <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
                <FileText className="size-4" aria-hidden />
                آيات مطابقة
              </h2>
              <ul className="mt-3 space-y-2.5">
                {results.verseHits.map((v) => (
                  <li
                    key={`${v.surahId}:${v.numberInSurah}`}
                    className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-[0.7rem] font-bold text-brand">
                        سورة {surahDisplayName(v.surahName)} — الآية {toArabicDigits(v.numberInSurah)}
                      </span>
                      <Link
                        href={`/quran/${v.surahId}?v=${v.numberInSurah}`}
                        aria-label={`فتح الآية ${toArabicDigits(v.numberInSurah)} من سورة ${surahDisplayName(v.surahName)}`}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        فتح الآية
                        <MoveLeft className="size-3.5" aria-hidden />
                      </Link>
                    </div>
                    <p className="quran-font mt-3 line-clamp-2 text-[1.15rem] leading-9 text-quran-ink">
                      {v.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Ask Noor QA matches */}
          {qaResults.length > 0 && (
            <section aria-labelledby="qa-matches" className="mt-7">
              <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
                <MessageCircleHeart className="size-4" aria-hidden />
                مسائل وفتاوى من «اسأل نور»
              </h2>
              <ul className="mt-3 space-y-2.5">
                {qaResults.map((qa) => (
                  <li
                    key={qa.id}
                    className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-surface-2 px-3 py-0.5 text-[0.7rem] font-bold text-sub">
                        {qa.category}
                      </span>
                      <Link
                        href="/ask"
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-brand hover:bg-brand-soft"
                      >
                        صفحة اسأل نور
                        <MoveLeft className="size-3" />
                      </Link>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-navy dark:text-ink">
                      {qa.question}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-6 text-sub">
                      {qa.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.surahs.length === 0 && results.verseHits.length === 0 && qaResults.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
              <Search className="mx-auto size-8 text-sub/50" aria-hidden />
              <p className="mt-4 font-bold text-ink">لا توجد نتائج مطابقة</p>
              <p className="mt-2 text-sm leading-7 text-sub">
                جرّب صياغة أخرى أو كلمة أعم — البحث يتجاهل التشكيل تلقائيًا.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
