import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9", className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" className="fill-navy dark:fill-surface-2" />
      <g stroke="#D4AF6A" strokeWidth="1.6">
        <rect x="14" y="14" width="20" height="20" rx="2" />
        <rect
          x="14"
          y="14"
          width="20"
          height="20"
          rx="2"
          transform="rotate(45 24 24)"
        />
      </g>
      <circle cx="24" cy="24" r="3.6" fill="#D4AF6A" />
    </svg>
  );
}

export default function Logo({
  href = "/",
  withWordmark = true,
  className,
}: {
  href?: string;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="نور — الصفحة الرئيسية"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl transition-transform duration-200 active:scale-[0.98]",
        className
      )}
    >
      <LogoMark />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.3rem] font-bold text-navy dark:text-ink">
            نور
            <span className="mx-1.5 inline-block h-4 w-px translate-y-0.5 bg-gold" aria-hidden />
            <span className="text-[0.85rem] font-medium tracking-wide text-gold-deep dark:text-gold">
              Noor
            </span>
          </span>
          <span className="mt-1 text-[0.68rem] font-medium text-sub">
            رفيقك اليومي إلى القرآن والذكر
          </span>
        </span>
      )}
    </Link>
  );
}
