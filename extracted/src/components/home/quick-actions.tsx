import {
  BookOpen,
  CircleDot,
  Clock,
  Compass,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";
import { InteractiveCard } from "@/components/ui/card";

const actions = [
  { href: "/quran", label: "القرآن", hint: "المصحف الشريف", icon: BookOpen },
  { href: "/adhkar", label: "الأذكار", hint: "صباحًا ومساءً", icon: Sparkles },
  { href: "/prayer-times", label: "الصلاة", hint: "المواقيت", icon: Clock },
  { href: "/qibla", label: "القبلة", hint: "الاتجاه الصحيح", icon: Compass },
  { href: "/tasbeeh", label: "التسبيح", hint: "مسبحة رقمية", icon: CircleDot },
  { href: "/ask", label: "اسأل نور", hint: "مساعد ذكي", icon: MessageCircleHeart },
];

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions" className="wrap py-6 sm:py-10">
      <h2 id="quick-actions" className="sr-only">
        وصول سريع
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {actions.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <InteractiveCard href={href} className="flex h-full flex-col items-center gap-2.5 p-4 text-center sm:p-5">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-transform duration-200 group-hover:scale-105">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="text-sm font-bold text-ink">{label}</span>
              <span className="-mt-1.5 text-[0.7rem] font-medium text-sub">{hint}</span>
            </InteractiveCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
