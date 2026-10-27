import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface",
        "shadow-[0_1px_2px_rgb(16_42_67/0.05),0_10px_28px_-18px_rgb(16_42_67/0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function InteractiveCard({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "ripple-host group block rounded-2xl border border-line bg-surface",
        "shadow-[0_1px_2px_rgb(16_42_67/0.05),0_10px_28px_-18px_rgb(16_42_67/0.18)]",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_2px_4px_rgb(16_42_67/0.06),0_16px_36px_-18px_rgb(16_42_67/0.25)]",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function IconBadge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand",
        "transition-colors duration-200",
        className
      )}
    >
      {children}
    </span>
  );
}
