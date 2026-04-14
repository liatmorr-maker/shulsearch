"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, LayoutGrid, Map as MapIcon } from "lucide-react";
import { PROPERTIES, SYNAGOGUES } from "@/lib/mock-data";
import { PropertyCard } from "@/components/property/property-card";
import { FilterBar } from "@/components/results/filter-bar";
import { useFilterStore } from "@/store/filter-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dynamically import map to avoid SSR issues with mapbox-gl
const ShulSearchMap = dynamic(
  () => import("@/components/map/shul-search-map").then((m) => m.ShulSearchMap),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center">
      <div className="text-center text-slate-400">
        <MapIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  );
}

interface ResultsClientProps {
  searchParams: { q?: string; city?: string; zip?: string };
}

export function ResultsClient({ searchParams }: ResultsClientProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const {
    listingType, maxDistanceMi, priceMin, priceMax,
    bedsMin, denomination, sortBy, setQuery,
  } = useFilterStore();

  // Sync URL query into store on mount
  useEffect(() => {
    const q = searchParams.q ?? searchParams.city ?? searchParams.zip ?? "";
    setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & sort
  const filtered = useMemo(() => {
    let results = PROPERTIES.filter((p) => p.isApproved && p.status === "ACTIVE");

    // Listing type
    if (listingType !== "ALL") {
      results = results.filter((p) => p.listingType === listingType);
    }

    // Max shul distance
    if (maxDistanceMi !== null) {
      results = results.filter(
        (p) => p.nearestSynagugueDist != null && p.nearestSynagugueDist <= maxDistanceMi
      );
    }

    // Price
    results = results.filter((p) => p.price >= priceMin && p.price <= priceMax);

    // Beds
    if (bedsMin > 0) {
      results = results.filter((p) => p.beds >= bedsMin);
    }

    // Denomination filter – check if any nearby shul matches
    if (denomination !== "ALL") {
      results = results.filter((p) =>
        p.synagogueDistances?.some((sd) => sd.synagogue.denomination === denomination)
      );
    }

    // Sort
    switch (sortBy) {
      case "proximity":
        results.sort((a, b) => (b.proximityScore ?? 0) - (a.proximityScore ?? 0));
        break;
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // mock: already in insertion order; reverse
        results.reverse();
        break;
    }

    return results;
  }, [listingType, maxDistanceMi, priceMin, priceMax, bedsMin, denomination, sortBy]);

  // Which synagogues to show on map (only those relevant to filtered props)
  const visibleSynagogueIds = useMemo(() => {
    const ids = new Set<string>();
    filtered.forEach((p) =>
      p.synagogueDistances?.forEach((sd) => ids.add(sd.synagogueId))
    );
    return ids;
  }, [filtered]);

  const visibleSynagogues = useMemo(
    () => SYNAGOGUES.filter((s) => visibleSynagogueIds.has(s.id)),
    [visibleSynagogueIds]
  );

  const searchLabel =
    searchParams.q ?? searchParams.city ?? searchParams.zip ?? "South Florida";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Filter bar */}
      <FilterBar resultCount={filtered.length} />

      {/* Mobile toggle */}
      <div className="flex md:hidden items-center justify-between border-b border-[var(--border)] bg-white px-4 py-2">
        <span className="text-sm text-slate-500">
          <MapPin className="inline h-3.5 w-3.5 mr-1" />
          {searchLabel}
        </span>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => setMobileView("list")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
              mobileView === "list" ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
              mobileView === "map" ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600"
            )}
          >
            <MapIcon className="h-3.5 w-3.5" /> Map
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: property cards */}
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-slate-50",
            // Desktop: always visible at 45% width
            "md:w-[460px] lg:w-[520px] md:flex",
            // Mobile: conditional
            mobileView === "list" ? "flex w-full" : "hidden"
          )}
        >
          {/* Search heading */}
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-slate-800">
                Results near{" "}
                <span className="text-[var(--primary)]">{searchLabel}</span>
              </span>
            </div>
          </div>

          {/* Cards list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isHighlighted={highlightedId === property.id}
                  onHover={setHighlightedId}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel: map */}
        <div
          className={cn(
            "flex-1 overflow-hidden",
            mobileView === "map" ? "flex w-full" : "hidden md:flex"
          )}
        >
          <ShulSearchMap
            properties={filtered}
            synagogues={visibleSynagogues}
            highlightedPropertyId={highlightedId}
            onPropertyClick={(id) => {
              setHighlightedId(id);
              // On mobile, switch to list view when clicking map pin
              setMobileView("list");
            }}
            center={[-80.13, 25.96]}
            zoom={12}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const reset = useFilterStore((s) => s.reset);
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">🏠</div>
      <h3 className="mb-2 text-lg font-semibold text-slate-800">No listings found</h3>
      <p className="mb-6 text-sm text-slate-500 max-w-xs">
        Try adjusting your filters — expand the shul distance or relax the price range.
      </p>
      <Button variant="outline" onClick={reset}>
        Clear Filters
      </Button>
    </div>
  );
}
