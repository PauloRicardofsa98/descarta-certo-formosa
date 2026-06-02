import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PointMiniMap } from "@/app/_components/point-mini-map";
import { prisma } from "@/app/_lib/db";

import { StatusBadge } from "../_components/status-badge";
import { ReportModeration } from "./_components/report-moderation";

export const metadata: Metadata = { title: "Detalhe da denúncia" };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.irregularDisposalReport.findUnique({
    where: { id },
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <Link
          href="/admin/denuncias"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para denúncias
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {report.protocol}
        </h1>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Fotos
            </h2>
            {report.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {report.photos.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image
                      src={url}
                      alt={`Foto ${index + 1} da denúncia ${report.protocol}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem fotos.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Descrição
            </h2>
            <p className="whitespace-pre-line text-sm text-foreground">
              {report.description}
            </p>
            {report.referencePoint && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Ponto de referência:
                </span>{" "}
                {report.referencePoint}
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Localização
            </h2>
            <PointMiniMap
              latitude={report.latitude}
              longitude={report.longitude}
              pointName={report.protocol}
              className="h-64 w-full overflow-hidden rounded-md border border-border"
            />
            <p className="text-xs text-muted-foreground">
              Coordenadas: {report.latitude.toFixed(6)},{" "}
              {report.longitude.toFixed(6)} ·{" "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Abrir no Google Maps
              </a>
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Moderação
            </h2>
            <div className="mt-4">
              <ReportModeration
                id={report.id}
                protocol={report.protocol}
                initialStatus={report.status}
                initialNotes={report.adminNotes ?? ""}
              />
            </div>
          </div>

          <dl className="space-y-2 rounded-lg border border-border bg-card p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Recebida em</dt>
              <dd className="text-right text-foreground">
                {dateFormatter.format(report.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Atualizada em</dt>
              <dd className="text-right text-foreground">
                {dateFormatter.format(report.updatedAt)}
              </dd>
            </div>
            {report.resolvedAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Resolvida em</dt>
                <dd className="text-right text-foreground">
                  {dateFormatter.format(report.resolvedAt)}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
