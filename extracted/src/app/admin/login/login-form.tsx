"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Lock, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/actions/auth";
import { LogoMark } from "@/components/logo";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="ripple-host inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-brand-fg transition-[transform,background-color] duration-200 hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {pending ? "جارٍ التحقق…" : "تسجيل الدخول"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, { ok: false });

  return (
    <div className="wrap grid min-h-[80vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <LogoMark className="mx-auto size-14" />
          <h1 className="mt-5 text-2xl font-bold text-navy dark:text-ink">لوحة إدارة نور</h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-sub">
            <ShieldCheck className="size-4 text-brand" aria-hidden />
            منطقة مخصصة للمشرف المعتمد فقط
          </p>
        </div>

        <form
          action={formAction}
          className="mt-8 rounded-[1.6rem] border border-line bg-surface p-6 shadow-[0_1px_2px_rgb(16_42_67/0.05),0_20px_50px_-30px_rgb(16_42_67/0.4)] sm:p-8"
        >
          {state.error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-semibold leading-6 text-ink"
            >
              <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-gold-deep dark:text-gold" aria-hidden />
              {state.error}
            </div>
          )}

          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">
            البريد الإلكتروني
          </label>
          <div className="relative mb-4">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sub" aria-hidden />
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="h-12 w-full rounded-xl border border-line bg-canvas ps-11 pe-4 text-left text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
            />
          </div>

          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink">
            كلمة المرور
          </label>
          <div className="relative mb-6">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sub" aria-hidden />
            <input
              id="password"
              name="password"
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="h-12 w-full rounded-xl border border-line bg-canvas ps-11 pe-4 text-left text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
            />
          </div>

          <SubmitButton />

          <p className="mt-5 text-center text-[0.7rem] leading-5 text-sub">
            محاولات الدخول محدودة ومُسجَّلة. الوصول مقيَّد ببريد واحد معتمد من إدارة نور.
          </p>
        </form>
      </div>
    </div>
  );
}
