"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MapPin, LayoutGrid, Map as MapIcon, Search } from "lucide-react";
import type { MockProperty, MockSynagogue } from "@/lib/mock-data";
import { PropertyCard } from "@/components/property/property-card";
import { FilterBar } from "@/components/results/filter-bar";
import { useFilterStore, HOME_TYPES, ALL_HOME_TYPES } from "@/store/filter-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_CHIPS = [
  "Aventura",
  "Boca Raton",
  "Sunny Isles Beach",
  "Hollywood",
  "Surfside",
  "Bal Harbour",
  "Cooper City",
  "Davie",
];

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
  searchParams: { q?: string; city?: string; zip?: string; worshipType?: string };
  initialProperties: MockProperty[];
  initialSynagogues: MockSynagogue[];
  initialWorshipType?: import("@/store/filter-store").WorshipType;
}

export function ResultsClient({
  searchParams,
  initialProperties,
  initialSynagogues,
  initialWorshipType = "SYNAGOGUE",
}: ResultsClientProps) {
  const router = useRouter();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Trigger map resize when switching to map view on mobile
  useEffect(() => {
    if (mobileView === "map") {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    }
  }, [mobileView]);
  const [searchInput, setSearchInput] = useState(
    searchParams.q ?? searchParams.city ?? searchParams.zip ?? ""
  );

  const {
    listingType, worshipType, maxDistanceMi, priceMin, priceMax,
    bedsMin, bathsMin, denomination, homeTypes, sortBy, setQuery, setWorshipType,
  } = useFilterStore();

  // Sync initialWorshipType (from URL/server) into the store on mount and when it changes
  useEffect(() => {
    setWorshipType(initialWorshipType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWorshipType]);

  useEffect(() => {
    const q = searchParams.q ?? searchParams.city ?? searchParams.zip ?? "";
    setQuery(q);
    setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.q, searchParams.city, searchParams.zip]);

  function handleSearch(q: string) {
    if (!q.trim()) return;
    router.push(`/results?q=${encodeURIComponent(q.trim())}`);
  }

  // Use store worship type if user has explicitly changed it, otherwise use server-resolved value
  const effectiveWorshipType = worshipType !== "SYNAGOGUE" ? worshipType : initialWorshipType;

  const filtered = useMemo(() => {
    let results = [...initialProperties];

    // City / text query filter (q param like "Hollywood" or "33160")
    const q = (searchParams.q ?? searchParams.city ?? "").trim().toLowerCase();
    if (q) {
      results = results.filter(
        (p) =>
          p.city.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.zip.toLowerCase().includes(q)
      );
    }

    if (listingType !== "ALL") {
      results = results.filter((p) => p.listingType === listingType);
    }

    if (maxDistanceMi !== null) {
      if (worshipType === "SYNAGOGUE") {
        results = results.filter((p) => p.nearestSynagugueDist != null && p.nearestSynagugueDist <= maxDistanceMi);
      } else if (worshipType === "CHURCH") {
        results = results.filter((p) => p.nearestChurchDist != null && p.nearestChurchDist <= maxDistanceMi);
      } else if (worshipType === "MOSQUE") {
        results = results.filter((p) => p.nearestMosqueDist != null && p.nearestMosqueDist <= maxDistanceMi);
      } else if (worshipType === "TEMPLE") {
        results = results.filter((p) => p.nearestTempleDist != null && p.nearestTempleDist <= maxDistanceMi);
      }
    }

    results = results.filter((p) => p.price >= priceMin && p.price <= priceMax);

    if (bedsMin > 0) {
      results = results.filter((p) => p.beds >= bedsMin);
    }

    if (bathsMin > 0) {
      results = results.filter((p) => p.baths >= bathsMin);
    }

    if (worshipType === "SYNAGOGUE" && denomination !== "ALL") {
      results = results.filter((p) =>
        p.synagogueDistances?.some((sd) => sd.synagogue.denomination === denomination)
      );
    }

    // Home type filter — only apply when not all types are selected
    if (homeTypes.length > 0 && homeTypes.length < ALL_HOME_TYPES.length) {
      results = results.filter((p) => {
        const titleLower = p.title.toLowerCase();
        return homeTypes.some((selectedType) => {
          const typeConfig = HOME_TYPES.find((ht) => ht.label === selectedType);
          return typeConfig?.keywords.some((kw) => titleLower.includes(kw));
        });
      });
    }

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
        results.reverse();
        break;
    }

    return results;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProperties, listingType, worshipType, maxDistanceMi, priceMin, priceMax, bedsMin, bathsMin, denomination, homeTypes, sortBy, searchParams.city, searchParams.q]);

  const visibleSynagogueIds = useMemo(() => {
    const ids = new Set<string>();
    filtered.forEach((p) => {
      p.synagogueDistances?.forEach((sd) => ids.add(sd.synagogueId));
    });
    return ids;
  }, [filtered]);

  const visibleSynagogues = useMemo(() => {
    if (worshipType === "SYNAGOGUE") {
      return initialSynagogues.filter(
        (s) => visibleSynagogueIds.has(s.id) && (s.worshipType ?? "SYNAGOGUE") === "SYNAGOGUE"
      );
    }
    // For other types, show all places of that type in the loaded data
    return initialSynagogues.filter(
      (s) => (s.worshipType ?? "SYNAGOGUE") === worshipType
    );
  },
    [initialSynagogues, visibleSynagogueIds, worshipType]
  );

  const searchLabel =
    searchParams.q ?? searchParams.city ?? searchParams.zip ?? "South Florida";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Search bar + quick chips */}
      <div className="border-b border-[var(--border)] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-lg border border-[var(--border)] pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="City, zip code, or neighborhood…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchInput)}
              />
            </div>
            <Button
              size="sm"
              className="px-4"
              onClick={() => handleSearch(searchInput)}
            >
              Search
            </Button>
          </div>
          {/* Quick chips — hidden on mobile to save vertical space */}
          <div className="hidden md:flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((city) => (
              <button
                key={city}
                onClick={() => handleSearch(city)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  searchLabel.toLowerCase() === city.toLowerCase()
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-[var(--border)] bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FilterBar resultCount={filtered.length} />

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

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-slate-50",
            "md:w-[460px] lg:w-[520px] md:flex",
            mobileView === "list" ? "flex w-full" : "hidden"
          )}
        >
          {/* "Results near X" sub-header — desktop only; mobile already shows location in the toggle bar */}
          <div className="hidden md:flex items-center justify-between border-b border-[var(--border)] bg-white px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">
              Results near{" "}
              <span className="text-[var(--primary)]">{searchLabel}</span>
            </span>
          </div>

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

        <div
          className={cn(
            "overflow-hidden",
            mobileView === "map" ? "flex w-full h-full flex-1" : "hidden md:flex md:flex-1"
          )}
        >
          <ShulSearchMap
            properties={filtered}
            synagogues={visibleSynagogues}
            highlightedPropertyId={highlightedId}
            onPropertyClick={(id) => {
              setHighlightedId(id);
              setMobileView("list");
            }}
            center={[-80.20, 26.10]}
            zoom={searchParams.q ?? searchParams.city ?? searchParams.zip ? 12 : 10}
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
