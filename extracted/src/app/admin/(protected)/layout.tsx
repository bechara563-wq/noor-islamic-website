import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "لوحة الإدارة", template: "%s | إدارة نور" },
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
