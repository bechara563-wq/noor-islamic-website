import { ChevronLeft, CircleDot, Compass, Headphones, Search } from "lucide-react";
import { InteractiveCard } from "@/components/ui/card";

const tools = [
  {
    href: "/qibla",
    label: "القِبلة",
    desc: "حدّد اتجاه الكعبة المشرفة بدقة من أي مكان في العالم.",
    icon: Compass,
  },
  {
    href: "/tasbeeh",
    label: "المسبحة الإلكترونية",
    desc: "سبّح واذكر بعدّاد هادئ يحفظ تقدمك وأهدافك اليومية.",
    icon: CircleDot,
  },
  {
    href: "/library",
    label: "مكتبة التلاوات",
    desc: "استمع للقرآن الكريم بأصوات نديّة من كبار القرّاء.",
    icon: Headphones,
  },
  {
    href: "/search",
    label: "البحث الشامل",
    desc: "ابحث في آيات القرآن والأذكار والأدعية من مكان واحد.",
    icon: Search,
  },
];

export default function ToolsSection() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="wrap scroll-mt-24 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
          أدوات نور
        </p>
        <h2
          id="tools-heading"
          className="mt-2 text-2xl font-bold text-navy dark:text-ink sm:text-3xl"
        >
          كل ما تحتاجه في يومك
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-sub">
          أدوات إسلامية عملية، مصمَّمة بنفس العناية والهدوء — بلا إعلانات وبلا تشتيت.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map(({ href, label, desc, icon: Icon }) => (
          <li key={href}>
            <InteractiveCard href={href} className="flex h-full flex-col p-6">
              <span className="inline-flex size-13 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-soft to-transparent text-brand ring-1 ring-brand/15 transition-transform duration-200 group-hover:scale-105">
                <Icon className="size-6.5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{label}</h3>
              <p className="mt-2 flex-1 text-sm leading-6.5 text-sub">{desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand">
                افتح الأداة
                <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
              </span>
            </InteractiveCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
