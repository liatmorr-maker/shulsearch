"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin, Navigation, Home, Bed, Bath, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DENOMINATION_LABELS, DENOMINATION_COLORS, formatPrice, cn } from "@/lib/utils";
import type { MockSynagogue } from "@/lib/mock-data";

const ShulSearchMap = dynamic(
  () => import("@/components/map/shul-search-map").then((m) => m.ShulSearchMap),
  { ssr: false }
);

interface SynagogueWithDist extends MockSynagogue {
  distanceMi: number;
  walkMinutes: number;
}

interface NearbyProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  listingType: "SALE" | "RENT";
  imageUrls: string[];
  distanceMi: number;
  nearestShul: { name: string; distanceMi: number; walkMinutes: number } | null;
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(mi: number) {
  if (mi < 0.1) return `${Math.round(mi * 5280)} ft`;
  return `${mi.toFixed(2)} mi`;
}

// ─── Shared listing card ───────────────────────────────────────────────────────

function ListingCard({ p }: { p: NearbyProperty }) {
  return (
    <Link
      href={`/property/${p.id}`}
      className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {p.imageUrls[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.imageUrls[0]} alt="" className="h-20 w-24 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-20 w-24 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
          <Home className="h-6 w-6 text-slate-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-900 text-sm">{formatPrice(p.price, p.listingType)}</div>
        <div className="text-xs text-slate-500 truncate mt-0.5">{p.address}, {p.city}</div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.beds} bd</span>
          <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.baths} ba</span>
          {p.sqft && <span>{p.sqft.toLocaleString()} sqft</span>}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold text-white",
            p.listingType === "SALE" ? "bg-orange-500" : "bg-emerald-500")}>
            {p.listingType === "SALE" ? "For Sale" : "For Rent"}
          </span>
          <span className="text-xs text-slate-400">{formatDist(p.distanceMi)} from shul</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props { synagogues: MockSynagogue[]; }

