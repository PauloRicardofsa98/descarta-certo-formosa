"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { DeleteDisposalPointButton } from "./delete-disposal-point-button";
import { StatusToggle } from "./status-toggle";

export type DisposalPointRow = {
  id: string;
  name: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
  wasteTypesCount: number;
};

type Props = {
  disposalPoints: DisposalPointRow[];
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export function DisposalPointsList({ disposalPoints }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return disposalPoints.filter((point) => {
      if (statusFilter !== "ALL" && point.status !== statusFilter) return false;
      if (!term) return true;
      const haystack = normalize(`${point.name} ${point.address}`);
      return haystack.includes(term);
    });
  }, [disposalPoints, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="search"
            placeholder="Buscar por nome ou endereço..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar ponto"
            className="sm:max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Apenas ativos</SelectItem>
              <SelectItem value="INACTIVE">Apenas inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {disposalPoints.length}{" "}
          {disposalPoints.length === 1 ? "ponto" : "pontos"}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Endereço</TableHead>
              <TableHead className="hidden sm:table-cell">Tipos</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {disposalPoints.length === 0
                    ? "Nenhum ponto cadastrado ainda."
                    : "Nenhum ponto encontrado com esses filtros."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">
                    {point.name}
                    <Badge
                      variant="secondary"
                      className="ml-2 sm:hidden"
                      aria-label={`Status ${point.status === "ACTIVE" ? "ativo" : "inativo"}`}
                    >
                      {point.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    <span className="line-clamp-1 max-w-xs">
                      {point.address}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {point.wasteTypesCount}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusToggle
                      id={point.id}
                      name={point.name}
                      status={point.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        render={
                          <Link
                            href={`/admin/pontos/${point.id}/editar`}
                            aria-label={`Editar ${point.name}`}
                          />
                        }
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <DeleteDisposalPointButton
                        id={point.id}
                        name={point.name}
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
