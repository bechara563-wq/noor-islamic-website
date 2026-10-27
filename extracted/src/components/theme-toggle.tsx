"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("noor-theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark ?? false}
      aria-label={dark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={dark ? "الوضع النهاري" : "الوضع الليلي"}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-xl text-sub",
        "transition-[background-color,color,transform] duration-200",
        "hover:bg-brand-soft hover:text-brand active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
        className
      )}
    >
      {dark === null ? (
        <span className="size-5" aria-hidden />
      ) : dark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </button>
  );
}