export function NearClient({ synagogues }: Props) {
  const [mode, setMode] = useState<"address" | "shul">("address");

  // ── Address mode state ─────────────────────────────────────────────────────
  const [address, setAddress]         = useState("");
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrSearched, setAddrSearched] = useState(false);
  const [coords, setCoords]           = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [shulResults, setShulResults] = useState<SynagogueWithDist[]>([]);
  const [addrProps, setAddrProps]     = useState<NearbyProperty[]>([]);
  const [addrTab, setAddrTab]         = useState<"shuls" | "listings">("shuls");
  const suggestRef                    = useRef<HTMLDivElement>(null);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Shul mode state ────────────────────────────────────────────────────────
  const [shulQuery, setShulQuery]         = useState("");
  const [selectedShul, setSelectedShul]   = useState<MockSynagogue | null>(null);
  const [shulProps, setShulProps]         = useState<NearbyProperty[]>([]);
  const [shulLoading, setShulLoading]     = useState(false);
  const [shulSearched, setShulSearched]   = useState(false);
  const [shulListType, setShulListType]   = useState<"ALL" | "SALE" | "RENT">("ALL");
  const shulInputRef                      = useRef<HTMLDivElement>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  // ── Address autocomplete ───────────────────────────────────────────────────
  useEffect(() => {
    if (address.length < 4) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(address);
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${MAPBOX_TOKEN}&country=US&proximity=-80.13,25.96&types=address,place,neighborhood&limit=5`
        );
        const json = await res.json();
        setSuggestions((json.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
          place_name: f.place_name,
          center: f.center,
        })));
      } catch { /* ignore */ }
    }, 300);
  }, [address, MAPBOX_TOKEN]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) setSuggestions([]);
      if (shulInputRef.current && !shulInputRef.current.contains(e.target as Node)) {
        // only close dropdown — keep selected shul visible
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Address search ─────────────────────────────────────────────────────────
  async function geocodeAndSearch(addr: string) {
    if (!addr.trim()) return;
    setAddrLoading(true);
    setSuggestions([]);
    try {
      const q = encodeURIComponent(addr);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${MAPBOX_TOKEN}&country=US&limit=1`
      );
      const json = await res.json();
      const feature = json.features?.[0];
      if (!feature) { setAddrLoading(false); return; }

      const [lng, lat] = feature.center as [number, number];
      const label = feature.place_name as string;

      const nearbyShuls: SynagogueWithDist[] = synagogues
        .map((s) => ({
          ...s,
          distanceMi: distanceMiles(lat, lng, s.lat, s.lng),
          walkMinutes: Math.round((distanceMiles(lat, lng, s.lat, s.lng) / 3) * 60),
        }))
        .sort((a, b) => a.distanceMi - b.distanceMi)
        .slice(0, 15);

      const propRes = await fetch(`/api/properties/nearby?lat=${lat}&lng=${lng}&radius=2`);
      const propJson = await propRes.json();

      setCoords({ lat, lng, label });
      setShulResults(nearbyShuls);
      setAddrProps(propJson.results ?? []);
      setAddrSearched(true);
      setAddrTab("shuls");
    } catch { /* ignore */ }
    setAddrLoading(false);
  }

  function selectSuggestion(s: { place_name: string; center: [number, number] }) {
    setAddress(s.place_name);
    setSuggestions([]);
    geocodeAndSearch(s.place_name);
  }

  // ── Shul reverse search ────────────────────────────────────────────────────
  const filteredShuls = shulQuery.trim().length === 0
    ? []
    : (() => {
        // Split query into words so "Aventura Chabad" matches "Chabad of Aventura"
        const words = shulQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        return synagogues
          .filter((s) => {
            const haystack = [
              s.name,
              s.city,
              s.address,
              DENOMINATION_LABELS[s.denomination] ?? "",
            ].join(" ").toLowerCase();
            // Every word must appear somewhere in the combined text
            return words.every((w) => haystack.includes(w));
          })
          .slice(0, 8);
      })();

  async function selectShul(shul: MockSynagogue) {
    setSelectedShul(shul);
    setShulQuery(shul.name);
    setShulLoading(true);
    setShulSearched(false);
    try {
      const res = await fetch(`/api/properties/nearby?lat=${shul.lat}&lng=${shul.lng}&radius=1.5`);
      const json = await res.json();
      setShulProps(json.results ?? []);
      setShulSearched(true);
    } catch { /* ignore */ }
    setShulLoading(false);
  }

  function clearShulSearch() {
    setShulQuery("");
    setSelectedShul(null);
    setShulProps([]);
    setShulSearched(false);
  }

  // Filtered listings for shul mode (sale/rent toggle)
  const filteredShulProps = shulListType === "ALL"
    ? shulProps
    : shulProps.filter((p) => p.listingType === shulListType);

  // ── Map pins ───────────────────────────────────────────────────────────────
  const addrPin = coords
    ? [{ id: "__pin__", title: "Searched Address", address: coords.label,
         city: "", state: "", zip: "", lat: coords.lat, lng: coords.lng,
         listingType: "SALE" as const, status: "ACTIVE" as const,
         price: 0, beds: 0, baths: 0, imageUrls: [], amenities: [],
         isApproved: true, isFeatured: false, synagogueCount1mi: 0, synagogueDistances: [] }]
    : [];

  // For shul mode map — show the shul marker + nearby listing pins
  const shulMapSynagogues = selectedShul ? [selectedShul] : [];

  // Shape NearbyProperty into the minimal MockProperty the map needs
  const shulMapProps = shulProps.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    lat: p.lat,
    lng: p.lng,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    imageUrls: p.imageUrls,
    listingType: p.listingType,
    status: "ACTIVE" as const,
    amenities: [],
    isApproved: true,
    isFeatured: false,
    synagogueCount1mi: 0,
    synagogueDistances: [],
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Find What&apos;s Near You</h1>
        <p className="text-slate-500">Search by address or by synagogue name</p>
      </div>

      {/* Mode toggle */}
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="flex rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <button
            onClick={() => setMode("address")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors",
              mode === "address" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <MapPin className="h-4 w-4" />
            Search by Address
          </button>
          <button
            onClick={() => setMode("shul")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors",
              mode === "shul" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <span className="text-base leading-none">✡</span>
            Search by Shul Name
          </button>
        </div>
      </div>

      {/* ── ADDRESS MODE ─────────────────────────────────────────────────────── */}
      {mode === "address" && (
        <>
          <div className="mx-auto mb-8 max-w-2xl" ref={suggestRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-12 w-full rounded-xl border border-[var(--border)] pl-10 pr-4 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 2538 Sherman St, Hollywood, FL 33020"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && geocodeAndSearch(address)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-14 left-0 z-50 w-full rounded-xl border border-[var(--border)] bg-white shadow-lg overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => selectSuggestion(s)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <Navigation className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        {s.place_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="lg" className="h-12 px-6 rounded-xl" onClick={() => geocodeAndSearch(address)} disabled={addrLoading}>
                <Search className="mr-2 h-4 w-4" />
                {addrLoading ? "Searching…" : "Search"}
              </Button>
            </div>
          </div>

          {addrSearched && coords && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex rounded-xl border border-[var(--border)] overflow-hidden">
                  <button onClick={() => setAddrTab("shuls")}
                    className={cn("flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                      addrTab === "shuls" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                    ✡ Synagogues ({shulResults.length})
                  </button>
                  <button onClick={() => setAddrTab("listings")}
                    className={cn("flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                      addrTab === "listings" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                    <Home className="h-3.5 w-3.5" />
                    Listings ({addrProps.length})
                  </button>
                </div>

                <h2 className="mb-3 text-sm font-semibold text-slate-500">
                  Near <span className="text-blue-600 font-bold">{coords.label.split(",")[0]}</span>
                </h2>

                {addrTab === "shuls" && (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {shulResults.map((shul, i) => (
                      <div key={shul.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            i === 0 ? "bg-blue-600 text-white" : i === 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{shul.name}</div>
                            <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-0.5", DENOMINATION_COLORS[shul.denomination])}>
                              {DENOMINATION_LABELS[shul.denomination]}
                            </span>
                            <div className="text-xs text-slate-400 mt-0.5">{shul.address}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-slate-800 text-sm">{formatDist(shul.distanceMi)}</div>
                          <div className="text-xs text-slate-500">{shul.walkMinutes} min walk</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {addrTab === "listings" && (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {addrProps.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                        <Home className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No listings found within 2 miles</p>
                        <p className="text-xs mt-1">Run a sync from the admin panel to import listings for this area</p>
                        <Link href="/admin" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
                          Go to Admin → Sync Listings
                        </Link>
                      </div>
                    ) : (
                      addrProps.map((p) => <ListingCard key={p.id} p={p} />)
                    )}
                  </div>
                )}
              </div>

              <div className="h-[600px] overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
                <ShulSearchMap
                  properties={addrPin as never}
                  synagogues={shulResults.slice(0, 10)}
                  center={[coords.lng, coords.lat]}
                  zoom={14}
                />
              </div>
            </div>
          )}

          {!addrSearched && (
            <div className="mt-12 text-center text-slate-400">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">✡</div>
              <p className="text-sm">Enter an address above to find nearby synagogues and listings</p>
            </div>
          )}
        </>
      )}

      {/* ── SHUL MODE ────────────────────────────────────────────────────────── */}
      {mode === "shul" && (
        <>
          <div className="mx-auto mb-8 max-w-2xl" ref={shulInputRef}>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-xl border border-[var(--border)] pl-10 pr-10 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a synagogue name, city, or denomination…"
                value={shulQuery}
                onChange={(e) => {
                  setShulQuery(e.target.value);
                  if (selectedShul && e.target.value !== selectedShul.name) {
                    setSelectedShul(null);
                    setShulProps([]);
                    setShulSearched(false);
                  }
                }}
              />
              {shulQuery && (
                <button onClick={clearShulSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Dropdown */}
              {filteredShuls.length > 0 && !selectedShul && (
                <div className="absolute top-14 left-0 z-50 w-full rounded-xl border border-[var(--border)] bg-white shadow-lg overflow-hidden">
                  {filteredShuls.map((shul) => (
                    <button
                      key={shul.id}
                      onClick={() => selectShul(shul)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-base">
                        ✡
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{shul.name}</div>
                        <div className="text-xs text-slate-400">{shul.address}, {shul.city}</div>
                      </div>
                      <span className={cn("flex-shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium", DENOMINATION_COLORS[shul.denomination])}>
                        {DENOMINATION_LABELS[shul.denomination]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {shulQuery.length >= 2 && filteredShuls.length === 0 && !selectedShul && (
                <div className="absolute top-14 left-0 z-50 w-full rounded-xl border border-[var(--border)] bg-white shadow-lg px-4 py-4 text-sm text-slate-400">
                  No synagogues found matching &ldquo;{shulQuery}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Selected shul info banner */}
          {selectedShul && (
            <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-lg">✡</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">{selectedShul.name}</div>
                <div className="text-xs text-slate-500">{selectedShul.address}, {selectedShul.city} · {DENOMINATION_LABELS[selectedShul.denomination]}</div>
              </div>
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", DENOMINATION_COLORS[selectedShul.denomination])}>
                {DENOMINATION_LABELS[selectedShul.denomination]}
              </span>
            </div>
          )}

          {/* Results */}
          {shulSearched && selectedShul && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left panel */}
              <div>
                {/* Header + filter */}
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-sm font-semibold text-slate-500">
                    Listings within 1.5 mi of{" "}
                    <span className="text-blue-600 font-bold">{selectedShul.name}</span>
                  </h2>
                  {/* Sale / Rent toggle */}
                  <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
                    {(["ALL", "SALE", "RENT"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setShulListType(t)}
                        className={cn(
                          "px-3 py-1.5 font-medium transition-colors",
                          shulListType === t ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {t === "ALL" ? "All" : t === "SALE" ? "For Sale" : "For Rent"}
                      </button>
                    ))}
                  </div>
                </div>

                {shulLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map((n) => (
                      <div key={n} className="h-28 rounded-xl border border-[var(--border)] bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : filteredShulProps.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                    <Home className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {shulProps.length === 0
                        ? "No listings found within 1.5 miles of this shul"
                        : `No ${shulListType.toLowerCase()} listings in this range`}
                    </p>
                    {shulProps.length === 0 && (
                      <p className="text-xs mt-1 max-w-xs mx-auto">
                        Try running a sync from the admin panel to import listings for this area
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    <p className="text-xs text-slate-400 mb-2">
                      {filteredShulProps.length} listing{filteredShulProps.length !== 1 ? "s" : ""} found — sorted by distance
                    </p>
                    {filteredShulProps.map((p) => <ListingCard key={p.id} p={p} />)}
                  </div>
                )}
              </div>

              {/* Map — centered on the shul */}
              <div className="h-[600px] overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
                <ShulSearchMap
                  properties={shulMapProps as never}
                  synagogues={shulMapSynagogues}
                  center={[selectedShul.lng, selectedShul.lat]}
                  zoom={15}
                />
              </div>
            </div>
          )}

          {!shulSearched && !shulLoading && (
            <div className="mt-12 text-center text-slate-400">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">✡</div>
              <p className="text-sm">Type a synagogue name above to see nearby available listings</p>
              <p className="text-xs mt-1 text-slate-300">
                {synagogues.length} synagogues in our database
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
