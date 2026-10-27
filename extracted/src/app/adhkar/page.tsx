import type { Metadata } from "next";
import Link from "next/link";
import {
  BedDouble, BookOpen, ChevronLeft, DoorOpen, Footprints, HandHeart,
  MoonStar, Shield, Sparkles, Sun, Sunrise, Sunset, UtensilsCrossed, type LucideIcon,
} from "lucide-react";
import { getAdhkarCategories } from "@/db/queries";
import { toArabicDigits } from "@/lib/arabic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأذكار",
  description: "أذكار حصن المسلم مصنَّفة بحسب أوقات يومك — الصباح والمساء والنوم والسفر والطعام — مع عدّادات تكرار.",
};

function iconFor(title: string): LucideIcon {
  if (title.includes("الصباح والمساء")) return Sunrise;
  if (title.includes("استيقاظ")) return Sun;
  if (title.includes("نوم") || title.includes("فزع")) return BedDouble;
  if (title.includes("طعام") || title.includes("شراب") || title.includes("ضيف")) return UtensilsCrossed;
  if (title.includes("سفر") || title.includes("ركوب")) return Footprints;
  if (title.includes("صلاة") || title.includes("وضوء") || title.includes("مسجد") || title.includes("أذان")) return Sparkles;
  if (title.includes("منزل") || title.includes("خلاء")) return DoorOpen;
  if (title.includes("هم") || title.includes("كرب") || title.includes("خوف")) return Shield;
  if (title.includes("رؤيا") || title.includes("ليله القدر")) return MoonStar;
  return HandHeart;
}

export default async function AdhkarPage() {
  const categories = await getAdhkarCategories();
  const featured = categories.slice(0, 3);

  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <Sparkles className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">الأذكار</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-sub">
          {toArabicDigits(categories.length)} فئة من الأذكار والأدعية المأثورة من كتاب
          «حصن المسلم» — اختر فئة وابدأ الذكر بعدّاد تكرار مدمج.
        </p>
      </header>

      {/* Time-aware quick picks */}
      <section aria-labelledby="featured" className="mx-auto mt-9 max-w-5xl">
        <h2 id="featured" className="sr-only">فئات رئيسية</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {featured.map((c) => {
            const Icon = iconFor(c.title);
            return (
              <li key={c.id}>
                <Link
                  href={`/adhkar/${c.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gold/40 bg-gradient-to-l from-gold/10 to-transparent p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold/70 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep transition-transform duration-200 group-hover:scale-105 dark:text-gold">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink">{c.title}</span>
                    <span className="text-xs font-semibold text-sub">{toArabicDigits(c.count)} ذكرًا</span>
                  </span>
                  <ChevronLeft className="size-5 shrink-0 text-gold-deep/60 transition-transform group-hover:-translate-x-1 dark:text-gold/60" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* All categories */}
      <section aria-labelledby="all-cats" className="mx-auto mt-10 max-w-5xl">
        <h2 id="all-cats" className="text-lg font-bold text-navy dark:text-ink">جميع الفئات</h2>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = iconFor(c.title);
            return (
              <li key={c.id}>
                <Link
                  href={`/adhkar/${c.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_2px_4px_rgb(16_42_67/0.05),0_14px_30px_-18px_rgb(16_42_67/0.2)] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform duration-200 group-hover:scale-105">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{c.title}</span>
                    <span className="text-[0.7rem] font-semibold text-sub">{toArabicDigits(c.count)} ذكرًا</span>
                  </span>
                  <ChevronLeft className="size-4 shrink-0 text-sub/50 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-6 text-sub">
        المصدر: حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي بن وهف القحطاني.
      </p>
    </div>
  );
}
