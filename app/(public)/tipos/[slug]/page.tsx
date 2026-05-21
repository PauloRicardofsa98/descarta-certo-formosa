import { ArrowLeft, Lightbulb, MapPin, Recycle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import {
  DisposalPointCard,
  type DisposalPointCardData,
} from "@/app/_components/disposal-point-card";
import { trackView } from "@/app/_lib/analytics";
import { prisma } from "@/app/_lib/db";

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
      wasteTypes: {
        select: { wasteType: { select: { name: true, slug: true } } },
      },
    },
  });

  const cards: DisposalPointCardData[] = points.map((point) => ({
    slug: point.slug,
    name: point.name,
    address: point.address,
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
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
          {cards.length > 0 && (
            <Button
              render={<Link href={`/mapa?tipo=${slug}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <MapPin aria-hidden className="size-4" />
              Ver no mapa
            </Button>
          )}
        </div>

        {cards.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Nenhum ponto cadastrado ainda.
            </p>
            <p className="mt-1">
              Volte em breve. Estamos coletando informações junto à comunidade.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cards.map((point) => (
              <li key={point.slug}>
                <DisposalPointCard
                  point={point}
                  highlightedTypeSlug={slug}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
