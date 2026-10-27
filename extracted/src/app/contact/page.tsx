import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import ContactForm from "./contact-form";
import { getSettings, whatsappLink } from "@/lib/settings";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع فريق نور — أرسل رسالتك مباشرة، أو عبر WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const wa = whatsappLink(settings);
  const email = settings.contact_email || "bechara563@gmail.com";

  return (
    <div className="wrap py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand ring-1 ring-brand/15">
            <Mail className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-navy dark:text-ink">اتصل بنا</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-sub">
            رأيك يهمّنا — ملاحظة، اقتراح، أو تصحيح محتوى؛ رسالتك تصل مباشرة إلى
            إدارة نور وتُحفظ لمراجعتها.
          </p>
        </div>

        <div className="mt-10 rounded-[1.6rem] border border-line bg-surface p-6 shadow-[0_1px_2px_rgb(16_42_67/0.05),0_16px_40px_-28px_rgb(16_42_67/0.3)] sm:p-8">
          <ContactForm />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="ripple-host flex items-center justify-center gap-2.5 rounded-2xl bg-brand px-5 py-4 text-sm font-bold text-brand-fg transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-brand-deep active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <MessageCircle className="size-5" aria-hidden />
              تواصل عبر WhatsApp
            </a>
          )}
          <a
            href={`mailto:${email}`}
            className={
              wa
                ? "flex items-center justify-center gap-2.5 rounded-2xl border border-line bg-surface px-5 py-4 text-sm font-bold text-brand transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                : "flex items-center justify-center gap-2.5 rounded-2xl bg-brand px-5 py-4 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 sm:col-span-2"
            }
          >
            <Mail className="size-5" aria-hidden />
            عبر البريد: <span dir="ltr">{email}</span>
          </a>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-sub">
          نقرأ كل رسالة بعناية — الرسائل تُحفظ لدى الإدارة وتُعامل بخصوصية تامة.
        </p>
      </div>
    </div>
  );
}
