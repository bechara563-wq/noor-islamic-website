import Button from "@/components/ui/button";
import { OrnamentDivider, OrnamentMedallion } from "@/components/ornament";
import { BookOpen, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Ambient ornament */}
      <div
        className="pointer-events-none absolute inset-0 pattern-geo opacity-[0.05] dark:opacity-[0.07]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 start-1/2 h-96 w-[54rem] max-w-none -translate-x-1/2 rounded-full bg-gold/10 blur-3xl dark:bg-gold/5"
        aria-hidden
      />

      <div className="wrap relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="text-center lg:text-start">
          <p
            className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[0.8rem] font-bold text-gold-deep dark:text-gold lg:mx-0"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="size-4" aria-hidden />
            نور — منصة إسلامية مجانية بالكامل
          </p>

          <h1
            id="hero-title"
            className="animate-fade-up mt-5 text-balance text-[clamp(2.1rem,6.5vw,3.6rem)] font-bold leading-[1.25] text-navy dark:text-ink"
            style={{ animationDelay: "90ms" }}
          >
            رفيقك اليومي إلى
            <span className="relative mx-2 inline-block text-brand">
              القرآن
              <svg
                viewBox="0 0 120 10"
                className="absolute -bottom-1.5 end-0 h-2.5 w-full text-gold"
                fill="none"
                aria-hidden
              >
                <path d="M2 8C30 2 60 2 118 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            والذكر
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-base leading-8 text-sub sm:text-lg sm:leading-9 lg:mx-0"
            style={{ animationDelay: "180ms" }}
          >
            منصة إسلامية حديثة تجمع القرآن الكريم بالرسم العثماني والأذكار
            ومواقيت الصلاة والقبلة والأدوات الإسلامية في مكان واحد — بهدوء وأناقة.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            style={{ animationDelay: "270ms" }}
          >
            <Button href="/quran" size="lg" className="w-full sm:w-auto">
              <BookOpen className="size-5" aria-hidden />
              ابدأ قراءة القرآن
            </Button>
            <Button href="/adhkar" size="lg" variant="outline" className="w-full sm:w-auto">
              <Sparkles className="size-5" aria-hidden />
              استكشف الأذكار
            </Button>
          </div>
        </div>

        {/* Visual */}
        <div className="animate-scale-in relative mx-auto w-full max-w-[19rem] sm:max-w-sm" style={{ animationDelay: "220ms" }}>
          <div className="absolute -inset-6 rounded-full bg-brand-soft blur-2xl" aria-hidden />
          <div className="relative rounded-[2rem] border border-gold/30 bg-surface p-8 shadow-[0_24px_60px_-24px_rgb(16_42_67/0.35)]">
            <OrnamentMedallion spin className="mx-auto w-full text-navy dark:text-ink" />
            <OrnamentDivider className="mt-6" />
            <p className="mt-4 text-center text-sm font-semibold leading-7 text-sub">
              القرآن · الذكر · الصلاة · القبلة
              <br />
              <span className="text-gold-deep dark:text-gold">في مكان واحد</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
