"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_CHIPS = [
  { label: "Aventura", value: "Aventura" },
  { label: "Boca Raton", value: "Boca Raton" },
  { label: "Sunny Isles Beach", value: "Sunny Isles Beach" },
  { label: "Hollywood", value: "Hollywood" },
  { label: "Surfside", value: "Surfside" },
  { label: "Bal Harbour", value: "Bal Harbour" },
  { label: "Davie", value: "Davie" },
  { label: "Cooper City", value: "Cooper City" },
];

const STATS = [
  { value: "4,000+", label: "Listings" },
  { value: "80+", label: "Synagogues Mapped" },
  { value: "3", label: "South FL Counties" },
];

export function LandingHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(q?: string) {
    const search = q ?? query;
    if (!search.trim()) return;
    router.push(`/results?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Background pattern — small Stars of David */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><text x="30" y="40" font-size="24" text-anchor="middle" fill="white" font-family="serif">✡</text></svg>')}")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Star of David watermark */}
      <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/4 opacity-5 text-[600px] leading-none select-none pointer-events-none">
        ✡
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
          <MapPin className="h-3.5 w-3.5 text-blue-300" />
          South Florida&apos;s #1 Jewish Real Estate Search
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
          Find Your Home{" "}
          <span className="text-blue-300">Near the Shul</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
          Search homes for sale and rent ranked by proximity to synagogues.
          Filter by denomination, distance, and more.
        </p>

        {/* Search box */}
        <div className="mb-6 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-14 pl-11 pr-4 text-base text-slate-900 rounded-xl shadow-lg border-0"
              placeholder="City, zip code, or neighborhood…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            size="lg"
            className="h-14 px-8 text-base rounded-xl shadow-lg bg-blue-400 hover:bg-blue-300 text-blue-900 font-semibold"
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        </div>

        {/* Quick-select chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-blue-300 self-center mr-1">Popular:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => handleSearch(chip.value)}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 flex gap-8 sm:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              <div className="text-sm text-blue-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
