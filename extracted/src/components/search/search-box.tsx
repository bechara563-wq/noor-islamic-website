"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchBox({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q.length >= 2) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form role="search" onSubmit={submit} className="relative">
      <label htmlFor="quran-search" className="sr-only">
        ابحث في القرآن الكريم
      </label>
      <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-sub" aria-hidden />
      <input
        id="quran-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="search"
        autoComplete="off"
        autoFocus
        placeholder="اكتب كلمة أو جزءًا من آية… (مثال: الحجرات)"
        className="h-14 w-full rounded-2xl border border-line bg-surface ps-12 pe-12 text-base text-ink shadow-[0_1px_2px_rgb(16_42_67/0.05)] placeholder:text-sub/70 focus:border-brand focus:outline-2 focus:outline-brand"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="مسح"
          className="absolute end-3.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-sub transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          <X className="size-4.5" aria-hidden />
        </button>
      )}
    </form>
  );
}
