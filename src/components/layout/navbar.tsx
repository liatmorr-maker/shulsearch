"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MapPin, Menu, Search, X, LogOut, LayoutGrid, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Search dropdown ───────────────────────────────────────────────────────────
function SearchDropdown({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"address" | "place">("address");
  const [addressVal, setAddressVal] = useState("");
  const [placeVal, setPlaceVal] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ place_name: string; text: string; center?: [number,number]; context?: {id:string;text:string}[]; place_type?: string[] }[]>([]);
  const [placeSuggestions, setPlaceSuggestions] = useState<{ id: string; name: string; city: string; worshipType: string }[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Address autocomplete: Mapbox geocoding + nearby places of worship
  useEffect(() => {
    if (addressVal.trim().length < 2) { setAddressSuggestions([]); setPlaceSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoadingAddress(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const [geoRes, placesRes] = await Promise.all([
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressVal.trim())}.json?access_token=${token}&country=US&proximity=-80.2,26.1&bbox=-81.0,25.0,-79.8,27.0&types=place,postcode,neighborhood,address&limit=4`),
          fetch(`/api/search/places?q=${encodeURIComponent(addressVal.trim())}`),
        ]);
        if (geoRes.ok) { const d = await geoRes.json(); setAddressSuggestions(d.features ?? []); }
        if (placesRes.ok) setPlaceSuggestions(await placesRes.json());
      } finally {
        setLoadingAddress(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [addressVal]);

  // Place name autocomplete
  useEffect(() => {
    if (tab !== "place" || placeVal.trim().length < 2) { setPlaceSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoadingPlace(true);
      try {
        const res = await fetch(`/api/search/places?q=${encodeURIComponent(placeVal.trim())}`);
        if (res.ok) setPlaceSuggestions(await res.json());
      } finally {
        setLoadingPlace(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [placeVal, tab]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMapboxSelect(feature: any) {
    // Extract the city from context, or use text if it's already a place/postcode
    const placeType = feature.place_type?.[0] ?? "";
    let city = feature.text as string;

    if (placeType === "address" || placeType === "neighborhood") {
      // Look for city (place) or postcode in context
      const placeCtx = (feature.context ?? []).find((c: {id:string;text:string}) => c.id.startsWith("place."));
      const zipCtx   = (feature.context ?? []).find((c: {id:string;text:string}) => c.id.startsWith("postcode."));
      city = placeCtx?.text ?? zipCtx?.text ?? city;
    }

    const params = new URLSearchParams({ q: city });
    if (feature.center) {
      params.set("lng", String(feature.center[0]));
      params.set("lat", String(feature.center[1]));
    }
    router.push(`/results?${params.toString()}`);
    onClose();
  }

  function handleAddressSearch() {
    if (!addressVal.trim()) return;
    router.push(`/results?q=${encodeURIComponent(addressVal.trim())}`);
    onClose();
  }

  const WORSHIP_ICON: Record<string, string> = { SYNAGOGUE: "✡", CHURCH: "✝", MOSQUE: "☪", TEMPLE: "🛕" };

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] rounded-2xl border border-[var(--border)] bg-white shadow-2xl z-50 overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setTab("address")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors",
            tab === "address" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <MapPin className="h-4 w-4" /> Search by Address
        </button>
        <button
          onClick={() => setTab("place")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors",
            tab === "place" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <Building2 className="h-4 w-4" /> Search by Place
        </button>
      </div>

      {/* Address tab */}
      {tab === "address" && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={addressVal}
              onChange={(e) => setAddressVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
              placeholder="City, zip code, or neighborhood…"
              className="h-10 w-full rounded-xl border border-[var(--border)] pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {loadingAddress && <p className="mt-2 text-center text-xs text-slate-400">Searching…</p>}

          {/* Unified results: locations + places of worship */}
          {(addressSuggestions.length > 0 || placeSuggestions.length > 0) && (
            <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-[var(--border)] overflow-hidden max-h-72 overflow-y-auto">
              {addressSuggestions.map((s) => (
                <li key={s.place_name}>
                  <button
                    onClick={() => handleMapboxSelect(s)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{s.text}</div>
                      <div className="text-xs text-slate-400 truncate">{s.place_name}</div>
                    </div>
                  </button>
                </li>
              ))}
              {placeSuggestions.length > 0 && (
                <>
                  <li className="bg-slate-50 px-3 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Places of Worship</span>
                  </li>
                  {placeSuggestions.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/synagogue/${s.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-base w-5 text-center">{WORSHIP_ICON[s.worshipType] ?? "🏛"}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.city}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}

          {/* Quick chips — shown when input is empty */}
          {addressVal.trim().length < 2 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Aventura", "Boca Raton", "Hollywood", "Surfside"].map((city) => (
                <button
                  key={city}
                  onClick={() => { router.push(`/results?q=${encodeURIComponent(city)}`); onClose(); }}
                  className="rounded-full border border-[var(--border)] bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Place tab */}
      {tab === "place" && (
        <div className="p-4">
          <p className="mb-3 text-xs text-slate-500">Search by the name of a synagogue, church, mosque, or temple.</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={placeVal}
              onChange={(e) => setPlaceVal(e.target.value)}
              placeholder="e.g. Chabad of Aventura, St. Patrick's…"
              className="h-10 w-full rounded-xl border border-[var(--border)] pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Suggestions */}
          {loadingPlace && (
            <p className="mt-3 text-center text-xs text-slate-400">Searching…</p>
          )}
          {placeSuggestions.length > 0 && (
            <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-[var(--border)] overflow-hidden">
              {placeSuggestions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/synagogue/${s.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-base">{WORSHIP_ICON[s.worshipType] ?? "🏛"}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.city}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!loadingPlace && placeVal.trim().length >= 2 && placeSuggestions.length === 0 && (
            <p className="mt-3 text-center text-xs text-slate-400">No places found matching &ldquo;{placeVal}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isSignedIn, user }        = useUser();
  const { signOut }                 = useClerk();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "liatmorr@gmail.com";

  // Mobile search state (simpler — just one address input)
  const [mobileSearchVal, setMobileSearchVal] = useState("");
  function handleMobileSearch() {
    if (!mobileSearchVal.trim()) return;
    router.push(`/results?q=${encodeURIComponent(mobileSearchVal.trim())}`);
    setSearchOpen(false);
    setMobileSearchVal("");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-slate-900">Shul</span><span className="text-[#0ea5e9]">Search</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 relative">
            <NavLink href="/results" active={pathname === "/results"}>
              <MapPin className="h-3.5 w-3.5" /> Browse
            </NavLink>

            {/* Search button + dropdown */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  searchOpen ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-[var(--accent)] hover:text-slate-900"
                )}
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
              {searchOpen && <SearchDropdown onClose={() => setSearchOpen(false)} />}
            </div>

            <NavLink href="/favorites" active={pathname === "/favorites"}>
              <Heart className="h-3.5 w-3.5" /> Saved
            </NavLink>
            {isAdmin && (
              <NavLink href="/admin" active={pathname.startsWith("/admin")}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Auth — signed out */}
          {!isSignedIn && (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Auth — signed in (desktop) */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt={user.firstName ?? ""} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                    {user?.firstName?.[0] ?? "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">{user?.firstName ?? "Account"}</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 hover:text-red-600" onClick={() => signOut({ redirectUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          )}

          {/* Mobile: auth avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {isSignedIn && (
              user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  {user?.firstName?.[0] ?? "U"}
                </div>
              )
            )}
            <button className="p-2 rounded-lg hover:bg-[var(--accent)]" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile top tab row */}
        <nav className="md:hidden flex border-t border-[var(--border)]">
          <TopTab href="/results" icon={<LayoutGrid className="h-4 w-4" />} label="Browse" active={pathname === "/results"} />
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors border-b-2",
              searchOpen ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500"
            )}
          >
            <Search className="h-4 w-4" /> Search
          </button>
          <TopTab href="/favorites" icon={<Heart className="h-4 w-4" />} label="Saved" active={pathname === "/favorites"} />
        </nav>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-3 py-3 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  value={mobileSearchVal}
                  onChange={(e) => setMobileSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
                  placeholder="City, zip, or neighborhood…"
                  className="h-10 w-full rounded-xl border border-[var(--border)] pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <button onClick={handleMobileSearch} className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Go</button>
            </div>
            <Link
              href="/results"
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Building2 className="h-4 w-4 text-slate-400" /> Search by place of worship name →
            </Link>
          </div>
        )}

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-4 pb-4 pt-2">
            {isSignedIn && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-slate-100">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    {user?.firstName?.[0] ?? "U"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {isAdmin && <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin</MobileNavLink>}
              {!isSignedIn ? (
                <>
                  <MobileNavLink href="/sign-in" onClick={() => setMobileOpen(false)}>Sign In</MobileNavLink>
                  <MobileNavLink href="/sign-up" onClick={() => setMobileOpen(false)}>Get Started</MobileNavLink>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); signOut({ redirectUrl: "/" }); }}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function TopTab({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors border-b-2", active ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500")}>
      {icon}{label}
    </Link>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-blue-50 text-[var(--primary)]" : "text-slate-600 hover:bg-[var(--accent)] hover:text-slate-900")}>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--accent)]">
      {children}
    </Link>
  );
}

import React from "react";
