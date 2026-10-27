import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getJuzList, getSurahs } from "@/db/queries";
import SurahIndex from "@/components/quran/surah-index";
import { ContinueReadingCard } from "@/components/quran/continue-reading";
import { OrnamentDivider } from "@/components/ornament";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "القرآن الكريم — المصحف الشريف",
  description:
    "المصحف كاملًا بسوره الـ114 بالرسم العثماني، مع معلومات كل سورة والجزء، وحفظ آخر موضع قراءة والمفضلة.",
};

export default async function QuranPage() {
  const [surahs, juzList] = await Promise.all([getSurahs(), getJuzList()]);

  return (
    <div className="wrap py-8 sm:py-12">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <BookOpen className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          القرآن الكريم
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-sub">
          المصحف الشريف كاملًا بالرسم العثماني — اختر سورة، وسيُحفظ موضع قراءتك تلقائيًا.
        </p>
        <OrnamentDivider className="mt-6 opacity-60" />
      </header>

      <div className="mx-auto mt-6 max-w-6xl space-y-5">
        <ContinueReadingCard />
        <SurahIndex surahs={surahs} juzList={juzList} />
      </div>
    </div>
  );
}
