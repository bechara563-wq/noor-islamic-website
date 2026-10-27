"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AD_PLACEMENTS, advertisements } from "@/db/schema";
import { assertAdmin, audit } from "@/lib/auth";

export type ActionResult = { ok: boolean; error?: string };

const adSchema = z.object({
  title: z.string().trim().min(3, "عنوان الإعلان مطلوب (٣ أحرف فأكثر)").max(180),
  body: z.string().trim().max(600).optional().default(""),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"), "رابط الصورة غير صالح")
    .optional()
    .default(""),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"), "رابط الوجهة غير صالح")
    .optional()
    .default(""),
  placement: z.enum(["homepage", "tools", "content", "footer"]),
  isActive: z.coerce.boolean(),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
});

function parse(fd: FormData) {
  const result = adSchema.safeParse({
    title: fd.get("title"),
    body: fd.get("body") ?? "",
    imageUrl: fd.get("imageUrl") ?? "",
    linkUrl: fd.get("linkUrl") ?? "",
    placement: fd.get("placement"),
    isActive: fd.get("isActive") === "on" || fd.get("isActive") === "true",
    startsAt: fd.get("startsAt") ?? "",
    endsAt: fd.get("endsAt") ?? "",
    sortOrder: fd.get("sortOrder") ?? 0,
  });
  if (!result.success) return { error: result.error.issues[0]?.message ?? "بيانات غير صالحة" } as const;

  const d = result.data;
  const startsAt = d.startsAt ? new Date(d.startsAt) : null;
  const endsAt = d.endsAt ? new Date(d.endsAt) : null;
  if (startsAt && Number.isNaN(startsAt.getTime())) return { error: "تاريخ البداية غير صالح" } as const;
  if (endsAt && Number.isNaN(endsAt.getTime())) return { error: "تاريخ النهاية غير صالح" } as const;
  if (startsAt && endsAt && endsAt < startsAt) return { error: "تاريخ النهاية قبل البداية" } as const;
  if (!AD_PLACEMENTS.includes(d.placement)) return { error: "مكان العرض غير صالح" } as const;

  return {
    data: {
      title: d.title,
      body: d.body ?? "",
      imageUrl: d.imageUrl ?? "",
      linkUrl: d.linkUrl ?? "",
      placement: d.placement,
      isActive: d.isActive,
      startsAt,
      endsAt,
      sortOrder: d.sortOrder ?? 0,
    },
  } as const;
}

export async function createAd(formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const [row] = await db.insert(advertisements).values(parsed.data).returning({ id: advertisements.id });
  await audit(session, "CREATE", "advertisement", row.id, parsed.data.title);
  revalidateTag("ads", "max");
  revalidatePath("/admin/advertisements");
  return { ok: true };
}

export async function updateAd(id: number, formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  await db
    .update(advertisements)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(advertisements.id, id));
  await audit(session, "UPDATE", "advertisement", id, parsed.data.title);
  revalidateTag("ads", "max");
  revalidatePath("/admin/advertisements");
  return { ok: true };
}

export async function toggleAd(id: number, next: boolean): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.update(advertisements).set({ isActive: next, updatedAt: new Date() }).where(eq(advertisements.id, id));
  await audit(session, "STATUS", "advertisement", id, next ? "تفعيل" : "تعطيل");
  revalidateTag("ads", "max");
  revalidatePath("/admin/advertisements");
  return { ok: true };
}

export async function deleteAd(id: number): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.delete(advertisements).where(eq(advertisements.id, id));
  await audit(session, "DELETE", "advertisement", id);
  revalidateTag("ads", "max");
  revalidatePath("/admin/advertisements");
  return { ok: true };
}
