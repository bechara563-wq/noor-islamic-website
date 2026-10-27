import type { Metadata } from "next";
import { Clock } from "lucide-react";
import PrayerWidget from "@/components/prayer/prayer-widget";

export const metadata: Metadata = {
  title: "مواقيت الصلاة",
  description: "مواقيت الصلوات الخمس والشروق بدقة حسب موقعك أو مدينتك، مع العد التنازلي للصلاة القادمة والتاريخ الهجري.",
};

export default function PrayerTimesPage() {
  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <Clock className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          مواقيت الصلاة
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-sub">
          مواقيت حقيقية محسوبة لموقعك عبر خدمة AlAdhan المعروفة — لا نعرض أوقاتًا إلا
          بعد نجاح الحساب الفعلي.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-2xl">
        <PrayerWidget />
      </div>
    </div>
  );
}
