import type { Metadata } from "next";

import { trackView } from "@/app/_lib/analytics";

import { ReportForm } from "./_components/report-form";

export const metadata: Metadata = {
  title: "Denunciar descarte irregular",
  description:
    "Viu lixo, entulho ou resíduo descartado de forma irregular em Formosa-GO? Registre uma denúncia anônima com foto e localização.",
};

export default async function DenunciarPage() {
  await trackView({ path: "/denunciar" });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Denunciar descarte irregular
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Encontrou lixo, entulho ou resíduo jogado fora do lugar? Registre aqui
          com foto e localização. É <strong>anônimo</strong> e ajuda a
          Prefeitura a agir mais rápido.
        </p>
      </header>

      <div className="mt-8">
        <ReportForm />
      </div>
    </div>
  );
}
