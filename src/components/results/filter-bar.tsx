"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFilterStore, type DistanceFilter, type ListingType, type Denomination, type FilterState } from "@/store/filter-store";
import { DENOMINATION_LABELS } from "@/lib/utils";

const DISTANCE_OPTIONS: { label: string; value: DistanceFilter }[] = [
  { label: "Any distance", value: null },
  { label: "¼ mile", value: 0.25 },
  { label: "½ mile", value: 0.5 },
  { label: "1 mile", value: 1 },
  { label: "1½ miles", value: 1.5 },
];

const LISTING_TYPES: { label: string; value: ListingType }[] = [
  { label: "Sale & Rent", value: "ALL" },
  { label: "For Sale", value: "SALE" },
  { label: "For Rent", value: "RENT" },
];

const BEDS = [0, 1, 2, 3, 4, 5];

const DENOMINATIONS = [
  { label: "All Denominations", value: "ALL" },
  ...Object.entries(DENOMINATION_LABELS).map(([value, label]) => ({ value, label })),
];

export function FilterBar({ resultCount }: { resultCount: number }) {
  const {
    listingType, setListingType,
    maxDistanceMi, setMaxDistance,
    priceMax, setPriceRange, priceMin,
    bedsMin, setBedsMin,
    denomination, setDenomination,
    sortBy, setSortBy,
    reset,
  } = useFilterStore();

  const hasActiveFilters =
    listingType !== "ALL" ||
    maxDistanceMi !== null ||
    bedsMin > 0 ||
    denomination !== "ALL";

  return (
    <div className="sticky top-16 z-40 border-b border-[var(--border)] bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {/* Icon */}
        <SlidersHorizontal className="h-4 w-4 text-slate-500 flex-shrink-0" />

        {/* Listing type toggle */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {LISTING_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setListingType(t.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                listingType === t.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Distance to Shul */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {DISTANCE_OPTIONS.map((d) => (
            <button
              key={String(d.value)}
              onClick={() => setMaxDistance(d.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                maxDistanceMi === d.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Price max */}
        <Select
          value={String(priceMax)}
          onValueChange={(v) => setPriceRange(priceMin, Number(v))}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Max Price" />
          </SelectTrigger>
          <SelectContent>
            {[
              { label: "Any price", v: 10_000_000_00 },
              { label: "Under $500K", v: 50_000_000 },
              { label: "Under $1M", v: 100_000_000 },
              { label: "Under $2M", v: 200_000_000 },
              { label: "Under $5M", v: 500_000_000 },
              { label: "Under $2K/mo", v: 200_000 },
              { label: "Under $4K/mo", v: 400_000 },
              { label: "Under $8K/mo", v: 800_000 },
            ].map((o) => (
              <SelectItem key={o.v} value={String(o.v)} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Beds */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] overflow-hidden">
          <span className="pl-2.5 text-xs text-slate-500">Beds:</span>
          {BEDS.map((b) => (
            <button
              key={b}
              onClick={() => setBedsMin(b)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium transition-colors",
                bedsMin === b
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {b === 0 ? "Any" : `${b}+`}
            </button>
          ))}
        </div>

        {/* Denomination */}
        <Select value={denomination} onValueChange={(v) => setDenomination(v as Denomination)}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DENOMINATIONS.map((d) => (
              <SelectItem key={d.value} value={d.value} className="text-xs">
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as FilterState["sortBy"])}>
          <SelectTrigger className="h-8 w-40 text-xs ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="proximity" className="text-xs">Sort: Proximity</SelectItem>
            <SelectItem value="price_asc" className="text-xs">Sort: Price ↑</SelectItem>
            <SelectItem value="price_desc" className="text-xs">Sort: Price ↓</SelectItem>
            <SelectItem value="newest" className="text-xs">Sort: Newest</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 px-2 text-xs text-slate-500">
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Result count */}
      <div className="border-t border-slate-100 px-4 py-1.5 text-xs text-slate-500">
        {resultCount} listing{resultCount !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
