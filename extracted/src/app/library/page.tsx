import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { getReciters, getSurahs } from "@/db/queries";
import ReciterPlayer from "@/components/library/reciter-player";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مكتبة التلاوات",
  description:
    "استمع إلى القرآن الكريم كاملًا بأصوات نخبة من كبار القرّاء برواية حفص عن عاصم، مع مشغّل صوتي متطور وخيارات التنزيل والمتابعة.",
};

export default async function LibraryPage() {
  const [reciters, surahs] = await Promise.all([getReciters(), getSurahs()]);

  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <Headphones className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          مكتبة التلاوات
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-sub">
          استمع للقرآن الكريم بتلاوات خاشعة عالية الجودة لكبار القرّاء — مع تشغيل
          متواصل وتحكم كامل من شاشة القفل وتنزيل مباشر.
        </p>
      </header>

      <div className="mt-10">
        <ReciterPlayer reciters={reciters} surahs={surahs} />
      </div>
    </div>
  );
}
