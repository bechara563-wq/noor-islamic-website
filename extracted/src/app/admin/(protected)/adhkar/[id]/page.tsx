import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { adhkar, adhkarCategories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import DhikrManager from "./dhikr-manager";
import { toArabicDigits } from "@/lib/arabic";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "أذكار الفئة" };

export default async function AdminDhikrItemsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [category] = await db.select().from(adhkarCategories).where(eq(adhkarCategories.id, id)).limit(1);
  if (!category) notFound();

  const items = await db
    .select({
      id: adhkar.id,
      text: adhkar.text,
      repeat: adhkar.repeat,
      source: adhkar.source,
      isPublished: adhkar.isPublished,
    })
    .from(adhkar)
    .where(eq(adhkar.categoryId, id))
    .orderBy(asc(adhkar.sortOrder));

  return (
    <div className="space-y-6">
      <nav aria-label="مسار التنقل">
        <Link
          href="/admin/adhkar"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ChevronRight className="size-4.5" aria-hidden />
          إدارة الأذكار
        </Link>
      </nav>
      <h1 className="text-xl font-bold text-navy dark:text-ink sm:text-2xl">{category.title}</h1>
      <p className="-mt-4 text-sm text-sub">{toArabicDigits(items.length)} ذكرًا — أضف أو عدّل أو أخفِ ما يلزم.</p>

      <DhikrManager categoryId={id} items={items} />
    </div>
  );
}
