"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

export type MapPoint = {
  slug: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteTypeNames: string[];
};

const FORMOSA_CENTER: [number, number] = [-47.3372, -15.5378];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPopupHtml(point: MapPoint): string {
  const types = point.wasteTypeNames
    .slice(0, 4)
    .map((name) => `<span class="cn-popup-tag">${escapeHtml(name)}</span>`)
    .join("");
  const more =
    point.wasteTypeNames.length > 4
      ? `<span class="cn-popup-more">+${point.wasteTypeNames.length - 4}</span>`
      : "";
  return `
    <div class="cn-popup">
      <strong class="cn-popup-title">${escapeHtml(point.name)}</strong>
      <p class="cn-popup-address">${escapeHtml(point.address)}</p>
      <div class="cn-popup-tags">${types}${more}</div>
      <a class="cn-popup-link" href="/pontos/${encodeURIComponent(point.slug)}">Ver detalhes →</a>
    </div>
  `;
}

type Props = {
  points: MapPoint[];
};

export function MapaCanvas({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

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
      center: FORMOSA_CENTER,
      zoom: 12,
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
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (points.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    for (const point of points) {
      const popup = new maplibregl.Popup({ offset: 24 }).setHTML(
        buildPopupHtml(point),
      );

      const marker = new maplibregl.Marker({ color: "#1F5C40" })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([point.longitude, point.latitude]);
    }

    if (points.length === 1) {
      map.flyTo({
        center: [points[0].longitude, points[0].latitude],
        zoom: 15,
        duration: 600,
      });
    } else {
      map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 600 });
    }
  }, [points]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa de pontos de descarte"
      className="cn-mapa-canvas h-full w-full"
    />
  );
}
