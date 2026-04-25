import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { prisma } from "@/app/_lib/db";

import {
  DisposalPointsList,
  type DisposalPointRow,
} from "./_components/disposal-points-list";

export const metadata = { title: "Pontos de descarte" };

export default async function DisposalPointsPage() {
  const points = await prisma.disposalPoint.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      address: true,
      status: true,
      _count: { select: { wasteTypes: true } },
    },
  });

  const rows: DisposalPointRow[] = points.map((point) => ({
    id: point.id,
    name: point.name,
    address: point.address,
    status: point.status,
    wasteTypesCount: point._count.wasteTypes,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Pontos de descarte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Locais onde o cidadão pode levar seus resíduos.
          </p>
        </div>
        <Button
          render={<Link href="/admin/pontos/novo" />}
          nativeButton={false}
          size="lg"
        >
          Novo ponto
        </Button>
      </div>

      <DisposalPointsList disposalPoints={rows} />
    </div>
  );
}
