import { ArrowLeft, Lightbulb, Phone, Recycle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { trackView } from "@/app/_lib/analytics";
import { prisma } from "@/app/_lib/db";
import { PREFEITURA } from "@/app/_lib/prefeitura";

import { TypePointsMap, type TypeMapPoint } from "./_components/type-points-map";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wasteType = await prisma.wasteType.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!wasteType) {
    return { title: "Tipo não encontrado" };
  }
  return {
    title: `Onde descartar ${wasteType.name.toLowerCase()}`,
    description:
      wasteType.description ??
      `Pontos de descarte para ${wasteType.name.toLowerCase()} em Formosa-GO.`,
  };
}

export default async function WasteTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const wasteType = await prisma.wasteType.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      preparationInstructions: true,
      synonyms: true,
    },
  });

  if (!wasteType) {
    notFound();
  }

  await trackView({
    path: `/tipos/${slug}`,
    wasteTypeId: wasteType.id,
  });

  const points = await prisma.disposalPoint.findMany({
    where: {
      status: "ACTIVE",
      wasteTypes: { some: { wasteTypeId: wasteType.id } },
    },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      wasteTypes: {
        select: { wasteType: { select: { name: true, slug: true } } },
      },
    },
  });

  const cards: TypeMapPoint[] = points.map((point) => ({
    slug: point.slug,
    name: point.name,
    address: point.address,
    latitude: point.latitude,
    longitude: point.longitude,
    wasteTypes: point.wasteTypes.map((relation) => ({
      name: relation.wasteType.name,
      slug: relation.wasteType.slug,
    })),
  }));

  const synonymsList = wasteType.synonyms
    ? wasteType.synonyms
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Voltar para a home
      </Button>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Recycle className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {wasteType.name}
          </h1>
          {wasteType.description && (
            <p className="text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {wasteType.description}
            </p>
          )}
          {synonymsList.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {synonymsList.map((synonym) => (
                <li
                  key={synonym}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {synonym}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {wasteType.preparationInstructions && (
        <section
          aria-labelledby="preparation-heading"
          className="mt-8 flex gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:p-5"
        >
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground"
          >
            <Lightbulb className="size-5" />
          </span>
          <div>
            <h2
              id="preparation-heading"
              className="font-heading text-base font-semibold text-foreground"
            >
              Como preparar
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {wasteType.preparationInstructions}
            </p>
          </div>
        </section>
      )}

      <section aria-labelledby="points-heading" className="mt-10">
        <div>
          <h2
            id="points-heading"
            className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Onde levar
          </h2>
          <p className="text-sm text-muted-foreground">
            {cards.length === 0
              ? "Ainda não temos pontos cadastrados para este tipo."
              : `${cards.length} ${cards.length === 1 ? "ponto disponível" : "pontos disponíveis"} em Formosa-GO.`}
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <div>
              <p className="font-medium text-foreground">
                Ainda não há um local de descarte cadastrado para este resíduo.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fale com a {PREFEITURA.name} para orientação sobre onde
                descartar corretamente.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
              <Button
                render={
                  <a href={`tel:${PREFEITURA.phone.replace(/\D/g, "")}`} />
                }
                nativeButton={false}
                size="lg"
                className="h-11 w-full sm:w-auto"
              >
                <Phone aria-hidden className="size-4" />
                {PREFEITURA.phone}
              </Button>
              <Button
                render={
                  <a href={`tel:${PREFEITURA.tollFree.replace(/\D/g, "")}`} />
                }
                nativeButton={false}
                variant="outline"
                size="lg"
                className="h-11 w-full sm:w-auto"
              >
                {PREFEITURA.tollFree}
              </Button>
            </div>
          </div>
        ) : (
          <TypePointsMap points={cards} highlightedTypeSlug={slug} />
        )}
      </section>
    </div>
  );
}
