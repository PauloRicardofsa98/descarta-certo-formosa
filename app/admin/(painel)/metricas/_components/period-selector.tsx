import Link from "next/link";

import { cn } from "@/app/_lib/utils";

import { PERIOD_OPTIONS, type Period } from "../_lib/queries";

export function PeriodSelector({ active }: { active: Period }) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por período"
      className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-1 text-sm shadow-sm"
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === active;
        return (
          <Link
            key={option.value}
            href={`/admin/metricas?periodo=${option.value}`}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded px-3 py-1.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
