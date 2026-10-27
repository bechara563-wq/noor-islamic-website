import { BedDouble, MoveLeft, MoonStar, Sparkles, Sunrise, Sunset } from "lucide-react";
import { InteractiveCard } from "@/components/ui/card";
import Button from "@/components/ui/button";

const categories = [
  {
    href: "/adhkar/1",
    label: "أذكار الصباح والمساء",
    desc: "حصّن يومك من بدايته لآخره",
    icon: Sunrise,
    tint: "text-gold-deep dark:text-gold bg-gold/10",
  },
  {
    href: "/adhkar/27",
    label: "أذكار بعد الصلاة",
    desc: "ما يُقال عقب الفرائض المكتوبة",
    icon: Sparkles,
    tint: "text-brand bg-brand-soft",
  },
  {
    href: "/adhkar/2",
    label: "أذكار النوم",
    desc: "باسمك ربَّي وضعت جنبي وبك أرفعه",
    icon: BedDouble,
    tint: "text-navy-soft dark:text-sub bg-navy/5 dark:bg-surface-2",
  },
  {
    href: "/adhkar/3",
    label: "أذكار الاستيقاظ",
    desc: "الحمد لله الذي أحيانا بعد ما أماتنا",
    icon: MoonStar,
    tint: "text-navy-soft dark:text-sub bg-navy/5 dark:bg-surface-2",
  },
  {
    href: "/adhkar/96",
    label: "دعاء السفر والركوب",
    desc: "سبحان الذي سخّر لنا هذا",
    icon: Sparkles,
    tint: "text-brand bg-brand-soft",
  },
  {
    href: "/adhkar",
    label: "جميع فئات الأذكار",
    desc: "١٣٢ فئة من حصن المسلم",
    icon: Sparkles,
    tint: "text-gold-deep dark:text-gold bg-gold/10",
  },
];

export default function AdhkarSection() {
  return (
    <section aria-labelledby="adhkar-heading" className="wrap py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
            الذِّكر اليومي
          </p>
          <h2
            id="adhkar-heading"
            className="mt-2 text-2xl font-bold text-navy dark:text-ink sm:text-3xl"
          >
            الأذكار مصنَّفة لكل وقت
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7 text-sub">
            فئات مختارة بعناية من الأذكار والأدعية المأثورة، مرتبة لتناسب لحظات يومك.
          </p>
        </div>
        <Button href="/adhkar" variant="ghost" size="md">
          جميع الأذكار
          <MoveLeft className="size-5" aria-hidden />
        </Button>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {categories.map(({ href, label, desc, icon: Icon, tint }) => (
          <li key={label}>
            <InteractiveCard href={href} className="h-full p-5">
              <span
                className={`inline-flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tint}`}
              >
                <Icon className="size-5.5" aria-hidden />
              </span>
              <h3 className="mt-4 text-[0.95rem] font-bold text-ink">{label}</h3>
              <p className="mt-1 text-xs font-medium leading-5 text-sub">{desc}</p>
            </InteractiveCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
