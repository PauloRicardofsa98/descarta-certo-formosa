"use client";

import { List, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  DisposalPointCard,
  type DisposalPointCardData,
} from "@/app/_components/disposal-point-card";
import {
  WasteTypesMultiSelect,
  type WasteTypeOption,
} from "@/app/_components/waste-types-multi-select";
import { cn } from "@/app/_lib/utils";

import { MapaCanvas, type MapPoint } from "./mapa-canvas";

type Mode = "map" | "list";

export type PublicPoint = {
  id: string;
  slug: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  wasteTypes: { id: string; slug: string; name: string }[];
};

type Props = {
  points: PublicPoint[];
  wasteTypes: (WasteTypeOption & { slug: string })[];
};

export function MapaPageClient({ points, wasteTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTypeIds = useMemo(() => {
    const slug = searchParams.get("tipo");
    if (!slug) return [];
    const found = wasteTypes.find((wasteType) => wasteType.slug === slug);
    return found ? [found.id] : [];
  }, [searchParams, wasteTypes]);

  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(initialTypeIds);
  const [mode, setMode] = useState<Mode>("map");

  const filteredPoints = useMemo(() => {
    if (selectedTypeIds.length === 0) return points;
    return points.filter((point) =>
      point.wasteTypes.some((wasteType) =>
        selectedTypeIds.includes(wasteType.id),
      ),
    );
  }, [points, selectedTypeIds]);

  const mapPoints: MapPoint[] = useMemo(
    () =>
      filteredPoints
        .filter(
          (point): point is PublicPoint & { latitude: number; longitude: number } =>
            point.latitude !== null && point.longitude !== null,
        )
        .map((point) => ({
          slug: point.slug,
          name: point.name,
          address: point.address,
          latitude: point.latitude,
          longitude: point.longitude,
          wasteTypeNames: point.wasteTypes.map((wasteType) => wasteType.name),
        })),
    [filteredPoints],
  );

  const listCards: DisposalPointCardData[] = useMemo(
    () =>
      filteredPoints.map((point) => ({
        slug: point.slug,
        name: point.name,
        address: point.address,
        wasteTypes: point.wasteTypes.map((wasteType) => ({
          slug: wasteType.slug,
          name: wasteType.name,
        })),
      })),
    [filteredPoints],
  );

  function handleTypesChange(newIds: string[]) {
    setSelectedTypeIds(newIds);
    if (newIds.length === 1) {
      const found = wasteTypes.find((wasteType) => wasteType.id === newIds[0]);
      if (found) {
        const params = new URLSearchParams();
        params.set("tipo", found.slug);
        router.replace(`/mapa?${params.toString()}`, { scroll: false });
        return;
      }
    }
    router.replace("/mapa", { scroll: false });
  }

  const pointsWithoutGeo = filteredPoints.filter(
    (point) => point.latitude === null || point.longitude === null,
  ).length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <ModeButton
              active={mode === "map"}
              onClick={() => setMode("map")}
              icon={<MapPin className="size-4" />}
              label="Mapa"
            />
            <ModeButton
              active={mode === "list"}
              onClick={() => setMode("list")}
              icon={<List className="size-4" />}
              label="Lista"
            />
          </div>
          <div className="flex flex-1 sm:max-w-md">
            <div className="w-full">
              <WasteTypesMultiSelect
                options={wasteTypes}
                value={selectedTypeIds}
                onChange={handleTypesChange}
              />
            </div>
          </div>
        </div>
      </div>

      {mode === "map" ? (
        <div className="relative flex-1">
          {mapPoints.length === 0 ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-base font-medium text-foreground">
                Nenhum ponto com geolocalização para os filtros atuais.
              </p>
              <p className="text-sm text-muted-foreground">
                Tente outro filtro ou alterne para a visualização em lista.
              </p>
            </div>
          ) : (
            <div className="absolute inset-0">
              <MapaCanvas points={mapPoints} />
            </div>
          )}
          {mapPoints.length > 0 && pointsWithoutGeo > 0 && (
            <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-card/95 px-3 py-1 text-xs text-muted-foreground shadow ring-1 ring-foreground/10">
              {pointsWithoutGeo}{" "}
              {pointsWithoutGeo === 1
                ? "ponto sem coordenadas (visível só na lista)"
                : "pontos sem coordenadas (visíveis só na lista)"}
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="mb-4 text-sm text-muted-foreground">
            {filteredPoints.length}{" "}
            {filteredPoints.length === 1 ? "ponto encontrado" : "pontos encontrados"}
            {selectedTypeIds.length > 0 ? " com os filtros aplicados" : ""}.
          </p>
          {listCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Nenhum ponto encontrado com os filtros atuais.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listCards.map((point) => (
                <li key={point.slug}>
                  <DisposalPointCard point={point} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="sm"
      aria-pressed={active}
      className={cn("h-9 px-3", active && "shadow-sm")}
    >
      {icon}
      {label}
    </Button>
  );
}
