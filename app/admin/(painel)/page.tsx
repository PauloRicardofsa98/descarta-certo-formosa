import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { prisma } from "@/app/_lib/db";

export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const last30dStart = new Date();
  last30dStart.setUTCDate(last30dStart.getUTCDate() - 30);
  last30dStart.setUTCHours(0, 0, 0, 0);

  const [activePoints, totalWasteTypes, views30d, pendingReports] =
    await Promise.all([
      prisma.disposalPoint.count({ where: { status: "ACTIVE" } }),
      prisma.wasteType.count(),
      prisma.pageView.count({
        where: { isBot: false, createdAt: { gte: last30dStart } },
      }),
      prisma.irregularDisposalReport.count({ where: { status: "PENDING" } }),
    ]);

  const cards = [
    {
      title: "Denúncias pendentes",
      value: pendingReports,
      description: "Aguardando avaliação.",
      href: "/admin/denuncias?status=PENDING",
    },
    {
      title: "Pontos ativos",
      value: activePoints,
      description: "Visíveis no site público.",
      href: "/admin/pontos",
    },
    {
      title: "Tipos de resíduo",
      value: totalWasteTypes,
      description: "Itens cadastrados no catálogo.",
      href: "/admin/tipos",
    },
    {
      title: "Visualizações (30d)",
      value: views30d,
      description: "Acessos reais ao site público.",
      href: "/admin/metricas",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo do conteúdo cadastrado na plataforma.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card className="h-full transition-colors group-hover:ring-primary/40">
              <CardHeader>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="font-heading text-3xl font-bold">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
