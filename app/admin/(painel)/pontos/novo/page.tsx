import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { prisma } from "@/app/_lib/db";

import { DisposalPointForm } from "../_components/disposal-point-form";

export const metadata = { title: "Novo ponto de descarte" };

export default async function NewDisposalPointPage() {
  const wasteTypes = await prisma.wasteType.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

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
            Novo ponto de descarte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre um local que aceita resíduos da comunidade.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <DisposalPointForm
          mode={{ kind: "create" }}
          wasteTypeOptions={wasteTypes}
        />
      </div>
    </div>
  );
}
