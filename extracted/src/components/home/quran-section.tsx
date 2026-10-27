import { BookOpen, Check, MoveLeft } from "lucide-react";
import Button from "@/components/ui/button";
import { OrnamentDivider } from "@/components/ornament";
import { ContinueReadingButton } from "@/components/quran/continue-reading";

const features = [
  "المصحف كاملًا بالرسم العثماني (١١٤ سورة و٦٢٣٦ آية)",
  "التفسير الميسّر مدمجًا مع كل آية",
  "فهرس السور والأجزاء الـ٣٠ وحفظ الموضع تلقائيًا",
];

export default function QuranSection() {
  return (
    <section aria-labelledby="quran-heading" className="wrap py-10 sm:py-14">
      <div className="overflow-hidden rounded-[2rem] border border-line bg-navy text-ivory shadow-[0_30px_70px_-30px_rgb(16_42_67/0.6)]">
        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div
            className="pointer-events-none absolute inset-0 pattern-geo opacity-[0.08]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl"
            aria-hidden
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold">
              <BookOpen className="size-4" aria-hidden />
              القرآن الكريم
            </span>
            <h2
              id="quran-heading"
              className="mt-5 text-balance text-2xl font-bold leading-snug sm:text-3xl sm:leading-snug"
            >
              مصحف شريف بخط عثماني أصيل،
              <br />
              <span className="text-gold-soft">بتجربة قراءة هادئة تليق به</span>
            </h2>
            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-ivory/85">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-teal/25 text-gold">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/quran" variant="gold" size="lg">
                افتح المصحف
                <MoveLeft className="size-5" aria-hidden />
              </Button>
              <ContinueReadingButton className="ripple-host inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-2xl border border-ivory/20 px-7 text-base font-semibold text-ivory transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-ivory/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2" />
            </div>
          </div>

          {/* Visual: mushaf preview */}
          <div className="relative mx-auto w-full max-w-xs lg:max-w-sm" aria-hidden>
            <div className="rounded-3xl border border-gold/50 bg-navy-deep/60 p-2.5 shadow-2xl">
              <div className="rounded-2xl border border-gold/25 bg-gradient-to-b from-navy-soft/60 to-navy-deep px-6 py-8 text-center">
                <p className="quran-font text-2xl text-gold">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
                <p className="quran-font mt-4 text-base leading-loose text-ivory/90">
                  ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ﴿١﴾ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿٢﴾ مَٰلِكِ يَوْمِ ٱلدِّينِ ﴿٣﴾
                </p>
                <OrnamentDivider className="my-5 opacity-40" />
                <p className="text-[0.72rem] font-semibold tracking-wide text-gold-soft">
                  المصحف الشريف كاملًا بالرسم العثماني
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrnamentDivider className="mt-10 opacity-50" />
    </section>
  );
}
