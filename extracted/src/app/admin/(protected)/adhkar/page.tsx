import { getAdhkarCategories } from "@/db/queries";
import CategoriesManager from "./categories-manager";
import { PageHeader } from "@/components/admin/ui";
import { toArabicDigits } from "@/lib/arabic";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة الأذكار" };

export default async function AdminAdhkarPage() {
  await requireAdmin();
  const categories = await getAdhkarCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الأذكار"
        subtitle={`${toArabicDigits(categories.length)} فئة — التعديلات هنا تنعكس مباشرة على الموقع العام.`}
      />
      <CategoriesManager
        categories={categories.map((c) => ({ id: c.id, title: c.title, count: c.count }))}
      />
    </div>
  );
}
