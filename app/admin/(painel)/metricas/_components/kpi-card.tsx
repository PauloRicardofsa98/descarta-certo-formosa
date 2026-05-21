import { cn } from "@/app/_lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3.5 ring-1 ring-foreground/5 transition-shadow",
        highlight && "ring-primary/30",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-heading text-2xl font-bold leading-tight tabular-nums sm:text-3xl",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value.toLocaleString("pt-BR")}
      </span>
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}
