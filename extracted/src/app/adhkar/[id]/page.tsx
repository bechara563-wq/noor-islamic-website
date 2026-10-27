import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAdhkarByCategory } from "@/db/queries";
import DhikrSession from "@/components/adhkar/dhikr-session";
import { toArabicDigits } from "@/lib/arabic";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number((await params).id);
  const data = await getAdhkarByCategory(id);
  if (!data) return { title: "الأذكار" };
  return {
    title: data.category.title,
    description: `${data.category.title} — ${toArabicDigits(data.items.length)} ذكرًا موثقًا من حصن المسلم مع عدّاد تكرار.`,
  };
}

export default async function AdhkarCategoryPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const data = await getAdhkarByCategory(id);
  if (!data || data.items.length === 0) notFound();

  return (
    <div className="wrap py-8 sm:py-12">
      <nav aria-label="مسار التنقل" className="mx-auto max-w-xl">
        <Link
          href="/adhkar"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ChevronRight className="size-4.5" aria-hidden />
          جميع الأذكار
        </Link>
      </nav>

      <header className="mx-auto mt-2 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-navy dark:text-ink sm:text-3xl">
          {data.category.title}
        </h1>
        <p className="mt-2 text-sm text-sub">
          {toArabicDigits(data.items.length)} {data.items.length === 1 ? "ذكر" : "أذكار"} — اضغط العداد مع كل قراءة
        </p>
      </header>

      <div className="mt-6">
        <DhikrSession items={data.items} />
      </div>
    </div>
  );
}
