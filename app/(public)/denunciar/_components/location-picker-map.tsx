"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const FORMOSA_CENTER: [number, number] = [-47.3372, -15.5378];

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
};

export function LocationPickerMap({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const hasInitial = latitude != null && longitude != null;

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
      center: hasInitial ? [longitude!, latitude!] : FORMOSA_CENTER,
      zoom: hasInitial ? 16 : 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    const marker = new maplibregl.Marker({ color: "#B91C1C", draggable: true });
    if (hasInitial) {
      marker.setLngLat([longitude!, latitude!]).addTo(map);
    }

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      onChangeRef.current(lat, lng);
    });

    map.on("click", (event) => {
      marker.setLngLat(event.lngLat).addTo(map);
      onChangeRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // monta o mapa uma única vez; mudanças de valor são sincronizadas abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (latitude == null || longitude == null) return;

    const current = marker.getLngLat();
    if (
      current &&
      Math.abs(current.lng - longitude) < 1e-7 &&
      Math.abs(current.lat - latitude) < 1e-7
    ) {
      return;
    }

    marker.setLngLat([longitude, latitude]).addTo(map);
    map.flyTo({ center: [longitude, latitude], zoom: 16, duration: 600 });
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa para marcar o local da denúncia. Toque no mapa ou arraste o marcador para ajustar."
      className="h-72 w-full overflow-hidden rounded-md border border-border sm:h-80"
    />
  );
}
