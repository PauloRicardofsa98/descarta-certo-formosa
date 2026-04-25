import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { prisma } from "@/app/_lib/db";

import { WasteTypeForm } from "../../_components/waste-type-form";

export const metadata = { title: "Editar tipo de resíduo" };

type Params = { id: string };

export default async function EditWasteTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const wasteType = await prisma.wasteType.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      preparationInstructions: true,
      synonyms: true,
      icon: true,
      order: true,
    },
  });

  if (!wasteType) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <Button
          render={<Link href="/admin/tipos" />}
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
        >
          ← Voltar
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Editar tipo de resíduo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize as informações deste tipo do catálogo.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <WasteTypeForm
          mode={{ kind: "edit", id: wasteType.id, originalName: wasteType.name }}
          initialValues={{
            name: wasteType.name,
            description: wasteType.description ?? "",
            preparationInstructions: wasteType.preparationInstructions ?? "",
            synonyms: wasteType.synonyms ?? "",
            icon: wasteType.icon ?? "",
            order: wasteType.order,
          }}
        />
      </div>
    </div>
  );
}
