import type { Metadata } from "next";
import {
  BookOpen, ChevronLeft, CircleDot, Clock, Compass, Headphones,
  LayoutGrid, MessageCircleHeart, Search, Sparkles, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdSlot from "@/components/ads/ad-slot";
import AdSenseSlot from "@/components/ads/adsense-slot";
import { getAdSenseConfig } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "أدوات نور",
  description: "كل الأدوات الإسلامية اليومية في مكان واحد: المصحف، الأذكار، مواقيت الصلاة، القبلة، المسبحة، والبحث.",
};

type Tool = {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  ready: boolean;
};

const tools: Tool[] = [
  { href: "/quran", label: "القرآن الكريم", desc: "المصحف كاملًا بالرسم العثماني مع التفسير الميسّر وحفظ الموضع.", icon: BookOpen, ready: true },
  { href: "/library", label: "مكتبة التلاوات", desc: "تلاوات كاملة بأصوات نخبة من كبار القرّاء مع مشغّل متطور.", icon: Headphones, ready: true },
  { href: "/ask", label: "اسأل نور", desc: "المساعد الإسلامي الذكي بإجابات شرعية موثقة بالمصادر.", icon: MessageCircleHeart, ready: true },
  { href: "/adhkar", label: "الأذكار", desc: "حصن المسلم مصنَّف مع عدّادات تكرار تفاعلية واهتزاز هادئ.", icon: Sparkles, ready: true },
  { href: "/prayer-times", label: "مواقيت الصلاة", desc: "مواقيت دقيقة لموقعك مع العد التنازلي والتاريخ الهجري.", icon: Clock, ready: true },
  { href: "/qibla", label: "القِبلة", desc: "اتجاه الكعبة المشرفة بدقة مع بوصلة تفاعلية والمسافة لمكة.", icon: Compass, ready: true },
  { href: "/tasbeeh", label: "المسبحة الإلكترونية", desc: "عدّاد ذكر كبير يحفظ تقدمك وأهدافك اليومية.", icon: CircleDot, ready: true },
  { href: "/search", label: "البحث الشامل", desc: "بحث فوري في نصوص الآيات وأسماء السور والأسئلة الشرعية.", icon: Search, ready: true },
];

export default async function ToolsPage() {
  const adsense = await getAdSenseConfig();
  const clientId = adsense.clientId;
  const isEnabled = adsense.enabled && clientId.startsWith("ca-pub-");

  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <LayoutGrid className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">أدوات نور</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-sub">
          كل أدواتك الإسلامية اليومية — عاملة الآن، وبلا إعلانات وبلا تشتيت.
        </p>
      </header>

      <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ href, label, desc, icon: Icon }) => (
          <li key={href}>
            <a
              href={href}
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgb(16_42_67/0.05),0_10px_28px_-18px_rgb(16_42_67/0.18)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_2px_4px_rgb(16_42_67/0.06),0_16px_36px_-18px_rgb(16_42_67/0.25)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-soft to-transparent text-brand ring-1 ring-brand/15 transition-transform duration-200 group-hover:scale-105">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{label}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-7 text-sub">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
                افتح الأداة
                <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>



      <AdSlot placement="tools" className="mx-auto mt-12 max-w-3xl" />
      {isEnabled && (
        <div className="mx-auto mt-10 max-w-3xl">
          <AdSenseSlot clientId={clientId} slot="4445556667" format="auto" className="w-full" />
        </div>
      )}
    </div>
  );
}
