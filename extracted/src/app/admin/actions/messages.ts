"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, MESSAGE_STATUSES, type MessageStatus } from "@/db/schema";
import { assertAdmin, audit } from "@/lib/auth";

export type ActionResult = { ok: boolean; error?: string };

export async function setMessageStatus(id: number, status: MessageStatus): Promise<ActionResult> {
  const session = await assertAdmin();
  if (!MESSAGE_STATUSES.includes(status)) return { ok: false, error: "حالة غير صالحة" };

  await db
    .update(contactMessages)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  await audit(session, "STATUS", "contact_message", id, status);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteMessage(id: number): Promise<ActionResult> {
  const session = await assertAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  await audit(session, "DELETE", "contact_message", id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}
