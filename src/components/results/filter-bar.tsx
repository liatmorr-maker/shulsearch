"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFilterStore, type DistanceFilter, type ListingType, type Denomination, type FilterState, type WorshipType, HOME_TYPES, ALL_HOME_TYPES, type HomeTypeLabel } from "@/store/filter-store";
import { DENOMINATION_LABELS } from "@/lib/utils";

const WORSHIP_TYPES: { label: string; emoji: string; value: WorshipType }[] = [
  { label: "Synagogue", emoji: "✡", value: "SYNAGOGUE" },
  { label: "Church",    emoji: "✝", value: "CHURCH" },
  { label: "Mosque",    emoji: "☪", value: "MOSQUE" },
  { label: "Temple",    emoji: "🛕", value: "TEMPLE" },
];

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

const BEDS  = [0, 1, 2, 3, 4, 5];
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

const DEFAULT_MAX = 10_000_000_00;

function formatPriceLabel(cents: number, isMax = false): string {
  if (isMax && cents >= DEFAULT_MAX) return "";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

// ── Price Filter (desktop popover) ────────────────────────────────────────────
function PriceFilter() {
  const { priceMin, priceMax, setPriceRange } = useFilterStore();
  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
          hasPrice ? "border-blue-400 bg-blue-50 text-blue-700" : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        {label} <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-10 left-0 z-50 w-72 rounded-xl border border-[var(--border)] bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Price Range</span>
            {hasPrice && <button onClick={() => { setPriceRange(0, DEFAULT_MAX); setOpen(false); }} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                <input type="number" placeholder="No min" value={minInput} onChange={(e) => setMinInput(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border)] pl-6 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
              </div>
            </div>
            <span className="mt-5 text-slate-400">–</span>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Max</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                <input type="number" placeholder="No max" value={maxInput} onChange={(e) => setMaxInput(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border)] pl-6 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
              </div>
            </div>
          </div>
          <Button className="w-full" onClick={apply}>Apply</Button>
        </div>
      )}
    </div>
  );
}

