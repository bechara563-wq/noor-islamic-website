import type { Metadata } from "next";
import { CircleDot } from "lucide-react";
import TasbeehCounter from "@/components/tasbih/tasbeeh-counter";

export const metadata: Metadata = {
  title: "المسبحة الإلكترونية",
  description: "مسبحة إلكترونية هادئة — سبّح واذكر بعدّاد كبير يحفظ تقدمك على جهازك، مع أهداف ذكر واهتزاز لطيف.",
};

export default function TasbeehPage() {
  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <CircleDot className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          المسبحة الإلكترونية
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-sub">
          عدّاد ذكر هادئ بلمسة واحدة — يُحفظ عددك وتقدّمك على جهازك تلقائيًا.
        </p>
      </header>

      <div className="mt-10">
        <TasbeehCounter />
      </div>
    </div>
  );
}
