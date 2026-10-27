import { cn } from "@/lib/utils";

/** Geometric medallion — 8-point star lattice, navy/gold. Decorative only. */
export function OrnamentMedallion({
  className,
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(spin && "animate-spin-slow", className)}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="78" stroke="#D4AF6A" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="3 6" />
      <g stroke="#D4AF6A" strokeWidth="1.6">
        <rect x="46" y="46" width="108" height="108" rx="6" />
        <rect x="46" y="46" width="108" height="108" rx="6" transform="rotate(45 100 100)" />
      </g>
      <g stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8">
        <rect x="66" y="66" width="68" height="68" rx="4" />
        <rect x="66" y="66" width="68" height="68" rx="4" transform="rotate(45 100 100)" />
      </g>
      <circle cx="100" cy="100" r="14" stroke="#D4AF6A" strokeWidth="1.6" />
      <circle cx="100" cy="100" r="5" fill="#D4AF6A" />
      {[0, 90, 180, 270].map((deg) => (
        <circle
          key={deg}
          cx="100"
          cy="22"
          r="3"
          fill="#D4AF6A"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

/** Small gold divider with diamond center */
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden="true">
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/70" />
      <svg viewBox="0 0 16 16" className="size-3 text-gold" fill="currentColor">
        <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.5" transform="rotate(45 8 8)" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/70" />
    </div>
  );
}
