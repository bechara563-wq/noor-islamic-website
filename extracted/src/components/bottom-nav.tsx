"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageCircleHeart, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "الرئيسية", icon: Home, match: (p: string) => p === "/" },
  { href: "/quran", label: "القرآن", icon: BookOpen, match: (p: string) => p.startsWith("/quran") },
  { href: "/adhkar", label: "الأذكار", icon: Sparkles, match: (p: string) => p.startsWith("/adhkar") },
  { href: "/search", label: "البحث", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/ask", label: "اسأل نور", icon: MessageCircleHeart, match: (p: string) => p.startsWith("/ask") },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.68rem] font-semibold",
                  "transition-[color,transform] duration-200 active:scale-95",
                  "focus-visible:outline-2 focus-visible:outline-brand focus-visible:-outline-offset-2",
                  active ? "text-brand" : "text-sub hover:text-brand/80"
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn("size-[1.4rem]", active && "stroke-[2.4]")}
                    aria-hidden
                  />
                  {active && (
                    <span
                      className="absolute -top-1.5 start-1/2 size-1.5 -translate-y-1/2 rounded-full bg-gold"
                      aria-hidden
                    />
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
