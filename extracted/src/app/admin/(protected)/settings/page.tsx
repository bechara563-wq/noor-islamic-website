import { getSettings } from "@/lib/settings";
import SettingsForm from "./settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعدادات" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات الموقع"
        subtitle="كل القيم محفوظة في PostgreSQL — تغييرها هنا لا يحتاج تعديل أي كود."
      />
      <SettingsForm initial={s} />
    </div>
  );
}
