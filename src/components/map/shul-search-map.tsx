"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Bed, Bath, Square } from "lucide-react";
import type { MockProperty, MockSynagogue } from "@/lib/mock-data";
import { formatPrice, formatDistance, DENOMINATION_LABELS } from "@/lib/utils";

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
  const propMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const synMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const mapLoadedRef = useRef(false);

  // React-managed popup state
  const [popupProperty, setPopupProperty] = useState<MockProperty | null>(null);

  // ── Initialize map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      // @ts-expect-error CSS side-effect
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;

      map.on("load", () => {
        mapLoadedRef.current = true;
        renderPropMarkers(map, properties, highlightedPropertyId);
        renderSynMarkers(map, synagogues);
      });
    };

    init();

    return () => {
      propMarkersRef.current.forEach((m) => m.remove());
      synMarkersRef.current.forEach((m) => m.remove());
      propMarkersRef.current = [];
      synMarkersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render property markers when filtered list or highlight changes ─────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    propMarkersRef.current.forEach((m) => m.remove());
    propMarkersRef.current = [];
    renderPropMarkers(map, properties, highlightedPropertyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, highlightedPropertyId]);

  // ── Re-render synagogue markers when synagogue list changes ────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    synMarkersRef.current.forEach((m) => m.remove());
    synMarkersRef.current = [];
    renderSynMarkers(map, synagogues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synagogues]);

  // ── Fly to new center when prop changes (e.g. user picks a different shul) ─
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    if (isNaN(center[0]) || isNaN(center[1])) return;
    map.flyTo({ center, zoom, duration: 800 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);

  // ── Helper: render property markers ───────────────────────────────────────
  async function renderPropMarkers(
    map: mapboxgl.Map,
    props: MockProperty[],
    highlightedId: string | null | undefined
  ) {
    const mapboxgl = (await import("mapbox-gl")).default;
    const visible = props.slice(0, 300);

    visible.forEach((prop) => {
      // Skip any property with missing/invalid coordinates
      if (!prop.lat || !prop.lng || isNaN(prop.lat) || isNaN(prop.lng)) return;
      const isSale = prop.listingType === "SALE";
      const bg = isSale ? "#ff5a1f" : "#0e9f6e";
      const isHighlighted = prop.id === highlightedId;

      const el = document.createElement("div");
      el.dataset.propertyId = prop.id;
      el.innerHTML = `
        <div style="
          background:${bg};color:white;border-radius:20px;
          padding:4px 10px;font-size:11px;font-weight:700;
          border:2px solid ${isHighlighted ? "white" : "rgba(255,255,255,0.6)"};
          box-shadow:${isHighlighted ? `0 0 0 3px ${bg},0 4px 12px rgba(0,0,0,0.3)` : "0 2px 8px rgba(0,0,0,0.25)"};
          cursor:pointer;white-space:nowrap;
          transform:${isHighlighted ? "scale(1.15)" : "scale(1)"};
          transition:transform 0.2s;
        ">
          ${formatPrice(prop.price, prop.listingType)}
        </div>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setPopupProperty(prop);
        onPropertyClick?.(prop.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([prop.lng, prop.lat])
        .addTo(map);

      propMarkersRef.current.push(marker);
    });
  }

  // ── Helper: render synagogue markers ──────────────────────────────────────
  async function renderSynMarkers(map: mapboxgl.Map, syns: MockSynagogue[]) {
    const mapboxgl = (await import("mapbox-gl")).default;

    syns.forEach((syn) => {
      if (!syn.lat || !syn.lng || isNaN(syn.lat) || isNaN(syn.lng)) return;
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:#1a56db;border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:13px;cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ">✡</div>`;

      const popup = new mapboxgl.Popup({ offset: 18, closeButton: false, closeOnClick: false }).setHTML(`
        <div style="padding:10px;min-width:190px">
          <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:3px">${syn.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:4px">${DENOMINATION_LABELS[syn.denomination] ?? syn.denomination}</div>
          <div style="font-size:11px;color:#475569">${syn.address}</div>
          ${syn.phone ? `<div style="font-size:11px;color:#475569">${syn.phone}</div>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([syn.lng, syn.lat])
        .addTo(map);

      // Show popup on hover, hide when mouse leaves
      el.addEventListener("mouseenter", () => popup.setLngLat([syn.lng, syn.lat]).addTo(map));
      el.addEventListener("mouseleave", () => popup.remove());

      synMarkersRef.current.push(marker);
    });
  }

  // Close popup when clicking the map background
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => setPopupProperty(null);
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [mapRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* ── React-managed property popup card ──────────────────────────────── */}
      {popupProperty && (
        <div
          className="absolute bottom-6 right-4 z-20 w-72 overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={() => setPopupProperty(null)}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/30 p-1 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Image */}
          {popupProperty.imageUrls[0] ? (
            <div className="relative h-36 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={popupProperty.imageUrls[0]}
                alt={popupProperty.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{
                    background: popupProperty.listingType === "SALE" ? "#ff5a1f" : "#0e9f6e",
                  }}
                >
                  {popupProperty.listingType === "SALE" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-12 w-full bg-slate-100" />
          )}

          {/* Content */}
          <div className="p-3">
            <div className="mb-0.5 text-lg font-extrabold text-slate-900">
              {formatPrice(popupProperty.price, popupProperty.listingType)}
            </div>
            <div className="mb-2 text-xs font-medium text-slate-600 leading-snug line-clamp-2">
              {popupProperty.title}
            </div>

            {/* Stats row */}
            <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" /> {popupProperty.beds} bd
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" /> {popupProperty.baths} ba
              </span>
              {popupProperty.sqft && (
                <span className="flex items-center gap-1">
                  <Square className="h-3 w-3" /> {popupProperty.sqft.toLocaleString()} sqft
                </span>
              )}
            </div>

            {/* Nearest shul */}
            {popupProperty.synagogueDistances?.[0] && (
              <div className="mb-3 rounded-lg bg-blue-50 px-2.5 py-2 text-xs">
                <span className="font-semibold text-blue-800">✡ </span>
                <span className="text-blue-700 font-medium">
                  {popupProperty.synagogueDistances[0].synagogue.name}
                </span>
                <span className="text-blue-500">
                  {" · "}
                  {formatDistance(popupProperty.synagogueDistances[0].distanceMi)}
                  {" · "}
                  {popupProperty.synagogueDistances[0].walkMinutes} min walk
                </span>
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/property/${popupProperty.id}`}
              className="block w-full rounded-lg bg-blue-600 py-2 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              View Listing →
            </Link>
          </div>
        </div>
      )}

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
