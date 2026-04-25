import { MapPin, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  WasteTypeCard,
  type WasteTypeCardData,
} from "@/app/_components/waste-type-card";
import { prisma } from "@/app/_lib/db";

export default async function HomePage() {
  const wasteTypes: WasteTypeCardData[] = await prisma.wasteType.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, description: true, icon: true },
  });

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="font-heading text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Onde devo descartar?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              Encontre o ponto certo para cada tipo de resíduo em Formosa-GO.
              Pilhas, óleo de cozinha, eletrônicos, entulho e muito mais.
            </p>
          </div>

          <form
            action="/busca"
            method="GET"
            role="search"
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="home-search" className="sr-only">
              Buscar tipo de resíduo ou ponto
            </label>
            <div className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="home-search"
                type="search"
                name="q"
                autoComplete="off"
                placeholder="Ex.: pilha, óleo, eletrônico..."
                className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 sm:min-w-32">
              Buscar
            </Button>
          </form>

          <div className="mt-4 flex justify-center">
            <Button
              render={<Link href="/mapa" />}
              nativeButton={false}
              variant="outline"
              className="h-11"
            >
              <MapPin className="size-4" />
              Ver pontos no mapa
            </Button>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ou navegue por tipo de resíduo
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Selecione o que você precisa descartar para ver onde levar.
            </p>
          </div>
          {wasteTypes.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Ainda não há tipos cadastrados.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wasteTypes.map((wasteType) => (
                <li key={wasteType.slug}>
                  <WasteTypeCard wasteType={wasteType} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
