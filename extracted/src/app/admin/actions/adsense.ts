"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin, audit } from "@/lib/auth";
import { buildMetaTag, saveAdSenseConfig } from "@/lib/adsense";

export type AdSenseActionState = { ok: boolean; error?: string };

const schema = z.object({
  enabled: z.boolean(),
  clientId: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || /^ca-pub-[0-9]+$/.test(v), {
      message: "معرّف AdSense يجب أن يكون بصيغة ca-pub-XXXXXXXXXXXXXXXX",
    }),
  metaTag: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) =>
        v === "" ||
        /^<meta\s+name="google-adsense-account"\s+content="ca-pub-[0-9]+"\s*\/?>$/.test(v),
      {
        message:
          'صيغة العلامة غير صالحة — الصيغة الصحيحة: <meta name="google-adsense-account" content="ca-pub-…">',
      }
    ),
});

export async function saveAdSenseAction(
  _prev: AdSenseActionState,
  formData: FormData
): Promise<AdSenseActionState> {
  const session = await assertAdmin();

  const enabled =
    formData.get("enabled") === "on" || formData.get("enabled") === "true";
  const clientId = String(formData.get("clientId") ?? "").trim();
  let metaTag = String(formData.get("metaTag") ?? "").trim();
  if (!metaTag) metaTag = buildMetaTag(clientId);

  const parsed = schema.safeParse({ enabled, clientId, metaTag });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  if (parsed.data.enabled && !parsed.data.clientId) {
    return { ok: false, error: "أدخل معرّف AdSense Client ID قبل التفعيل." };
  }
  if (parsed.data.enabled && !parsed.data.metaTag) {
    return { ok: false, error: "علامة Meta فارغة — ألصق علامة جوجل الوصفية الصحيحة." };
  }

  try {
    await saveAdSenseConfig({
      enabled: parsed.data.enabled,
      clientId: parsed.data.clientId,
      metaTag: parsed.data.metaTag || buildMetaTag(parsed.data.clientId),
    });
  } catch (e) {
    return { ok: false, error: `خطأ قاعدة البيانات: ${e instanceof Error ? e.message : String(e)}` };
  }

  try {
    await audit(
      session,
      "UPDATE",
      "adsense_settings",
      1,
      `enabled=${parsed.data.enabled} client=${parsed.data.clientId}`
    );
  } catch {
    /* audit must never fail the save */
  }

  try {
    revalidateTag("adsense", "max");
  } catch (e) {
    return { ok: false, error: `revalidateTag خطأ: ${e instanceof Error ? e.message : String(e)}` };
  }

  try {
    revalidatePath("/", "layout");
  } catch (e) {
    return { ok: false, error: `revalidatePath خطأ: ${e instanceof Error ? e.message : String(e)}` };
  }

  return { ok: true };
}
