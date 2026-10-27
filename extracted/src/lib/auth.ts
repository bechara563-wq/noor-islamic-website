import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

const COOKIE_NAME = "noor_admin";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 أيام

export type AdminSession = { adminId: number; email: string };

const DEFAULT_SESSION_SECRET = "noor-islamic-app-production-secret-session-key-2026-v1-fixed-auth";

function secretKey(): Uint8Array {
  const s = (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32)
    ? process.env.SESSION_SECRET
    : DEFAULT_SESSION_SECRET;
  return new TextEncoder().encode(s);
}

export async function createAdminSession(adminId: number, email: string) {
  const token = await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
    priority: "high", // ← الضمان في Next.js أن يتم الترسيت وقبل أي redirect يقوم the Set-Cookie
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

/** Returns the verified admin or null — the ONLY authorization gate. */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    const adminId = Number(payload.adminId);
    const email = String(payload.email ?? "");
    if (!adminId || !email) return null;
    return { adminId, email };
  } catch {
    return null;
  }
}

/** Page gate — redirects unauthenticated users to /admin/login. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Action/API gate — never redirects, just enforces. */
export async function assertAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/* ------------------------------ Audit log ------------------------------ */

export async function audit(
  session: AdminSession,
  action: string,
  entity: string,
  entityId?: string | number,
  details?: string
) {
  try {
    await db.insert(adminAuditLogs).values({
      adminId: session.adminId,
      adminEmail: session.email,
      action,
      entity,
      entityId: entityId === undefined ? null : String(entityId),
      details: details ?? null,
    });
  } catch {
    /* audit failure must never break the operation */
  }
}
