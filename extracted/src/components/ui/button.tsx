"use client";

import Link from "next/link";
import { forwardRef, useCallback, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "navy" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-fg shadow-[0_1px_2px_rgb(16_42_67/0.12),0_8px_20px_-10px_rgb(44_122_123/0.5)] hover:bg-brand-deep active:bg-brand-deep",
  navy:
    "bg-navy text-ivory hover:bg-navy-soft active:bg-navy-soft dark:bg-surface-2 dark:text-ink dark:hover:bg-line dark:active:bg-line",
  gold:
    "bg-gold text-navy hover:bg-gold-soft active:bg-gold-soft dark:text-navy-deep",
  outline:
    "border border-line bg-surface text-ink hover:border-brand hover:text-brand active:bg-brand-soft",
  ghost:
    "text-brand hover:bg-brand-soft active:bg-brand-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-10 min-w-10 gap-1.5 rounded-xl px-3.5 text-sm",
  md: "h-12 min-w-12 gap-2 rounded-xl px-5 text-[0.95rem]",
  lg: "h-14 min-w-14 gap-2.5 rounded-2xl px-7 text-base",
  icon: "h-11 w-11 rounded-xl",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  children: ReactNode;
};

function spawnRipple(e: React.PointerEvent<HTMLElement>) {
  const host = e.currentTarget;
  const rect = host.getBoundingClientRect();
  const d = Math.max(rect.width, rect.height) * 2;
  const ink = document.createElement("span");
  ink.className = "ripple-ink";
  ink.style.width = ink.style.height = `${d}px`;
  ink.style.top = `${e.clientY - rect.top - d / 2}px`;
  ink.style.right = `${rect.right - e.clientX - d / 2}px`;
  host.appendChild(ink);
  window.setTimeout(() => ink.remove(), 600);
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    href,
    className,
    children,
    disabled,
    onPointerDown,
    ...props
  },
  ref
) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      spawnRipple(e);
      onPointerDown?.(e as React.PointerEvent<HTMLButtonElement>);
    },
    [onPointerDown]
  );

  const classes = cn(
    "ripple-host inline-flex select-none items-center justify-center font-semibold leading-none",
    "transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href && !disabled && !loading) {
    return (
      <Link
        href={href}
        className={classes}
        onPointerDown={handlePointerDown as unknown as React.PointerEventHandler<HTMLAnchorElement>}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export default Button;
