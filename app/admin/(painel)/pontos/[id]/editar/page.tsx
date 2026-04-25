import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { prisma } from "@/app/_lib/db";

import { DisposalPointForm } from "../../_components/disposal-point-form";
import { type Hours } from "../../_schemas";

export const metadata = { title: "Editar ponto de descarte" };

type Params = { id: string };

export default async function EditDisposalPointPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const [point, wasteTypes] = await Promise.all([
    prisma.disposalPoint.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        photos: true,
        hours: true,
        phone: true,
        description: true,
        website: true,
        status: true,
        wasteTypes: { select: { wasteTypeId: true } },
      },
    }),
    prisma.wasteType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!point) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <Button
          render={<Link href="/admin/pontos" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
        >
          ← Voltar
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Editar ponto de descarte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize as informações deste ponto.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <DisposalPointForm
          mode={{ kind: "edit", id: point.id }}
          wasteTypeOptions={wasteTypes}
          initialValues={{
            name: point.name,
            address: point.address,
            latitude: point.latitude,
            longitude: point.longitude,
            photos: point.photos,
            hours: point.hours as Hours,
            phone: point.phone ?? "",
            description: point.description ?? "",
            website: point.website ?? "",
            status: point.status,
            wasteTypeIds: point.wasteTypes.map((relation) => relation.wasteTypeId),
          }}
        />
      </div>
    </div>
  );
}
