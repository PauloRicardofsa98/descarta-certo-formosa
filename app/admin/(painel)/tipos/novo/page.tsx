import Link from "next/link";

import { Button } from "@/app/_components/ui/button";

import { WasteTypeForm } from "../_components/waste-type-form";

export const metadata = { title: "Novo tipo de resíduo" };

export default function NewWasteTypePage() {
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
            Novo tipo de resíduo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre um novo tipo a ser oferecido nos pontos de descarte.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <WasteTypeForm mode={{ kind: "create" }} />
      </div>
    </div>
  );
}
