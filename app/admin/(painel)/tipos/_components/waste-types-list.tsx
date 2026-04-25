"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { DeleteWasteTypeButton } from "./delete-waste-type-button";

export type WasteTypeRow = {
  id: string;
  name: string;
  slug: string;
  order: number;
  synonyms: string | null;
};

type Props = {
  wasteTypes: WasteTypeRow[];
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function WasteTypesList({ wasteTypes }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return wasteTypes;
    return wasteTypes.filter((wasteType) => {
      const haystack = normalize(
        `${wasteType.name} ${wasteType.slug} ${wasteType.synonyms ?? ""}`,
      );
      return haystack.includes(term);
    });
  }, [query, wasteTypes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Buscar por nome, slug ou sinônimo..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar tipo de resíduo"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {wasteTypes.length}{" "}
          {wasteTypes.length === 1 ? "tipo" : "tipos"}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden sm:table-cell">Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhum tipo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((wasteType) => (
                <TableRow key={wasteType.id}>
                  <TableCell className="font-medium">
                    {wasteType.name}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {wasteType.slug}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {wasteType.order}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        render={
                          <Link
                            href={`/admin/tipos/${wasteType.id}/editar`}
                            aria-label={`Editar ${wasteType.name}`}
                          />
                        }
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <DeleteWasteTypeButton
                        id={wasteType.id}
                        name={wasteType.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
