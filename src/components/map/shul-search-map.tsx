"use client";

import { useEffect, useRef } from "react";
import type { MockProperty, MockSynagogue } from "@/lib/mock-data";
import { formatPrice, DENOMINATION_LABELS } from "@/lib/utils";

interface ShulSearchMapProps {
  properties: MockProperty[];
  synagogues: MockSynagogue[];
  highlightedPropertyId?: string | null;
  onPropertyClick?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

export function ShulSearchMap({
  properties,
  synagogues,
  highlightedPropertyId,
  onPropertyClick,
  center = [-80.13, 25.96],
  zoom = 12,
}: ShulSearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];
  };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: mapboxgl.Map;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      // @ts-expect-error – CSS module import, bundled by Next.js
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add synagogue markers (blue ✡)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addSynMarkers = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      synagogues.forEach((syn) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width:32px;height:32px;border-radius:50%;
            background:#1a56db;border:2px solid white;
            display:flex;align-items:center;justify-content:center;
            color:white;font-size:14px;cursor:pointer;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ">✡</div>`;

        const popup = new mapboxgl.Popup({ offset: 20, closeButton: true })
          .setHTML(`
            <div style="padding:12px;min-width:200px">
              <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px">${syn.name}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:6px">${DENOMINATION_LABELS[syn.denomination] ?? syn.denomination}</div>
              <div style="font-size:12px;color:#475569">${syn.address}</div>
              ${syn.phone ? `<div style="font-size:12px;color:#475569">${syn.phone}</div>` : ""}
            </div>
          `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([syn.lng, syn.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        popupsRef.current.push(popup);
      });
    };

    if (map.loaded()) {
      addSynMarkers();
    } else {
      map.on("load", addSynMarkers);
    }
  }, [synagogues]);

  // Add property markers (orange/teal pins)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addPropMarkers = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      properties.forEach((prop) => {
        const isSale = prop.listingType === "SALE";
        const bg = isSale ? "#ff5a1f" : "#0e9f6e";
        const isHighlighted = prop.id === highlightedPropertyId;

        const el = document.createElement("div");
        el.dataset.propertyId = prop.id;
        el.innerHTML = `
          <div style="
            background:${bg};color:white;border-radius:20px;
            padding:4px 10px;font-size:11px;font-weight:700;
            border:2px solid ${isHighlighted ? "white" : "rgba(255,255,255,0.6)"};
            box-shadow:${isHighlighted ? "0 0 0 3px " + bg + ",0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.25)"};
            cursor:pointer;white-space:nowrap;
            transform:${isHighlighted ? "scale(1.15)" : "scale(1)"};
            transition:transform 0.2s;
          ">
            ${formatPrice(prop.price, prop.listingType)}
          </div>`;

        el.addEventListener("click", () => onPropertyClick?.(prop.id));

        const popup = new mapboxgl.Popup({ offset: [0, -8], closeButton: true })
          .setHTML(`
            <div style="padding:0">
              ${prop.imageUrls[0] ? `<img src="${prop.imageUrls[0]}" style="width:100%;height:120px;object-fit:cover" />` : ""}
              <div style="padding:12px">
                <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:2px">${formatPrice(prop.price, prop.listingType)}</div>
                <div style="font-size:12px;font-weight:600;color:#334155;margin-bottom:4px">${prop.title}</div>
                <div style="font-size:11px;color:#64748b">${prop.beds} bd · ${prop.baths} ba${prop.sqft ? ` · ${prop.sqft.toLocaleString()} sqft` : ""}</div>
                ${prop.synagogueDistances?.[0] ? `<div style="font-size:11px;color:#1a56db;margin-top:6px">✡ ${prop.synagogueDistances[0].synagogue.name} · ${prop.synagogueDistances[0].distanceMi.toFixed(2)} mi</div>` : ""}
              </div>
            </div>
          `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([prop.lng, prop.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        popupsRef.current.push(popup);
      });
    };

    // Clear old property markers before re-adding
    // (keep shul markers, which were added in previous effect)
    // We track all markers together; for simplicity we re-initialize on filter changes
    if (map.loaded()) {
      addPropMarkers();
    } else {
      map.on("load", addPropMarkers);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, highlightedPropertyId]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Legend */}
      <div className="absolute bottom-6 left-4 flex flex-col gap-1.5 rounded-xl bg-white/95 p-3 shadow-lg text-xs backdrop-blur-sm">
        <div className="font-semibold text-slate-700 mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a56db] text-white text-[10px]">✡</span>
          <span className="text-slate-600">Synagogue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#ff5a1f]" />
          <span className="text-slate-600">For Sale</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#0e9f6e]" />
          <span className="text-slate-600">For Rent</span>
        </div>
      </div>
    </div>
  );
}
