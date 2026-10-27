import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-navy dark:text-ink sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm leading-6 text-sub">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(16_42_67/0.05)]", className)}>
      {children}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  teal: "bg-brand-soft text-brand",
  gold: "bg-gold/10 text-gold-deep dark:text-gold",
  navy: "bg-navy/5 text-navy-soft dark:bg-surface-2 dark:text-sub",
  gray: "bg-surface-2 text-sub",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-bold", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-sub/60">
        <Inbox className="size-7" aria-hidden />
      </span>
      <p className="mt-4 font-bold text-ink">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm leading-6 text-sub">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "teal",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "teal" | "gold" | "navy";
}) {
  const tones = {
    teal: "bg-brand-soft text-brand",
    gold: "bg-gold/10 text-gold-deep dark:text-gold",
    navy: "bg-navy/5 text-navy-soft dark:bg-surface-2 dark:text-ink",
  };
  return (
    <AdminCard className="flex items-center gap-4 p-4 sm:p-5">
      <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-sub">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-bold tabular-nums text-ink">{value}</p>
        {hint && <p className="mt-0.5 text-[0.68rem] font-semibold text-sub">{hint}</p>}
      </div>
    </AdminCard>
  );
}
