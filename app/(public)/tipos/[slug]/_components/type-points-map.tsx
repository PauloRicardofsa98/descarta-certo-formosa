"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LocateFixed, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  DisposalPointCard,
  type DisposalPointCardData,
} from "@/app/_components/disposal-point-card";
import { Button } from "@/app/_components/ui/button";

export type TypeMapPoint = DisposalPointCardData & {
  latitude: number | null;
  longitude: number | null;
};

type Coords = { latitude: number; longitude: number };
type GeoStatus = "idle" | "loading" | "ready" | "denied" | "unavailable";

const FORMOSA_CENTER: [number, number] = [-47.3372, -15.5378];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineKm(a: Coords, b: Coords): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number): string {
  if (km < 1) return `a ${Math.round(km * 1000)} m de você`;
  return `a ${km.toFixed(1).replace(".", ",")} km de você`;
}

export function TypePointsMap({
  points,
  highlightedTypeSlug,
}: {
  points: TypeMapPoint[];
  highlightedTypeSlug: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");

  const geoPoints = useMemo(
    () =>
      points.filter(
        (point): point is TypeMapPoint & Coords =>
          point.latitude !== null && point.longitude !== null,
      ),
    [points],
  );

  const orderedPoints = useMemo(() => {
    if (!userCoords) return points;
    return [...points].sort((a, b) => {
      const da =
        a.latitude !== null && a.longitude !== null
          ? haversineKm(userCoords, {
              latitude: a.latitude,
              longitude: a.longitude,
            })
          : Infinity;
      const db =
        b.latitude !== null && b.longitude !== null
          ? haversineKm(userCoords, {
              latitude: b.latitude,
              longitude: b.longitude,
            })
          : Infinity;
      return da - db;
    });
  }, [points, userCoords]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          },
        },
        layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
      },
      center:
        geoPoints.length > 0
          ? [geoPoints[0].longitude, geoPoints[0].latitude]
          : FORMOSA_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [geoPoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    for (const point of geoPoints) {
      const popup = new maplibregl.Popup({ offset: 24 }).setHTML(
        `<div class="cn-popup">
          <strong class="cn-popup-title">${escapeHtml(point.name)}</strong>
          <p class="cn-popup-address">${escapeHtml(point.address)}</p>
          <a class="cn-popup-link" href="/pontos/${encodeURIComponent(point.slug)}">Ver detalhes →</a>
        </div>`,
      );
      const marker = new maplibregl.Marker({ color: "#1F5C40" })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    }

    fitToContent(map, geoPoints, userCoords);
  }, [geoPoints, userCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!userCoords) return;

    const element = document.createElement("div");
    element.className = "dc-user-marker";
    element.setAttribute("aria-label", "Sua localização");

    userMarkerRef.current = new maplibregl.Marker({ element })
      .setLngLat([userCoords.longitude, userCoords.latitude])
      .setPopup(new maplibregl.Popup({ offset: 16 }).setText("Você está aqui"))
      .addTo(map);
  }, [userCoords]);

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("ready");
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const distanceBySlug = useMemo(() => {
    const map = new Map<string, number>();
    if (!userCoords) return map;
    for (const point of geoPoints) {
      map.set(
        point.slug,
        haversineKm(userCoords, {
          latitude: point.latitude,
          longitude: point.longitude,
        }),
      );
    }
    return map;
  }, [geoPoints, userCoords]);

  const cardItems = orderedPoints.map((point) => {
    const distance = distanceBySlug.get(point.slug);
    return (
      <li key={point.slug}>
        <DisposalPointCard
          point={point}
          highlightedTypeSlug={highlightedTypeSlug}
          distanceLabel={
            distance !== undefined ? formatDistance(distance) : undefined
          }
        />
      </li>
    );
  });

  if (geoPoints.length === 0) {
    return (
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cardItems}
      </ul>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
      <div
        ref={containerRef}
        role="application"
        aria-label="Mapa dos pontos que aceitam este resíduo"
        className="h-[300px] w-full overflow-hidden rounded-xl border border-border sm:h-[380px] lg:sticky lg:top-4 lg:h-[480px] lg:flex-1"
      />

      <div className="flex flex-col gap-4 lg:w-[400px] lg:shrink-0">
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={status === "loading"}
            className="h-10 w-full sm:w-auto"
          >
            {status === "loading" ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <LocateFixed aria-hidden className="size-4" />
            )}
            {status === "ready"
              ? "Atualizar minha localização"
              : "Usar minha localização"}
          </Button>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {status === "ready" &&
              "Pontos ordenados do mais próximo ao mais distante de você."}
            {status === "denied" &&
              "Permissão de localização negada. Você pode liberar nas configurações do navegador."}
            {status === "unavailable" &&
              "Não foi possível obter sua localização agora."}
            {status === "idle" &&
              "Veja a distância até cada ponto a partir de onde você está."}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3">{cardItems}</ul>
      </div>
    </div>
  );
}

function fitToContent(
  map: maplibregl.Map,
  geoPoints: (TypeMapPoint & Coords)[],
  userCoords: Coords | null,
) {
  const coords: [number, number][] = geoPoints.map((point) => [
    point.longitude,
    point.latitude,
  ]);
  if (userCoords) coords.push([userCoords.longitude, userCoords.latitude]);

  if (coords.length === 0) return;
  if (coords.length === 1) {
    map.flyTo({ center: coords[0], zoom: 14, duration: 600 });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  coords.forEach((coord) => bounds.extend(coord));
  map.fitBounds(bounds, { padding: 64, maxZoom: 15, duration: 600 });
}
