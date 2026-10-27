"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { sendContactMessage, type ContactState } from "@/app/(public-actions)/contact";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="ripple-host inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-brand-fg transition-[transform,background-color] duration-200 hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {pending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
      {!pending && <Send className="size-4.5" aria-hidden />}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(sendContactMessage, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div role="status" className="rounded-[1.6rem] border border-brand/30 bg-brand-soft p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-brand" aria-hidden />
        <h2 className="mt-4 text-xl font-bold text-ink">وصلت رسالتك بنجاح</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-sub">
          حُفظت رسالتك لدى إدارة نور وستُراجع قريبًا بإذن الله. جزاك الله خيرًا على تواصلك.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} aria-label="نموذج التواصل" className="space-y-5">
      {state.error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-semibold leading-6 text-ink">
          <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-gold-deep dark:text-gold" aria-hidden />
          {state.error}
        </div>
      )}

      {/* Honeypot — invisible to humans */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-ink">الاسم</label>
        <input
          id="name" name="name" type="text" required minLength={2} maxLength={120}
          placeholder="اسمك الكريم"
          className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">البريد الإلكتروني</label>
        <input
          id="email" name="email" type="email" dir="ltr" required maxLength={255}
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-left text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-bold text-ink">رسالتك</label>
        <textarea
          id="message" name="message" rows={5} required minLength={10} maxLength={3000}
          placeholder="اكتب رسالتك هنا…"
          className="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-8 text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
