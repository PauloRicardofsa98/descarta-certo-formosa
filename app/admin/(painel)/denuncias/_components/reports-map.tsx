"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import type { ReportStatus } from "@/app/_generated/prisma/client";

import { REPORT_STATUS_META } from "../_status";

export type ReportMarker = {
  id: string;
  protocol: string;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  description: string;
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

function buildPopupHtml(report: ReportMarker): string {
  const meta = REPORT_STATUS_META[report.status];
  const desc =
    report.description.length > 90
      ? `${report.description.slice(0, 90)}…`
      : report.description;
  return `
    <div class="cn-popup">
      <strong class="cn-popup-title">${escapeHtml(report.protocol)}</strong>
      <p class="cn-popup-address">${escapeHtml(desc)}</p>
      <div class="cn-popup-tags">
        <span class="cn-popup-tag" style="background:${meta.markerColor};color:#fff">${escapeHtml(meta.label)}</span>
      </div>
      <a class="cn-popup-link" href="/admin/denuncias/${encodeURIComponent(report.id)}">Abrir denúncia →</a>
    </div>
  `;
}

export function ReportsMap({ reports }: { reports: ReportMarker[] }) {
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

    if (reports.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    for (const report of reports) {
      const meta = REPORT_STATUS_META[report.status];
      const popup = new maplibregl.Popup({ offset: 24 }).setHTML(
        buildPopupHtml(report),
      );
      const marker = new maplibregl.Marker({ color: meta.markerColor })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([report.longitude, report.latitude]);
    }

    if (reports.length === 1) {
      map.flyTo({
        center: [reports[0].longitude, reports[0].latitude],
        zoom: 15,
        duration: 600,
      });
    } else {
      map.fitBounds(bounds, { padding: 64, maxZoom: 15, duration: 600 });
    }
  }, [reports]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa de denúncias de descarte irregular"
      className="h-[60vh] min-h-80 w-full overflow-hidden rounded-lg border border-border"
    />
  );
}
