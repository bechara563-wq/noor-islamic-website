"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  HelpCircle,
  MessageCircleHeart,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { AskNoorItem } from "@/db/queries";
import { normalizeArabic } from "@/lib/arabic";
import { cn } from "@/lib/utils";

const SUGGESTED_QUERIES = [
  "أعظم آية في القرآن",
  "سيد الاستغفار",
  "الخشوع في الصلاة",
  "سورة الكهف يوم الجمعة",
  "فرائض الوضوء",
  "صيام ست من شوال",
  "صلاة الوتر",
];

export default function AskAssistant({
  items,
  categories,
}: {
  items: AskNoorItem[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [expandedId, setExpandedId] = useState<number | null>(items[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== "الكل") {
      result = result.filter((i) => i.category === selectedCategory);
    }
    if (query.trim().length > 1) {
      const norm = normalizeArabic(query);
      result = result.filter(
        (i) =>
          normalizeArabic(i.question).includes(norm) ||
          i.keywords.includes(query.trim()) ||
          i.answer.includes(query.trim())
      );
    }
    return result;
  }, [items, selectedCategory, query]);

  const copyAnswer = (item: AskNoorItem) => {
    navigator.clipboard.writeText(
      `س: ${item.question}\nج: ${item.answer}\nالمصدر: ${item.source}\n— عبر منصة نور (noor.app)`
    );
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareQuestion = async (item: AskNoorItem) => {
    const text = `س: ${item.question}\nج: ${item.answer}\nالمصدر: ${item.source}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: item.question,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      copyAnswer(item);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative mx-auto max-w-2xl">
        <Search
          className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-sub"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الأسئلة الشرعية الموثقة (مثال: الوضوء، الاستغفار، صلاة الوتر)…"
          className="h-14 w-full rounded-2xl border border-line bg-surface ps-12 pe-11 text-sm text-ink shadow-sm placeholder:text-sub/70 focus:border-brand focus:outline-2 focus:outline-brand sm:text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح البحث"
            className="absolute end-3.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-sub hover:bg-brand-soft hover:text-brand"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-bold text-sub">أسئلة شائعة:</span>
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuery(q);
              setSelectedCategory("الكل");
            }}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Categories Filter */}
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-start sm:justify-center"
        role="tablist"
      >
        {["الكل", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={selectedCategory === c}
            onClick={() => setSelectedCategory(c)}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              selectedCategory === c
                ? "bg-brand text-brand-fg shadow-sm"
                : "border border-line bg-surface text-sub hover:border-brand/40 hover:text-brand"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div className="mx-auto max-w-3xl space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
            <HelpCircle className="mx-auto size-10 text-sub/40" />
            <h3 className="mt-3 font-bold text-ink">لم نجد نتيجة مطابقة لبحثك</h3>
            <p className="mt-1 text-xs text-sub">
              جرّب صياغة أخرى أو تصفح الفئات المتاحة.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-200",
                  isExpanded
                    ? "border-brand/40 bg-surface shadow-md ring-1 ring-brand/20"
                    : "border-line bg-surface hover:border-brand/30"
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-start"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-bold text-sub">
                        {item.category}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-navy dark:text-ink sm:text-lg">
                        {item.question}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-sub transition-transform duration-200",
                      isExpanded && "rotate-180 text-brand"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-line/70 bg-canvas/60 p-5 sm:p-6 dark:bg-surface-2/30 animate-fade-in">
                    <p className="text-sm leading-8 text-ink sm:text-base sm:leading-8">
                      {item.answer}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-deep dark:text-gold">
                        <ShieldCheck className="size-4" />
                        المصدر: {item.source}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyAnswer(item)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-sub transition-colors hover:border-brand hover:text-brand"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="size-3.5 text-brand" />
                              تم النسخ
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              نسخ الإجابة
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => shareQuestion(item)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-sub transition-colors hover:border-brand hover:text-brand"
                        >
                          <Share2 className="size-3.5" />
                          مشاركة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Scholarly Disclaimer Card */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-6 text-center text-xs leading-7 text-sub">
        <p className="font-bold text-ink">تنويه منهجي حول الفتاوى والأحكام:</p>
        <p className="mt-1">
          هذا القسم يقدّم إجابات شرعية موثقة من القرآن الكريم والسنة النبوية
          الصحيحة والتفاسير المعتمدة للمسائل العامة، وفي الفتاوى الشخصية الخاصة
          يُنصح دائمًا بالرجوع إلى دور الإفتاء والجهات العلمية المعتمدة في بلدك.
        </p>
      </div>
    </div>
  );
}
