"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { saveSettings } from "@/app/admin/actions/settings";
import { AdminCard } from "@/components/admin/ui";

type Map = Record<string, string>;

function Field({
  id, label, value, dir, placeholder, hint, textarea, type = "text",
}: {
  id: string; label: string; value: string; dir?: "ltr"; placeholder?: string;
  hint?: string; textarea?: boolean; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">{label}</label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          defaultValue={value}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-7 text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          dir={dir}
          defaultValue={value}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink placeholder:text-sub/60 focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2 ${dir === "ltr" ? "text-left" : ""}`}
        />
      )}
      {hint && <p className="mt-1.5 text-[0.68rem] font-semibold text-sub">{hint}</p>}
    </div>
  );
}

export default function SettingsForm({ initial }: { initial: Map }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveSettings(fd);
      if (res.ok) {
        setNotice("حُفظت الإعدادات بنجاح");
        setTimeout(() => setNotice(""), 3000);
        router.refresh();
      } else setError(res.error ?? "تعذّر الحفظ");
    });
  };

  const v = (k: string) => initial[k] ?? "";

  return (
    <form onSubmit={submit} className="space-y-5">
      <AdminCard className="p-5 sm:p-6">
        <h2 className="font-bold text-ink">عام</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="site_name" label="اسم الموقع" value={v("site_name")} />
          <Field id="site_tagline" label="الشعار النصي" value={v("site_tagline")} />
          <div className="sm:col-span-2">
            <Field id="site_description" label="وصف الموقع" value={v("site_description")} textarea />
          </div>
          <div>
            <label htmlFor="default_language" className="mb-1.5 block text-sm font-bold text-ink">اللغة الافتراضية</label>
            <select id="default_language" name="default_language" defaultValue={v("default_language") || "ar"} className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2">
              <option value="ar">العربية</option>
              <option value="en">English (لاحقًا)</option>
              <option value="fr">Français (لاحقًا)</option>
            </select>
          </div>
          <div>
            <label htmlFor="default_theme" className="mb-1.5 block text-sm font-bold text-ink">المظهر الافتراضي</label>
            <select id="default_theme" name="default_theme" defaultValue={v("default_theme") || "system"} className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand dark:bg-surface-2">
              <option value="system">حسب النظام</option>
              <option value="light">نهاري</option>
              <option value="dark">ليلي</option>
            </select>
          </div>
          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-4">
            <input type="checkbox" name="maintenance_mode" value="true" defaultChecked={v("maintenance_mode") === "true"} className="size-4.5 accent-[#2C7A7B]" />
            <span className="text-sm font-bold text-ink">وضع الصيانة (يُحفظ الآن ويُفعَّل واجهيًا لاحقًا)</span>
          </label>
        </div>
      </AdminCard>

      <AdminCard className="p-5 sm:p-6">
        <h2 className="font-bold text-ink">التواصل و WhatsApp</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="contact_email" label="بريد التواصل" value={v("contact_email")} dir="ltr" type="email" />
          <Field
            id="whatsapp_number"
            label="رقم WhatsApp"
            value={v("whatsapp_number")}
            dir="ltr"
            placeholder="9665xxxxxxxx"
            hint="بصيغة دولية بدون + أو اتركه فارغًا لإخفاء الزر — لا يظهر رقم وهمي أبدًا."
          />
          <div className="sm:col-span-2">
            <Field id="whatsapp_message" label="رسالة WhatsApp الافتراضية" value={v("whatsapp_message")} textarea />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5 sm:p-6">
        <h2 className="font-bold text-ink">الشبكات الاجتماعية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="social_twitter" label="X / Twitter" value={v("social_twitter")} dir="ltr" placeholder="https://x.com/…" />
          <Field id="social_instagram" label="Instagram" value={v("social_instagram")} dir="ltr" placeholder="https://instagram.com/…" />
          <Field id="social_youtube" label="YouTube" value={v("social_youtube")} dir="ltr" placeholder="https://youtube.com/…" />
        </div>
      </AdminCard>

      <AdminCard className="p-5 sm:p-6">
        <h2 className="font-bold text-ink">SEO</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="seo_title" label="عنوان الموقع (Title)" value={v("seo_title")} />
          <Field id="og_image" label="صورة Open Graph" value={v("og_image")} dir="ltr" placeholder="/og.jpg" />
          <div className="sm:col-span-2">
            <Field id="seo_description" label="Meta Description" value={v("seo_description")} textarea />
          </div>
          <div className="sm:col-span-2">
            <Field id="seo_keywords" label="الكلمات المفتاحية" value={v("seo_keywords")} hint="مفصولة بفواصل" />
          </div>
        </div>
      </AdminCard>



      {error && <p role="alert" className="rounded-xl bg-gold/10 px-4 py-3 text-sm font-bold text-gold-deep dark:text-gold">{error}</p>}
      {notice && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl bg-brand-soft px-4 py-3 text-sm font-bold text-brand">
          <Check className="size-4.5" aria-hidden />
          {notice}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-8 text-base font-bold text-brand-fg transition-[transform,background-color] duration-200 hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
        {pending ? "جارٍ الحفظ…" : "حفظ جميع الإعدادات"}
      </button>
    </form>
  );
}
