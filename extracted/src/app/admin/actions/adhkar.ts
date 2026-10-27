"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, max as maxAgg } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adhkar, adhkarCategories } from "@/db/schema";
import { assertAdmin, audit } from "@/lib/auth";

export type ActionResult = { ok: boolean; error?: string };

/* ------------------------------ الفئات ------------------------------ */

const categorySchema = z.object({
  title: z.string().trim().min(3, "اسم الفئة قصير جدًا").max(180, "اسم الفئة طويل جدًا"),
});

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = categorySchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    const [{ value }] = await db.select({ value: maxAgg(adhkarCategories.id) }).from(adhkarCategories);
    const nextId = (value ?? 0) + 1;

    await db.insert(adhkarCategories).values({
      id: nextId,
      title: parsed.data.title,
      sortOrder: nextId,
    });
    await audit(session, "CREATE", "adhkar_category", nextId, parsed.data.title);
    revalidateTag("adhkar", "max");
    revalidatePath("/admin/adhkar");
    revalidatePath("/adhkar");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `تعذّر الحفظ: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function updateCategory(id: number, formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = categorySchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await db
    .update(adhkarCategories)
    .set({ title: parsed.data.title })
    .where(eq(adhkarCategories.id, id));
  await audit(session, "UPDATE", "adhkar_category", id, parsed.data.title);
  revalidateTag("adhkar", "max");
  revalidatePath("/admin/adhkar");
  revalidatePath("/adhkar");
  return { ok: true };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.delete(adhkarCategories).where(eq(adhkarCategories.id, id));
  await audit(session, "DELETE", "adhkar_category", id);
  revalidateTag("adhkar", "max");
  revalidatePath("/admin/adhkar");
  revalidatePath("/adhkar");
  return { ok: true };
}

/* ------------------------------ الأذكار ------------------------------ */

const dhikrSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, "نص الذكر قصير جدًا — لا نريد محتوى ناقصًا قد يضلل القارئ")
    .max(4000, "نص الذكر طويل جدًا"),
  repeat: z.coerce.number().int().min(1, "التكرار الأدنى 1").max(10000, "التكرار الأقصى 10000"),
  source: z.string().trim().min(3, "المصدر مطلوب — لا ننشر ذكرًا بلا مصدر").max(220),
});

export async function createDhikr(categoryId: number, formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = dhikrSchema.safeParse({
    text: formData.get("text"),
    repeat: formData.get("repeat"),
    source: formData.get("source"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const [row] = await db
    .insert(adhkar)
    .values({ categoryId, ...parsed.data, sortOrder: Date.now() % 1000000 })
    .returning({ id: adhkar.id });
  await audit(session, "CREATE", "adhkar", row.id, parsed.data.source);
  revalidateTag("adhkar", "max");
  revalidatePath(`/admin/adhkar/${categoryId}`);
  revalidatePath(`/adhkar/${categoryId}`);
  revalidatePath("/adhkar");
  return { ok: true };
}

export async function updateDhikr(id: number, categoryId: number, formData: FormData): Promise<ActionResult> {
  const session = await assertAdmin();
  const parsed = dhikrSchema.safeParse({
    text: formData.get("text"),
    repeat: formData.get("repeat"),
    source: formData.get("source"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await db
    .update(adhkar)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(adhkar.id, id));
  await audit(session, "UPDATE", "adhkar", id, parsed.data.source);
  revalidateTag("adhkar", "max");
  revalidatePath(`/admin/adhkar/${categoryId}`);
  revalidatePath(`/adhkar/${categoryId}`);
  return { ok: true };
}

export async function deleteDhikr(id: number, categoryId: number): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.delete(adhkar).where(eq(adhkar.id, id));
  await audit(session, "DELETE", "adhkar", id);
  revalidateTag("adhkar", "max");
  revalidatePath(`/admin/adhkar/${categoryId}`);
  revalidatePath(`/adhkar/${categoryId}`);
  revalidatePath("/adhkar");
  return { ok: true };
}

export async function toggleDhikrPublished(id: number, categoryId: number, next: boolean): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.update(adhkar).set({ isPublished: next, updatedAt: new Date() }).where(eq(adhkar.id, id));
  await audit(session, "STATUS", "adhkar", id, next ? "نشر" : "إخفاء");
  revalidateTag("adhkar", "max");
  revalidatePath(`/admin/adhkar/${categoryId}`);
  revalidatePath(`/adhkar/${categoryId}`);
  revalidatePath("/adhkar");
  return { ok: true };
}
