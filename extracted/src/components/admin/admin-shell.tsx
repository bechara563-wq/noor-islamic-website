"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BadgeDollarSign, ExternalLink, LayoutDashboard, LogOut, Mail, Megaphone,
  Menu, Settings, Sparkles, X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions/auth";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/admin", label: "لوحة القيادة", icon: LayoutDashboard, exact: true },
  { href: "/admin/adhkar", label: "إدارة الأذكار", icon: Sparkles, exact: false },
  { href: "/admin/messages", label: "الرسائل", icon: Mail, exact: false },
  { href: "/admin/advertisements", label: "الإعلانات الداخلية", icon: Megaphone, exact: false },
  { href: "/admin/adsense", label: "Google AdSense", icon: BadgeDollarSign, exact: false },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, exact: false },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="قائمة الإدارة">
      <ul className="space-y-1">
        {menu.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-brand",
                  active ? "bg-brand-soft text-brand" : "text-sub hover:bg-brand-soft/60 hover:text-brand"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface lg:flex">
        <div className="flex items-center gap-3 border-b border-line p-5">
          <LogoMark className="size-10" />
          <div>
            <p className="text-sm font-bold text-navy dark:text-ink">إدارة نور</p>
            <p className="text-[0.68rem] font-semibold text-sub" dir="ltr">{email}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{nav}</div>
        <div className="space-y-1 border-t border-line p-4">
          <Link
            href="/"
            className="flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-sub transition-colors hover:bg-brand-soft/60 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <ExternalLink className="size-5" aria-hidden />
            زيارة الموقع
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-sub transition-colors hover:bg-gold/10 hover:text-gold-deep focus-visible:outline-2 focus-visible:outline-brand dark:hover:text-gold"
            >
              <LogOut className="size-5" aria-hidden />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <div>
            <p className="text-xs font-bold text-navy dark:text-ink">إدارة نور</p>
            <p className="max-w-36 truncate text-[0.62rem] text-sub" dir="ltr">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          className="inline-flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-b border-line bg-surface p-3 lg:hidden">
          {nav}
          <div className="mt-2 flex gap-2 border-t border-line pt-3">
            <Link
              href="/"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-xs font-bold text-sub focus-visible:outline-2 focus-visible:outline-brand"
            >
              <ExternalLink className="size-4" aria-hidden />
              الموقع
            </Link>
            <form action={logoutAction} className="flex-1">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-xs font-bold text-sub transition-colors hover:border-gold hover:text-gold-deep dark:hover:text-gold focus-visible:outline-2 focus-visible:outline-brand"
              >
                <LogOut className="size-4" aria-hidden />
                خروج
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
