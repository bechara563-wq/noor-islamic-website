"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="اختيار اللغة"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-sub",
          "transition-[background-color,color] duration-200 hover:bg-brand-soft hover:text-brand",
          "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        )}
      >
        <Globe className="size-4.5" aria-hidden />
        <span className="hidden sm:inline">العربية</span>
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="اللغات المتاحة"
          className="absolute end-0 top-full z-50 mt-2 w-44 animate-scale-in rounded-2xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_-16px_rgb(16_42_67/0.35)]"
        >
          <button
            role="option"
            aria-selected="true"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
          >
            العربية
            <Check className="size-4" aria-hidden />
          </button>
          <button
            role="option"
            aria-selected="false"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-sub opacity-60"
          >
            English
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-semibold text-sub">
              قريبًا
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
