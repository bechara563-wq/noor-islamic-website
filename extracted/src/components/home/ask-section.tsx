import { MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";

export default function AskSection() {
  return (
    <section aria-labelledby="ask-heading" className="wrap pb-16 pt-6 sm:pb-20 sm:pt-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-surface to-surface-2 p-8 text-center sm:p-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-transparent via-gold to-transparent"
          aria-hidden
        />
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <MessageCircleHeart className="size-8" aria-hidden />
        </span>

        <h2
          id="ask-heading"
          className="mt-6 text-2xl font-bold text-navy dark:text-ink sm:text-3xl"
        >
          اسأل نور
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-sub sm:text-base">
          مساعدك الإسلامي الذكي — اسأل عن الأحكام والأذكار وسير القرآن،
          واحصل على إجابات موثوقة بأسلوب هادئ ومحترم، مع ذكر المصدر دائمًا.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[0.72rem] font-bold text-sub">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
            <Sparkles className="size-3.5 text-gold-deep dark:text-gold" aria-hidden />
            إجابات بمصادر
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
            <ShieldCheck className="size-3.5 text-brand" aria-hidden />
            خصوصية تامة
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
            <MessageCircleHeart className="size-3.5 text-brand" aria-hidden />
            أسلوب هادئ
          </span>
        </div>

        <Button href="/ask" size="lg" className="mt-8">
          ابدأ المحادثة
          <MessageCircleHeart className="size-5" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
