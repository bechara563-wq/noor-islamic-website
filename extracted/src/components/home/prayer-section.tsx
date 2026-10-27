import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import Button from "@/components/ui/button";

const prayers = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

export default function PrayerSection() {
  return (
    <section aria-labelledby="prayer-heading" className="wrap py-10 sm:py-14">
      <div className="grid items-center gap-8 rounded-[2rem] border border-line bg-surface p-8 shadow-[0_1px_2px_rgb(16_42_67/0.05),0_10px_28px_-18px_rgb(16_42_67/0.18)] sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
            عمود اليوم
          </p>
          <h2
            id="prayer-heading"
            className="mt-2 text-2xl font-bold text-navy dark:text-ink sm:text-3xl"
          >
            مواقيت الصلاة حسب موقعك
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-sub">
            مواقيت دقيقة يوميًا حسب موقعك أو مدينتك، مع عدّ تنازلي حي للصلاة
            القادمة والتاريخ الهجري — متاحة الآن.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button href="/prayer-times" size="md">
              <MapPin className="size-4.5" aria-hidden />
              افتح المواقيت
            </Button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
              <Clock className="size-3.5" aria-hidden />
              تعمل الآن
            </span>
          </div>
        </div>

        {/* Static preview card — real times live at /prayer-times */}
        <Link
          href="/prayer-times"
          className="group grid grid-cols-5 gap-2 sm:gap-3"
          aria-label="افتح صفحة مواقيت الصلاة"
        >
          {prayers.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-canvas px-2 py-4 transition-colors duration-200 group-hover:border-brand/40 dark:bg-surface-2"
            >
              <span className="text-[0.72rem] font-bold text-ink">{name}</span>
              <span className="skeleton h-4 w-10" aria-hidden />
              <span className="text-[0.6rem] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                اعرض الوقت
              </span>
            </div>
          ))}
        </Link>
      </div>
    </section>
  );
}
