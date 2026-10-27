import type { Metadata } from "next";
import { MessageCircleHeart } from "lucide-react";
import { getAskNoorCategories, searchAskNoor } from "@/db/queries";
import AskAssistant from "@/components/ask/ask-assistant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اسأل نور — المساعد الإسلامي الذكي",
  description:
    "مساعدك الإسلامي الموثّق — إجابات شرعية هادئة مدعومة بالقرآن والسنة الصحيحة في العبادات والصلاة والصيام والأذكار ومعاني الآيات.",
};

export default async function AskPage() {
  const [categories, items] = await Promise.all([
    getAskNoorCategories(),
    searchAskNoor(),
  ]);

  return (
    <div className="wrap py-10 sm:py-14">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <MessageCircleHeart className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-navy dark:text-ink sm:text-4xl">
          اسأل نور
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-sub">
          مساعدك الإسلامي الهادئ — إجابات واضحة وموثقة بمصادرها الصريحة من
          القرآن الكريم وصحيح السنة النبوية، بلا تشتيت وباحترام تام.
        </p>
      </header>

      <div className="mt-10">
        <AskAssistant items={items} categories={categories} />
      </div>
    </div>
  );
}
