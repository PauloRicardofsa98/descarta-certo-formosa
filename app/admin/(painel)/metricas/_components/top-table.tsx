import Link from "next/link";

type Row = {
  label: string;
  value: number;
  href?: string;
  badge?: string;
};

export function TopTable({
  title,
  description,
  emptyLabel,
  rows,
  valueLabel,
}: {
  title: string;
  description?: string;
  emptyLabel: string;
  rows: Row[];
  valueLabel: string;
}) {
  return (
    <section
      aria-labelledby={`top-${title.toLowerCase().replace(/\s+/g, "-")}`}
      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5 sm:p-5"
    >
      <header>
        <h2
          id={`top-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="font-heading text-base font-semibold text-foreground"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ol className="flex flex-col">
          {rows.map((row, i) => {
            const content = (
              <div className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/60">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate text-foreground">{row.label}</span>
                  {row.badge && (
                    <span className="shrink-0 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                      {row.badge}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {row.value.toLocaleString("pt-BR")}
                  <span className="ml-1 hidden text-muted-foreground/70 sm:inline">
                    {valueLabel}
                  </span>
                </span>
              </div>
            );
            return (
              <li key={`${row.label}-${i}`} className="border-t border-border/60 first:border-t-0">
                {row.href ? (
                  <Link
                    href={row.href}
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
