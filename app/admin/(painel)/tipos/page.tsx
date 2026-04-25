import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { prisma } from "@/app/_lib/db";

import {
  WasteTypesList,
  type WasteTypeRow,
} from "./_components/waste-types-list";

export const metadata = { title: "Tipos de resíduo" };

export default async function WasteTypesPage() {
  const wasteTypes: WasteTypeRow[] = await prisma.wasteType.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      order: true,
      synonyms: true,
    },
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Tipos de resíduo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo dos tipos que podem ser cadastrados em pontos de descarte.
          </p>
        </div>
        <Button
          render={<Link href="/admin/tipos/novo" />}
          nativeButton={false}
          size="lg"
        >
          Novo tipo
        </Button>
      </div>

      <WasteTypesList wasteTypes={wasteTypes} />
    </div>
  );
}
