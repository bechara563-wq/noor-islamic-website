"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { audit, createAdminSession, destroyAdminSession, requireAdmin } from "@/lib/auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const ADMIN_EMAIL = "bechara563@gmail.com";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginState = { ok: boolean; error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIpFromHeaders(await headers());
  if (!rateLimit(`login:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "محاولات كثيرة — انتظر عشر دقائق ثم أعد المحاولة." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const { email, password } = parsed.data;

  // Authorization allowlist: this address only, enforced server-side.
  if (email !== ADMIN_EMAIL) {
    return { ok: false, error: "بيانات الدخول غير صحيحة." };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    return { ok: false, error: "بيانات الدخول غير صحيحة." };
  }

  await createAdminSession(admin.id, admin.email);
  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  await audit({ adminId: admin.id, email: admin.email }, "LOGIN", "admin", admin.id, `login from ${ip}`);
  redirect("/admin");
}

export async function logoutAction() {
  const session = await requireAdmin();
  await audit(session, "LOGOUT", "admin", session.adminId);
  await destroyAdminSession();
  redirect("/admin/login");
}

/** Health check helper for tests */
export async function adminPing() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(admins);
  return count;
}
