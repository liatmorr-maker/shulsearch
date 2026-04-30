"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin, Phone, Globe, Mail, ArrowLeft, Heart,
  ExternalLink, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property/property-card";
import {
  DENOMINATION_LABELS,
  DENOMINATION_COLORS,
  formatDistance,
  cn,
} from "@/lib/utils";
import type { MockSynagogue, MockProperty } from "@/lib/mock-data";

// Radius ring radii in miles for the map legend
const RADIUS_MILES = [0.25, 0.5, 1.0];

interface Props {
  synagogue: MockSynagogue;
  nearbyProperties: MockProperty[];
}

export function SynagogueDetailClient({ synagogue, nearbyProperties }: Props) {
  const [saved, setSaved] = useState(false);

  const denomLabel = DENOMINATION_LABELS[synagogue.denomination] ?? synagogue.denomination;
  const denomColor = DENOMINATION_COLORS[synagogue.denomination] ?? "bg-gray-100 text-gray-800";

  const WORSHIP_ICON: Record<string, string> = {
    SYNAGOGUE: "✡", CHURCH: "✝", MOSQUE: "☪", TEMPLE: "🛕",
  };
  const worshipIcon = WORSHIP_ICON[synagogue.worshipType ?? "SYNAGOGUE"] ?? "✡";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/results"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left col ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Header card */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                  {worshipIcon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", denomColor)}>
                      {denomLabel}
                    </span>
                    {synagogue.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {synagogue.name}
                  </h1>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaved((v) => !v)}
                className={cn(saved && "border-rose-300 text-rose-600 bg-rose-50")}
              >
                <Heart className={cn("mr-1.5 h-4 w-4", saved && "fill-current")} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>

            {/* Contact grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-2.5 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <span>
                  {synagogue.address}<br />
                  {synagogue.city}, {synagogue.state} {synagogue.zip}
                </span>
              </div>
              {synagogue.phone && (
                <a
                  href={`tel:${synagogue.phone}`}
                  className="flex items-center gap-2.5 text-slate-600 hover:text-[var(--primary)]"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  {synagogue.phone}
                </a>
              )}
              {synagogue.email && (
                <a
                  href={`mailto:${synagogue.email}`}
                  className="flex items-center gap-2.5 text-slate-600 hover:text-[var(--primary)]"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  {synagogue.email}
                </a>
              )}
              {synagogue.website && (
                <a
                  href={synagogue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[var(--primary)] hover:underline"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  Visit website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Map with radius rings */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Location &amp; Walking Radius
            </h2>
            <div className="relative h-96 overflow-hidden rounded-2xl border border-[var(--border)]">
              <SynagogueMapWithRings synagogue={synagogue} icon={worshipIcon} />
            </div>
            {/* Radius legend */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              {RADIUS_MILES.map((r, i) => (
                <span key={r} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full border-2"
                    style={{ borderColor: ["#3b82f6", "#8b5cf6", "#10b981"][i], background: "transparent" }}
                  />
                  {r} mi walk radius
                </span>
              ))}
            </div>
          </div>

          {/* Nearby properties */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Available Listings Nearby
            </h2>
            {nearbyProperties.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-sm text-slate-500">No active listings within 1.5 miles right now.</p>
                <Link href="/results" className="mt-3 inline-block text-sm text-[var(--primary)] hover:underline">
                  Browse all listings →
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {nearbyProperties.map((p) => {
                  const dist = p.synagogueDistances?.find((sd) => sd.synagogueId === synagogue.id);
                  return (
                    <div key={p.id}>
                      <PropertyCard property={p} />
                      {dist && (
                        <p className="mt-1.5 pl-1 text-xs text-blue-600">
                          {formatDistance(dist.distanceMi)} from this shul · {dist.walkMinutes} min walk
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right col ────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Stats card */}
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card">
              <h3 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                At a Glance
              </h3>
              <div className="space-y-3">
                <StatRow label="Denomination" value={denomLabel} />
                <StatRow label="City" value={`${synagogue.city}, ${synagogue.state}`} />
                <StatRow label="Zip" value={synagogue.zip} />
                <StatRow
                  label="Listings nearby"
                  value={`${nearbyProperties.length} within 1.5 mi`}
                />
                <StatRow
                  label="Status"
                  value={synagogue.isVerified ? "Verified ✓" : "Unverified"}
                  valueClass={synagogue.isVerified ? "text-emerald-600" : "text-amber-600"}
                />
              </div>
            </div>

            {/* Walking distance guide */}
            <div className="rounded-2xl border border-[var(--border)] bg-blue-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-blue-800">Walk Guide</h3>
              <div className="space-y-2 text-sm">
                {[
                  { mi: 0.25, min: 5, label: "Very close" },
                  { mi: 0.5,  min: 10, label: "Easy walk" },
                  { mi: 1.0,  min: 20, label: "Comfortable" },
                  { mi: 1.5,  min: 30, label: "Manageable" },
                ].map((row) => (
                  <div key={row.mi} className="flex items-center justify-between">
                    <span className="text-blue-700">{row.mi} mi — {row.label}</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">~{row.min} min</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href={`/results?q=${encodeURIComponent(synagogue.city)}`}>
              <Button className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Browse listings in {synagogue.city}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: map with PostGIS-style radius rings rendered via Mapbox GL
function SynagogueMapWithRings({ synagogue, icon }: { synagogue: MockSynagogue; icon: string }) {
  return <SynagogueRingMap synagogue={synagogue} icon={icon} />;
}

function SynagogueRingMap({ synagogue, icon }: { synagogue: MockSynagogue; icon: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      // @ts-expect-error CSS import
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [synagogue.lng, synagogue.lat],
        zoom: 14,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Synagogue marker
      const el = document.createElement("div");
      el.innerHTML = `<div style="width:40px;height:40px;border-radius:50%;background:#1a56db;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;box-shadow:0 3px 12px rgba(0,0,0,0.3)">${icon}</div>`;
      new mapboxgl.Marker(el).setLngLat([synagogue.lng, synagogue.lat]).addTo(map);

      map.on("load", () => {
        // Add a GeoJSON source for each radius ring
        const RING_COLORS = ["#3b82f6", "#8b5cf6", "#10b981"];
        const RING_MILES  = [0.25, 0.5, 1.0];

        RING_MILES.forEach((radiusMi, i) => {
          const radiusM = radiusMi * 1609.344;
          const sourceId = `ring-${i}`;

          // Approximate circle as GeoJSON polygon (64-point)
          const coords: [number, number][] = [];
          for (let deg = 0; deg <= 360; deg += 360 / 64) {
            const rad = (deg * Math.PI) / 180;
            // Earth radius in meters ≈ 6378137; degrees per meter at this lat
            const dLat = (radiusM * Math.cos(rad)) / 111320;
            const dLng = (radiusM * Math.sin(rad)) / (111320 * Math.cos((synagogue.lat * Math.PI) / 180));
            coords.push([synagogue.lng + dLng, synagogue.lat + dLat]);
          }

          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "Polygon", coordinates: [coords] },
            },
          });

          map.addLayer({
            id: `ring-fill-${i}`,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": RING_COLORS[i],
              "fill-opacity": 0.06,
            },
          });

          map.addLayer({
            id: `ring-line-${i}`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": RING_COLORS[i],
              "line-width": 1.5,
              "line-dasharray": [3, 2],
            },
          });
        });
      });
    };

    init();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}

// Need React import for the inline component
import React from "react";

function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-medium text-slate-800", valueClass)}>{value}</span>
    </div>
  );
}
