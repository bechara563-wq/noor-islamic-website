"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export type ContactState = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب (حرفان فأكثر)").max(120, "الاسم طويل جدًا"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا (١٠ أحرف فأكثر)").max(3000, "الرسالة طويلة جدًا"),
  website: z.string().max(0).optional(), // honeypot — bots only
});

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const ip = clientIpFromHeaders(await headers());
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "أرسلت رسائل كثيرة مؤخرًا — حاول بعد عشر دقائق." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  await db.insert(contactMessages).values({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    message: parsed.data.message,
    status: "NEW",
  });

  return { ok: true };
}
