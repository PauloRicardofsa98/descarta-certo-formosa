import type { Metadata } from "next";

import { prisma } from "@/app/_lib/db";

import {
  MapaPageClient,
  type PublicPoint,
} from "./_components/mapa-page-client";

export const metadata: Metadata = {
  title: "Mapa de pontos",
  description:
    "Veja todos os pontos de descarte ativos em Formosa-GO em um mapa interativo.",
};

export default async function MapaPage() {
  const [points, wasteTypes] = await Promise.all([
    prisma.disposalPoint.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        wasteTypes: {
          select: {
            wasteType: { select: { id: true, slug: true, name: true } },
          },
          orderBy: { wasteType: { order: "asc" } },
        },
      },
    }),
    prisma.wasteType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true },
    }),
  ]);

  const mapped: PublicPoint[] = points.map((point) => ({
    id: point.id,
    slug: point.slug,
    name: point.name,
    address: point.address,
    latitude: point.latitude,
    longitude: point.longitude,
    wasteTypes: point.wasteTypes.map((relation) => ({
      id: relation.wasteType.id,
      slug: relation.wasteType.slug,
      name: relation.wasteType.name,
    })),
  }));

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <MapaPageClient points={mapped} wasteTypes={wasteTypes} />
    </div>
  );
}
