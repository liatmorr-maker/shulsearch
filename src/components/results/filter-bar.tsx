"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFilterStore, type DistanceFilter, type ListingType, type Denomination, type FilterState, HOME_TYPES, ALL_HOME_TYPES, type HomeTypeLabel } from "@/store/filter-store";
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

const BEDS =  [0, 1, 2, 3, 4, 5];
const BATHS = [
  { label: "Any", value: 0 },
  { label: "1+",  value: 1 },
  { label: "1.5+", value: 1.5 },
  { label: "2+",  value: 2 },
  { label: "3+",  value: 3 },
  { label: "4+",  value: 4 },
];

const DENOMINATIONS = [
  { label: "All Denominations", value: "ALL" },
  ...Object.entries(DENOMINATION_LABELS).map(([value, label]) => ({ value, label })),
];

const DEFAULT_MAX = 10_000_000_00; // $10M in cents

function formatPriceLabel(cents: number, isMax = false): string {
  if (isMax && cents >= DEFAULT_MAX) return "";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

function PriceFilter() {
  const { priceMin, priceMax, setPriceRange } = useFilterStore();
  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync inputs when popover opens
  useEffect(() => {
    if (open) {
      setMinInput(priceMin > 0 ? String(Math.round(priceMin / 100)) : "");
      setMaxInput(priceMax < DEFAULT_MAX ? String(Math.round(priceMax / 100)) : "");
    }
  }, [open, priceMin, priceMax]);

  function apply() {
    const min = minInput ? Math.round(parseFloat(minInput.replace(/,/g, "")) * 100) : 0;
    const max = maxInput ? Math.round(parseFloat(maxInput.replace(/,/g, "")) * 100) : DEFAULT_MAX;
    setPriceRange(min, max);
    setOpen(false);
  }

  function clear() {
    setMinInput("");
    setMaxInput("");
    setPriceRange(0, DEFAULT_MAX);
    setOpen(false);
  }

  const hasPrice = priceMin > 0 || priceMax < DEFAULT_MAX;
  const label = hasPrice
    ? `${priceMin > 0 ? formatPriceLabel(priceMin) : "No min"} – ${priceMax < DEFAULT_MAX ? formatPriceLabel(priceMax) : "No max"}`
    : "Any price";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
          hasPrice
            ? "border-blue-400 bg-blue-50 text-blue-700"
            : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        {label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 w-72 rounded-xl border border-[var(--border)] bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Price Range</span>
            {hasPrice && (
              <button onClick={clear} className="text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="No min"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border)] pl-6 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            <span className="mt-5 text-slate-400">–</span>

            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Max</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="No max"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border)] pl-6 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={apply}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Home Type multi-select filter ──────────────────────────────────────────────
function HomeTypeFilter() {
  const { homeTypes, setHomeTypes } = useFilterStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle(label: HomeTypeLabel) {
    if (homeTypes.includes(label)) {
      setHomeTypes(homeTypes.filter((t) => t !== label));
    } else {
      setHomeTypes([...homeTypes, label]);
    }
  }

  const allSelected = homeTypes.length === HOME_TYPES.length;
  const noneSelected = homeTypes.length === 0;

  function toggleAll() {
    setHomeTypes(allSelected ? [] : ALL_HOME_TYPES);
  }

  const hasFilter = !allSelected;
  const label = allSelected
    ? "Home Type"
    : noneSelected
    ? "Home Type"
    : homeTypes.length === 1
    ? homeTypes[0]
    : `${homeTypes.length} types`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
          hasFilter
            ? "border-blue-400 bg-blue-50 text-blue-700"
            : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        {label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 w-52 rounded-xl border border-[var(--border)] bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Home Type</span>
            <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline">
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="space-y-1">
            {HOME_TYPES.map(({ label: typeLabel }) => (
              <label
                key={typeLabel}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={homeTypes.includes(typeLabel)}
                  onChange={() => toggle(typeLabel)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm text-slate-700">{typeLabel}</span>
              </label>
            ))}
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

export function FilterBar({ resultCount }: { resultCount: number }) {
  const {
    listingType, setListingType,
    maxDistanceMi, setMaxDistance,
    bedsMin, setBedsMin,
    bathsMin, setBathsMin,
    denomination, setDenomination,
    sortBy, setSortBy,
    reset,
    priceMin, priceMax,
    homeTypes,
  } = useFilterStore();

  const hasActiveFilters =
    listingType !== "ALL" ||
    maxDistanceMi !== null ||
    bedsMin > 0 ||
    bathsMin > 0 ||
    denomination !== "ALL" ||
    priceMin > 0 ||
    priceMax < DEFAULT_MAX ||
    homeTypes.length < ALL_HOME_TYPES.length;

  return (
    <div className="sticky top-16 z-40 border-b border-[var(--border)] bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-500 flex-shrink-0" />

        {/* Listing type */}
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

        {/* Distance */}
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

        {/* Price — Min/Max popover */}
        <PriceFilter />

        {/* Home Type */}
        <HomeTypeFilter />

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

        {/* Baths */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] overflow-hidden">
          <span className="pl-2.5 text-xs text-slate-500">Baths:</span>
          {BATHS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setBathsMin(value)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium transition-colors",
                bathsMin === value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {label}
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

      <div className="border-t border-slate-100 px-4 py-1.5 text-xs text-slate-500">
        {resultCount} listing{resultCount !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
