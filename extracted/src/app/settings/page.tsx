import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Clock, Languages, Settings, ShieldCheck, Type } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { PwaInstallSettingsCard } from "@/components/pwa-install-modal";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "الإعدادات",
  description: "خصّص تجربتك في نور — المظهر الليلي والنهاري، وحجم الخط، واللغة.",
};

export default function SettingsPage() {
  return (
    <div className="wrap py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
            <Settings className="size-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-navy dark:text-ink sm:text-3xl">الإعدادات</h1>
            <p className="mt-1 text-sm text-sub">خصّص تجربتك على ذوقك — تُحفظ تفضيلاتك على جهازك.</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {/* PWA Mobile App Install Card */}
          <PwaInstallSettingsCard />

          {/* Working setting */}
          <Card className="flex items-center justify-between gap-4 p-5">
            <div>
              <h2 className="font-bold text-ink">المظهر</h2>
              <p className="mt-1 text-sm text-sub">بدّل بين الوضع النهاري والليلي — مفعّل الآن.</p>
            </div>
            <ThemeToggle className="border border-line" />
          </Card>

          {/* Admin Control Panel Card */}
          <Card className="flex items-center justify-between gap-4 border-gold/40 bg-gold/5 p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep dark:text-gold">
                <ShieldCheck className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-bold text-ink">لوحة تحكم المشرف</h2>
                <p className="mt-0.5 text-xs text-sub">
                  إدارة المحتوى، الأذكار، الرسائل، الإعلانات، والإعدادات المركزية.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl bg-gold px-4 text-xs font-bold text-navy transition-colors hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-brand"
            >
              فتح اللوحة
              <ChevronLeft className="size-4" />
            </Link>
          </Card>

          {/* Upcoming settings */}
          {[
            {
              icon: Type,
              title: "حجم خط القراءة",
              desc: "تحكم بحجم خط المصحف والأذكار — يصل مع قسم القرآن.",
            },
            {
              icon: Languages,
              title: "لغة الواجهة",
              desc: "العربية حاليًا؛ الإنجليزية ولغات أخرى قادمة.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="flex items-center justify-between gap-4 p-5 opacity-75">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sub">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-bold text-ink">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-sub">{desc}</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-[0.68rem] font-bold text-gold-deep dark:text-gold">
                <Clock className="size-3" aria-hidden />
                قريبًا
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
