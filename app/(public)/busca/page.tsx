import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DisposalPointCard } from "@/app/_components/disposal-point-card";
import { Button } from "@/app/_components/ui/button";
import { WasteTypeCard } from "@/app/_components/waste-type-card";
import { trackSearch, trackView } from "@/app/_lib/analytics";
import { searchAll } from "@/app/_lib/search";

export const dynamic = "force-dynamic";

type RawSearchParams = { q?: string | string[] };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  if (!q) {
    return { title: "Busca" };
  }
  return {
    title: `Busca: ${q}`,
    description: `Resultados da busca por "${q}" em pontos e tipos de resíduo de Formosa-GO.`,
  };
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const results = q
    ? await searchAll(q)
    : { query: "", wasteTypes: [], points: [] };
  const totalResults = results.wasteTypes.length + results.points.length;

  await trackView({ path: "/busca" });
  if (q) {
    await trackSearch({ term: q, resultsCount: totalResults });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Buscar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Encontre tipos de resíduo e pontos de descarte em Formosa-GO.
        </p>

        <form
          action="/busca"
          method="GET"
          role="search"
          className="mt-5 flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="busca-search" className="sr-only">
            Buscar tipo de resíduo ou ponto
          </label>
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="busca-search"
              type="search"
              name="q"
              defaultValue={q}
              autoComplete="off"
              placeholder="Ex.: pilha, óleo, eletrônico, Centro..."
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 sm:min-w-32">
            Buscar
          </Button>
        </form>
      </header>

      {!q ? (
        <EmptyQueryState />
      ) : totalResults === 0 ? (
        <NoResultsState query={q} />
      ) : (
        <div className="mt-10 space-y-10">
          {results.wasteTypes.length > 0 && (
            <ResultsSection
              title={`Tipos de resíduo (${results.wasteTypes.length})`}
            >
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {results.wasteTypes.map((wasteType) => (
                  <li key={wasteType.slug}>
                    <WasteTypeCard wasteType={wasteType} />
                  </li>
                ))}
              </ul>
            </ResultsSection>
          )}

          {results.points.length > 0 && (
            <ResultsSection
              title={`Pontos de descarte (${results.points.length})`}
            >
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {results.points.map((point) => (
                  <li key={point.slug}>
                    <DisposalPointCard point={point} />
                  </li>
                ))}
              </ul>
            </ResultsSection>
          )}
        </div>
      )}
    </div>
  );
}

function ResultsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyQueryState() {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Digite algo para buscar.</p>
      <p className="mt-1">
        Tente termos como &ldquo;pilha&rdquo;, &ldquo;óleo&rdquo;,
        &ldquo;eletrônico&rdquo; ou o nome de um bairro.
      </p>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">
        Nenhum resultado para &ldquo;{query}&rdquo;.
      </p>
      <p className="mt-1">
        Tente outras palavras-chave ou{" "}
        <Link
          href="/"
          className="underline underline-offset-4 hover:text-foreground"
        >
          volte para a home
        </Link>
        .
      </p>
    </div>
  );
}
