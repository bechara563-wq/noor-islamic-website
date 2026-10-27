"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { saveAdSenseAction, type AdSenseActionState } from "@/app/admin/actions/adsense";
import { AdminCard } from "@/components/admin/ui";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-sm font-bold text-brand-fg transition-[transform,background-color] duration-200 hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      {pending ? <Loader2 className="size-4.5 animate-spin" aria-hidden /> : <Save className="size-4.5" aria-hidden />}
      {pending ? "جارٍ الحفظ…" : "حفظ إعدادات AdSense"}
    </button>
  );
}

export default function AdSenseForm({
  initial,
}: {
  initial: { enabled: boolean; clientId: string; metaTag: string };
}) {
  const [state, formAction] = useActionState<AdSenseActionState, FormData>(saveAdSenseAction, { ok: false });
  const router = useRouter();
  const justSaved = useRef(false);

  useEffect(() => {
    if (state.ok) justSaved.current = true;
    else justSaved.current = false;
    // Refresh server components (status cards & layout)
    if (state.ok) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <AdminCard className="p-5 sm:p-6">
      <h2 className="font-bold text-ink">قسم Google AdSense</h2>
      <p className="mt-1 text-xs text-sub">مخزَّن بقيم Boolean حقيقية في جدول adsense_settings.</p>

      <form action={formAction} className="mt-5 space-y-5">
        {/* Toggle ON/OFF */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-canvas p-4 dark:bg-surface-2">
          <div>
            <label htmlFor="enabled" className="block text-sm font-bold text-ink">
              تفعيل AdSense
            </label>
            <p className="mt-0.5 text-xs text-sub">ON = حقن العلامة + السكربت داخل ‹head› · OFF = إيقاف كامل</p>
          </div>
          <label className="relative inline-flex cursor-pointer select-none items-center">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              defaultChecked={initial.enabled}
              className="peer sr-only"
            />
            <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors after:absolute after:start-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-brand dark:bg-slate-600" />
            <span className="ms-3 text-xs font-bold text-ink">
              {initial.enabled ? "ON" : "OFF"}
            </span>
          </label>
        </div>

        {/* Client ID */}
        <div>
          <label htmlFor="clientId" className="mb-1.5 block text-sm font-bold text-ink">
            AdSense Client ID
          </label>
          <input
            id="clientId"
            name="clientId"
            dir="ltr"
            defaultValue={initial.clientId}
            placeholder="ca-pub-5680481488439959"
            className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-left font-mono text-sm text-ink placeholder:text-sub/50 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
          />
        </div>

        {/* Meta Tag */}
        <div>
          <label htmlFor="metaTag" className="mb-1.5 block text-sm font-bold text-ink">
            AdSense Meta Tag
          </label>
          <textarea
            id="metaTag"
            name="metaTag"
            dir="ltr"
            rows={3}
            defaultValue={initial.metaTag}
            placeholder='<meta name="google-adsense-account" content="ca-pub-5680481488439959">'
            className="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-left font-mono text-[0.78rem] leading-6 text-ink placeholder:text-sub/50 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
          />
          <p className="mt-1.5 text-[0.7rem] font-semibold text-sub">
            إن تركتها فارغة تُولَّد تلقائيًا من الـ Client ID.
          </p>
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl bg-gold/10 px-4 py-3 text-sm font-bold text-gold-deep dark:text-gold">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-4 py-3 text-sm font-bold text-brand">
            <Check className="size-4.5" aria-hidden />
            حُفظت إعدادات AdSense بنجاح — أُبطل الكاش والعلامة محدثة الآن داخل ‹head› العام.
          </p>
        )}

        <SaveButton />
      </form>
    </AdminCard>
  );
}
