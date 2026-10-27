"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin, audit } from "@/lib/auth";
import { upsertMany } from "@/lib/settings";

export type ActionResult = { ok: boolean; error?: string };

const fieldSchema = z.object({
  site_name: z.string().trim().min(1).max(120),
  site_tagline: z.string().trim().max(160),
  site_description: z.string().trim().max(500),
  maintenance_mode: z.enum(["true", "false"]),
  default_language: z.enum(["ar", "en", "fr"]),
  default_theme: z.enum(["system", "light", "dark"]),
  contact_email: z.string().trim().email("بريد التواصل غير صالح").max(255).or(z.literal("")),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]*$/, "رقم WhatsApp يجب أن يكون أرقامًا دولية فقط")
    .max(20)
    .or(z.literal("")),
  whatsapp_message: z.string().trim().max(300),
  social_twitter: z.string().trim().max(300).refine((v) => !v || v.startsWith("https://"), "الرابط يجب أن يبدأ بـ https://"),
  social_instagram: z.string().trim().max(300).refine((v) => !v || v.startsWith("https://"), "الرابط يجب أن يبدأ بـ https://"),
  social_youtube: z.string().trim().max(300).refine((v) => !v || v.startsWith("https://"), "الرابط يجب أن يبدأ بـ https://"),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(300),
  seo_keywords: z.string().trim().max(300),
  og_image: z.string().trim().max(400).refine((v) => !v || v.startsWith("/") || v.startsWith("https://"), "مسار صورة OG غير صالح"),
});

// ملاحظة: إعدادات Google AdSense انتقلت إلى قسم مستقل بقيم Boolean حقيقية
// في /admin/adsense مع جدول adsense_settings — لم يعد هذا الحقل نصيًا هنا.

const GROUPS: Record<string, string> = {
  site_name: "general", site_tagline: "general", site_description: "general",
  maintenance_mode: "general", default_language: "general", default_theme: "appearance",
  contact_email: "contact", whatsapp_number: "contact", whatsapp_message: "contact",
  social_twitter: "social", social_instagram: "social", social_youtube: "social",
  seo_title: "seo", seo_description: "seo", seo_keywords: "seo", og_image: "seo",
};

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();

  const raw: Record<string, string> = {};
  for (const key of Object.keys(fieldSchema.shape)) {
    raw[key] = String(formData.get(key) ?? "");
  }

  const parsed = fieldSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  await upsertMany(
    Object.entries(parsed.data).map(([key, value]) => ({
      key,
      value,
      group: GROUPS[key] ?? "general",
    }))
  );

  await audit(session, "UPDATE", "settings", undefined, `keys: ${Object.keys(parsed.data).length}`);
  revalidateTag("settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  return { ok: true };
}
