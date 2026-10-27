"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  CircleDot,
  Compass,
  Headphones,
  Clock,
  Home,
  LayoutGrid,
  Menu,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSwitcher from "@/components/language-switcher";
import { PwaInstallHeaderButton } from "@/components/pwa-install-modal";
import { mainNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const drawerLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { href: "/adhkar", label: "الأذكار", icon: Sparkles },
  { href: "/prayer-times", label: "مواقيت الصلاة", icon: Clock },
  { href: "/qibla", label: "القبلة", icon: Compass },
  { href: "/tasbeeh", label: "المسبحة الإلكترونية", icon: CircleDot },
  { href: "/library", label: "مكتبة التلاوات", icon: Headphones },
  { href: "/search", label: "البحث", icon: Search },
  { href: "/ask", label: "اسأل نور", icon: MessageCircleHeart },
  { href: "/admin", label: "لوحة المشرف", icon: ShieldCheck },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-lg">
      <div className="wrap flex h-16 items-center justify-between gap-2 md:h-[4.5rem]">
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-xl px-4 text-[0.95rem] font-semibold",
                      "transition-[color,background-color] duration-200",
                      "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
                      active
                        ? "text-brand after:absolute after:-bottom-0.5 after:inset-x-4 after:h-0.5 after:rounded-full after:bg-gold"
                        : "text-sub hover:bg-brand-soft hover:text-brand"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <PwaInstallHeaderButton />
          <Link
            href="/search"
            aria-label="البحث في نور"
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl text-sub",
              "transition-[background-color,color,transform] duration-200 hover:bg-brand-soft hover:text-brand active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            )}
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <LanguageSwitcher className="hidden sm:block" />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl text-navy transition-colors duration-200 hover:bg-brand-soft hover:text-brand dark:text-ink",
              "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 lg:hidden"
            )}
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-navy-deep/50 backdrop-blur-sm animate-fade-in"
          />
          <div className="fixed inset-y-0 start-0 z-50 flex w-[85vw] max-w-sm animate-fade-in flex-col border-e border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="inline-flex size-11 items-center justify-center rounded-xl text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <nav aria-label="قائمة الهاتف" className="flex-1 overflow-y-auto p-3">
              <p className="px-3 pb-2 pt-1 text-xs font-bold tracking-wide text-sub">
                أقسام نور
              </p>
              <ul className="space-y-0.5">
                {drawerLinks.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-12 items-center gap-3 rounded-xl px-3 text-[0.97rem] font-semibold",
                          "transition-[background-color,color] duration-150",
                          "focus-visible:outline-2 focus-visible:outline-brand",
                          active
                            ? "bg-brand-soft text-brand"
                            : "text-ink hover:bg-brand-soft/60 hover:text-brand"
                        )}
                      >
                        <Icon className="size-5 shrink-0" aria-hidden />
                        <span className="flex-1">{label}</span>
                        <ChevronLeft className="size-4 text-sub/60" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 border-t border-line pt-4">
                <p className="px-3 pb-2 text-xs font-bold tracking-wide text-sub">التفضيلات</p>
                <div className="flex items-center gap-2 px-3">
                  <ThemeToggle />
                  <LanguageSwitcher />
                  <Link
                    href="/tools"
                    className="ms-auto inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <LayoutGrid className="size-4.5" aria-hidden />
                    الأدوات
                  </Link>
                </div>
              </div>
            </nav>

            <p className="border-t border-line p-4 text-center text-xs text-sub">
              نور — رفيقك اليومي إلى القرآن والذكر
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