// ── Home Type Filter ──────────────────────────────────────────────────────────
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
    setHomeTypes(homeTypes.includes(label) ? homeTypes.filter((t) => t !== label) : [...homeTypes, label]);
  }

  const allSelected = homeTypes.length === HOME_TYPES.length;
  const hasFilter = !allSelected;
  const label = allSelected ? "Home Type" : homeTypes.length === 1 ? homeTypes[0] : `${homeTypes.length} types`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
          hasFilter ? "border-blue-400 bg-blue-50 text-blue-700" : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        {label} <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-10 left-0 z-50 w-52 rounded-xl border border-[var(--border)] bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Home Type</span>
            <button onClick={() => setHomeTypes(allSelected ? [] : ALL_HOME_TYPES)} className="text-xs text-blue-600 hover:underline">
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="space-y-1">
            {HOME_TYPES.map(({ label: typeLabel }) => (
              <label key={typeLabel} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input type="checkbox" checked={homeTypes.includes(typeLabel)} onChange={() => toggle(typeLabel)} className="h-4 w-4 rounded accent-blue-600" />
                <span className="text-sm text-slate-700">{typeLabel}</span>
              </label>
            ))}
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => setOpen(false)}>Apply</Button>
        </div>
      )}
    </div>
  );
}

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────
function MobileFilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    listingType, setListingType,
    worshipType, setWorshipType,
    maxDistanceMi, setMaxDistance,
    bedsMin, setBedsMin,
    bathsMin, setBathsMin,
    denomination, setDenomination,
    sortBy, setSortBy,
    priceMin, priceMax, setPriceRange,
    homeTypes, setHomeTypes,
    reset,
  } = useFilterStore();
  const isSynagogue = worshipType === "SYNAGOGUE";

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  useEffect(() => {
    if (open) {
      setMinInput(priceMin > 0 ? String(Math.round(priceMin / 100)) : "");
      setMaxInput(priceMax < DEFAULT_MAX ? String(Math.round(priceMax / 100)) : "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, priceMin, priceMax]);

  if (!open) return null;

  function applyPrice() {
    const min = minInput ? Math.round(parseFloat(minInput.replace(/,/g, "")) * 100) : 0;
    const max = maxInput ? Math.round(parseFloat(maxInput.replace(/,/g, "")) * 100) : DEFAULT_MAX;
    setPriceRange(min, max);
  }

  function toggleHomeType(label: HomeTypeLabel) {
    setHomeTypes(homeTypes.includes(label) ? homeTypes.filter((t) => t !== label) : [...homeTypes, label]);
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
          <h2 className="text-base font-bold text-slate-900">Filters</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* Worship Type */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Find homes near a…</p>
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
              {WORSHIP_TYPES.map((w) => (
                <button key={w.value} onClick={() => setWorshipType(w.value)}
                  className={cn("flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                    worshipType === w.value ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600")}>
                  <span>{w.emoji}</span> {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Listing Type</p>
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
              {LISTING_TYPES.map((t) => (
                <button key={t.value} onClick={() => setListingType(t.value)}
                  className={cn("flex-1 py-2.5 text-sm font-medium transition-colors",
                    listingType === t.value ? "bg-blue-600 text-white" : "bg-white text-slate-600")}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Distance to {WORSHIP_TYPES.find((w) => w.value === worshipType)?.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((d) => (
                <button key={String(d.value)} onClick={() => setMaxDistance(d.value)}
                  className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    maxDistanceMi === d.value ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--border)] bg-white text-slate-600")}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Price Range</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" placeholder="Min" value={minInput}
                  onChange={(e) => { setMinInput(e.target.value); }}
                  onBlur={applyPrice}
                  className="h-11 w-full rounded-xl border border-[var(--border)] pl-7 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
              </div>
              <span className="text-slate-400">–</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" placeholder="Max" value={maxInput}
                  onChange={(e) => { setMaxInput(e.target.value); }}
                  onBlur={applyPrice}
                  className="h-11 w-full rounded-xl border border-[var(--border)] pl-7 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Beds */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Bedrooms</p>
            <div className="flex gap-2">
              {BEDS.map((b) => (
                <button key={b} onClick={() => setBedsMin(b)}
                  className={cn("flex-1 rounded-xl border py-2 text-sm font-medium transition-colors",
                    bedsMin === b ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--border)] bg-white text-slate-600")}>
                  {b === 0 ? "Any" : `${b}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Baths */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Bathrooms</p>
            <div className="flex flex-wrap gap-2">
              {BATHS.map(({ label, value }) => (
                <button key={value} onClick={() => setBathsMin(value)}
                  className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    bathsMin === value ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--border)] bg-white text-slate-600")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Home Type */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Home Type</p>
            <div className="flex flex-wrap gap-2">
              {HOME_TYPES.map(({ label }) => (
                <button key={label} onClick={() => toggleHomeType(label)}
                  className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    homeTypes.includes(label) ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--border)] bg-white text-slate-600")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Denomination — synagogue only */}
          {isSynagogue && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Synagogue Denomination</p>
              <Select value={denomination} onValueChange={(v) => setDenomination(v as Denomination)}>
                <SelectTrigger className="h-11 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DENOMINATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Sort By</p>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as FilterState["sortBy"])}>
              <SelectTrigger className="h-11 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proximity">Sort: Proximity</SelectItem>
                <SelectItem value="price_asc">Sort: Price ↑</SelectItem>
                <SelectItem value="price_desc">Sort: Price ↓</SelectItem>
                <SelectItem value="newest">Sort: Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white px-4 py-4">
          <Button variant="outline" className="flex-1" onClick={() => { reset(); onClose(); }}>
            Clear All
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Show Results
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main FilterBar ────────────────────────────────────────────────────────────
export function FilterBar({ resultCount }: { resultCount: number }) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const {
    listingType, setListingType,
    worshipType, setWorshipType,
    maxDistanceMi, setMaxDistance,
    bedsMin, setBedsMin,
    bathsMin, setBathsMin,
    denomination, setDenomination,
    sortBy, setSortBy,
    reset,
    priceMin, priceMax,
    homeTypes,
  } = useFilterStore();

  const isSynagogue = worshipType === "SYNAGOGUE";

  const activeFilterCount = [
    listingType !== "ALL",
    maxDistanceMi !== null,
    bedsMin > 0,
    bathsMin > 0,
    denomination !== "ALL",
    priceMin > 0 || priceMax < DEFAULT_MAX,
    homeTypes.length < ALL_HOME_TYPES.length,
  ].filter(Boolean).length;

  return (
    <>
      <MobileFilterSheet open={mobileSheetOpen} onClose={() => setMobileSheetOpen(false)} />

      <div className="sticky top-16 z-40 border-b border-[var(--border)] bg-white shadow-sm">

        {/* ── Worship type bar ── */}
        <div className="flex items-center justify-center gap-1 border-b border-[var(--border)] bg-slate-50 px-4 py-2">
          <span className="mr-2 text-xs font-medium text-slate-500">Find homes near:</span>
          {WORSHIP_TYPES.map((w) => (
            <button
              key={w.value}
              onClick={() => setWorshipType(w.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                worshipType === w.value
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-[var(--border)] hover:bg-slate-100"
              )}
            >
              <span>{w.emoji}</span> {w.label}
            </button>
          ))}
        </div>

        {/* ── Mobile bar ── */}
        <div className="flex items-center gap-2 px-4 py-2 md:hidden">
          {/* Sale/Rent quick toggle */}
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {LISTING_TYPES.map((t) => (
              <button key={t.value} onClick={() => setListingType(t.value)}
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  listingType === t.value ? "bg-blue-600 text-white" : "bg-white text-slate-600")}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setMobileSheetOpen(true)}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              activeFilterCount > 0
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-[var(--border)] bg-white text-slate-600"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as FilterState["sortBy"])}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proximity" className="text-xs">Proximity</SelectItem>
              <SelectItem value="price_asc" className="text-xs">Price ↑</SelectItem>
              <SelectItem value="price_desc" className="text-xs">Price ↓</SelectItem>
              <SelectItem value="newest" className="text-xs">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Desktop bar ── */}
        <div className="hidden md:flex flex-wrap items-center gap-2 px-4 py-3">
          <SlidersHorizontal className="h-4 w-4 text-slate-500 flex-shrink-0" />

          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {LISTING_TYPES.map((t) => (
              <button key={t.value} onClick={() => setListingType(t.value)}
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  listingType === t.value ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {DISTANCE_OPTIONS.map((d) => (
              <button key={String(d.value)} onClick={() => setMaxDistance(d.value)}
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  maxDistanceMi === d.value ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                {d.label}
              </button>
            ))}
          </div>

          <PriceFilter />
          <HomeTypeFilter />

          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] overflow-hidden">
            <span className="pl-2.5 text-xs text-slate-500">Beds:</span>
            {BEDS.map((b) => (
              <button key={b} onClick={() => setBedsMin(b)}
                className={cn("px-2.5 py-1.5 text-xs font-medium transition-colors",
                  bedsMin === b ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                {b === 0 ? "Any" : `${b}+`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] overflow-hidden">
            <span className="pl-2.5 text-xs text-slate-500">Baths:</span>
            {BATHS.map(({ label, value }) => (
              <button key={value} onClick={() => setBathsMin(value)}
                className={cn("px-2.5 py-1.5 text-xs font-medium transition-colors",
                  bathsMin === value ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                {label}
              </button>
            ))}
          </div>

          {isSynagogue && (
            <Select value={denomination} onValueChange={(v) => setDenomination(v as Denomination)}>
              <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DENOMINATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as FilterState["sortBy"])}>
            <SelectTrigger className="h-8 w-40 text-xs ml-auto"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proximity" className="text-xs">Sort: Proximity</SelectItem>
              <SelectItem value="price_asc" className="text-xs">Sort: Price ↑</SelectItem>
              <SelectItem value="price_desc" className="text-xs">Sort: Price ↓</SelectItem>
              <SelectItem value="newest" className="text-xs">Sort: Newest</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-8 px-2 text-xs text-slate-500">
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-1.5 text-xs text-slate-500">
          {resultCount} listing{resultCount !== 1 ? "s" : ""} found
        </div>
      </div>
    </>
  );
}
