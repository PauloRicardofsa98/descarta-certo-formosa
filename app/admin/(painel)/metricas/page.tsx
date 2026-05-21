import type { Metadata } from "next";
import { z } from "zod";

import { DailyViewsChart } from "./_components/daily-views-chart";
import { KpiCard } from "./_components/kpi-card";
import { PeriodSelector } from "./_components/period-selector";
import { TopTable } from "./_components/top-table";
import {
  getDailyViews,
  getKpis,
  getTopPoints,
  getTopSearches,
  getTopWasteTypes,
  type Period,
} from "./_lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métricas",
};

const PeriodSchema = z
  .enum(["7d", "30d", "90d", "tudo"])
  .default("30d")
  .catch("30d");

const PERIOD_LABEL: Record<Period, string> = {
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
  tudo: "todo o histórico",
};

type RawSearchParams = { periodo?: string | string[] };

export default async function MetricasPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const raw = typeof params.periodo === "string" ? params.periodo : undefined;
  const period = PeriodSchema.parse(raw);

  const [kpis, dailyViews, topWasteTypes, topPoints, topSearches] =
    await Promise.all([
      getKpis(),
      getDailyViews(period),
      getTopWasteTypes(period),
      getTopPoints(period),
      getTopSearches(period),
    ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Métricas de uso
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidência de acessos reais ao site público de Descarta Certo
            Formosa.
          </p>
        </div>
        <PeriodSelector active={period} />
      </header>

      <section aria-labelledby="kpis-heading" className="flex flex-col gap-3">
        <h2 id="kpis-heading" className="sr-only">
          Indicadores principais
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label="Total"
            value={kpis.total}
            hint="Acumulado desde a publicação"
            highlight
          />
          <KpiCard
            label="Últimos 30 dias"
            value={kpis.last30d}
            hint="Visualizações no mês"
          />
          <KpiCard
            label="Últimos 7 dias"
            value={kpis.last7d}
            hint="Visualizações na semana"
          />
          <KpiCard label="Hoje" value={kpis.today} hint="Desde 0h UTC" />
          <KpiCard
            label="Sessões únicas (30d)"
            value={kpis.uniqueSessions30d}
            hint={`${kpis.totalSearches.toLocaleString("pt-BR")} buscas no período`}
          />
        </div>
      </section>

      <section
        aria-labelledby="chart-heading"
        className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5 sm:p-5"
      >
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <h2
            id="chart-heading"
            className="font-heading text-base font-semibold text-foreground sm:text-lg"
          >
            Visualizações por dia
          </h2>
          <p className="text-xs text-muted-foreground">
            {PERIOD_LABEL[period]}
          </p>
        </header>
        <DailyViewsChart data={dailyViews} />
      </section>

      <section
        aria-labelledby="tops-heading"
        className="flex flex-col gap-3"
      >
        <header>
          <h2
            id="tops-heading"
            className="font-heading text-lg font-semibold text-foreground sm:text-xl"
          >
            O que a comunidade mais procura
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Top 10 em cada categoria — {PERIOD_LABEL[period]}.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TopTable
            title="Resíduos mais visitados"
            description="Tipos com mais aberturas na página /tipos."
            emptyLabel="Nenhuma visita a páginas de tipo ainda."
            valueLabel="views"
            rows={topWasteTypes.map((row) => ({
              label: row.name,
              value: row.views,
              href: `/tipos/${row.slug}`,
            }))}
          />
          <TopTable
            title="Pontos mais visitados"
            description="Pontos de descarte com mais aberturas na página /pontos."
            emptyLabel="Nenhuma visita a páginas de ponto ainda."
            valueLabel="views"
            rows={topPoints.map((row) => ({
              label: row.name,
              value: row.views,
              href: `/pontos/${row.slug}`,
            }))}
          />
          <TopTable
            title="Termos mais buscados"
            description="Buscas feitas em /busca."
            emptyLabel="Nenhuma busca registrada ainda."
            valueLabel="buscas"
            rows={topSearches.map((row) => ({
              label: row.term,
              value: row.searches,
              href: `/busca?q=${encodeURIComponent(row.term)}`,
              badge: row.zeroResults ? "0 resultados" : undefined,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
