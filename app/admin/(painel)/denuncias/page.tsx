import Link from "next/link";

import type { ReportStatus } from "@/app/_generated/prisma/client";
import { prisma } from "@/app/_lib/db";
import { cn } from "@/app/_lib/utils";

import { ReportsList, type ReportRow } from "./_components/reports-list";
import { ReportsMap, type ReportMarker } from "./_components/reports-map";
import { REPORT_STATUS_META, REPORT_STATUS_ORDER } from "./_status";

export const metadata = { title: "Denúncias" };

type SearchParams = Promise<{ status?: string }>;

function parseStatus(value?: string): ReportStatus | null {
  if (
    value === "PENDING" ||
    value === "APPROVED" ||
    value === "RESOLVED" ||
    value === "REJECTED"
  ) {
    return value;
  }
  return null;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const activeStatus = parseStatus(status);

  const [reports, counts] = await Promise.all([
    prisma.irregularDisposalReport.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        protocol: true,
        status: true,
        description: true,
        latitude: true,
        longitude: true,
        photos: true,
        createdAt: true,
      },
    }),
    prisma.irregularDisposalReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countByStatus = new Map<ReportStatus, number>();
  let total = 0;
  for (const row of counts) {
    countByStatus.set(row.status, row._count._all);
    total += row._count._all;
  }

  const markers: ReportMarker[] = reports.map((report) => ({
    id: report.id,
    protocol: report.protocol,
    status: report.status,
    latitude: report.latitude,
    longitude: report.longitude,
    description: report.description,
  }));

  const rows: ReportRow[] = reports.map((report) => ({
    id: report.id,
    protocol: report.protocol,
    status: report.status,
    description: report.description,
    photosCount: report.photos.length,
    createdAt: report.createdAt,
  }));

  const filters: { label: string; href: string; active: boolean; count: number }[] = [
    {
      label: "Todas",
      href: "/admin/denuncias",
      active: activeStatus === null,
      count: total,
    },
    ...REPORT_STATUS_ORDER.map((statusKey) => ({
      label: REPORT_STATUS_META[statusKey].label,
      href: `/admin/denuncias?status=${statusKey}`,
      active: activeStatus === statusKey,
      count: countByStatus.get(statusKey) ?? 0,
    })),
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Denúncias de descarte irregular
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recebidas da comunidade. Avalie, encaminhe à Prefeitura e dê baixa
          quando o local for resolvido.
        </p>
      </div>

      <nav
        aria-label="Filtrar por status"
        className="flex flex-wrap items-center gap-2"
      >
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            aria-current={filter.active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                filter.active
                  ? "bg-primary-foreground/20"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {filter.count}
            </span>
          </Link>
        ))}
      </nav>

      <ReportsMap reports={markers} />

      <ReportsList reports={rows} />
    </div>
  );
}
