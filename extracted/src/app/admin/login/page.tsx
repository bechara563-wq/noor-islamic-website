import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "دخول المشرف",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return <LoginForm />;
}
