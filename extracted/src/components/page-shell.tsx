import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Clock, Home } from "lucide-react";
import Button from "@/components/ui/button";

export default function PageShell({
  icon: Icon,
  title,
  subtitle,
  description,
  upcoming,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  description: string;
  upcoming?: string[];
}) {
  return (
    <div className="wrap py-10 sm:py-16">
      <nav aria-label="مسار التنقل" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs font-semibold text-sub">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg px-1 py-1 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Home className="size-3.5" aria-hidden />
              الرئيسية
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="text-brand">
            {title}
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto inline-flex size-20 items-center justify-center rounded-[1.6rem] bg-brand-soft text-brand ring-1 ring-brand/15">
          <Icon className="size-10" aria-hidden />
        </span>
        {subtitle && (
          <p className="mt-6 text-xs font-bold tracking-widest text-gold-deep dark:text-gold">
            {subtitle}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-8 text-sub sm:text-base sm:leading-8">
          {description}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-line bg-surface p-6 text-center sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold-deep dark:text-gold">
          <Clock className="size-3.5" aria-hidden />
          قيد التطوير — يصل ضمن المراحل القادمة
        </span>
        {upcoming && upcoming.length > 0 && (
          <ul className="mt-5 space-y-2.5 text-right text-sm text-sub">
            {upcoming.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                <span className="leading-7">{item}</span>
              </li>
            ))}
          </ul>
        )}
        <Button href="/" variant="outline" size="md" className="mt-6">
          العودة إلى الرئيسية
        </Button>
      </div>
    </div>
  );
}
