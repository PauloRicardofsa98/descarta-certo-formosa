import { ImageIcon, MapPin } from "lucide-react";
import Link from "next/link";

import type { ReportStatus } from "@/app/_generated/prisma/client";

import { StatusBadge } from "./status-badge";

export type ReportRow = {
  id: string;
  protocol: string;
  status: ReportStatus;
  description: string;
  photosCount: number;
  createdAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ReportsList({ reports }: { reports: ReportRow[] }) {
  if (reports.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        Nenhuma denúncia encontrada para este filtro.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            href={`/admin/denuncias/${report.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {report.protocol}
                </span>
                <StatusBadge status={report.status} />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {report.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="size-3.5" aria-hidden="true" />
                {report.photosCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                Mapa
              </span>
              <time dateTime={report.createdAt.toISOString()}>
                {dateFormatter.format(report.createdAt)}
              </time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
