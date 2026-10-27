import type { Metadata } from "next";
import { Compass } from "lucide-react";
import QiblaFinder from "@/components/qibla/qibla-finder";

export const metadata: Metadata = {
  title: "القِبلة",
  description: "اتجاه القبلة بدقة من موقعك نحو الكعبة المشرفة — بوصلة حية عند توفر المستشعرات، وزاوية القبلة والمسافة دائمًا.",
};

export default function QiblaPage() {
  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <Compass className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">القِبلة</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-sub">
          نحسب اتجاه الكعبة المشرفة من إحداثياتك الحقيقية — والبوصلة الحية تعمل عندما
          يسمح جهازك بمستشعر الاتجاه.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-xl">
        <QiblaFinder />
      </div>
    </div>
  );
}
