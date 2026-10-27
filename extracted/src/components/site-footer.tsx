import Link from "next/link";
import { Mail } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { OrnamentDivider } from "@/components/ornament";

const sections: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "أقسام الموقع",
    links: [
      { href: "/quran", label: "القرآن الكريم" },
      { href: "/adhkar", label: "الأذكار" },
      { href: "/prayer-times", label: "مواقيت الصلاة" },
      { href: "/qibla", label: "القبلة" },
      { href: "/tasbeeh", label: "المسبحة الإلكترونية" },
      { href: "/library", label: "مكتبة التلاوات" },
      { href: "/tools", label: "أدوات نور" },
    ],
  },
  {
    title: "الدعم والإدارة",
    links: [
      { href: "/about", label: "عن نور" },
      { href: "/contact", label: "اتصل بنا" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/ask", label: "اسأل نور" },
      { href: "/settings", label: "الإعدادات" },
      { href: "/admin", label: "لوحة تحكم المشرف" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface pb-24 md:pb-0">
      <div className="wrap py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="size-11" />
              <div>
                <p className="text-xl font-bold text-navy dark:text-ink">
                  نور <span className="text-sm font-medium text-gold-deep dark:text-gold">| Noor</span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-sub">
                  رفيقك اليومي إلى القرآن والذكر
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-sub">
              منصة إسلامية رقمية مجانية وحديثة، تجمع أهم الأدوات الإسلامية اليومية —
              القرآن الكريم بالرسم العثماني، الأذكار، مواقيت الصلاة، القبلة، والمزيد —
              في تجربة هادئة ومصمَّمة بعناية.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand transition-colors duration-200 hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <Mail className="size-4.5" aria-hidden />
              اتصل بنا
            </Link>
          </div>

          {sections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-bold text-navy dark:text-ink">{section.title}</h2>
              <ul className="mt-4 space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="-mx-2 inline-flex min-h-9 items-center rounded-lg px-2 py-1.5 text-sm text-sub transition-colors duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <OrnamentDivider className="my-10 opacity-70" />

        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-sub sm:flex-row sm:text-start">
          <p>
            © {new Date().getFullYear()} نور | Noor — جميع حقوق الاستخدام محفوظة. خدمة مجانية بالكامل.
          </p>
          <p className="font-medium text-gold-deep dark:text-gold">
            صُنع بإتقان لخدمة كتاب الله وسُنّة نبيّه
          </p>
        </div>
      </div>
    </footer>
  );
}
