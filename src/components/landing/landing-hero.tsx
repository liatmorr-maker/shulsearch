"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WorshipType } from "@/store/filter-store";

const QUICK_CHIPS = [
  "Aventura", "Boca Raton", "Sunny Isles Beach",
  "Hollywood", "Surfside", "Bal Harbour", "Davie", "Cooper City",
];

const TABS: {
  type: WorshipType;
  emoji: string;
  label: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  pattern: string;
  stats: { value: string; label: string }[];
}[] = [
  {
    type: "SYNAGOGUE",
    emoji: "🕍",
    label: "ShulSearch",
    title: "Find Your Home Near Your Shul",
    subtitle: "Search homes ranked by proximity to your place of worship, with filters for distance, denomination, and community.",
    gradient: "from-blue-900 via-blue-800 to-indigo-900",
    accent: "text-blue-300",
    pattern: "✡",
    stats: [
      { value: "4,000+", label: "Listings" },
      { value: "80+", label: "Synagogues Mapped" },
      { value: "3", label: "South FL Counties" },
    ],
  },
  {
    type: "CHURCH",
    emoji: "✝️",
    label: "Church Finder",
    title: "Find Your Home Near Your Church",
    subtitle: "Search homes ranked by proximity to places of worship across South Florida, with filters for distance and denomination.",
    gradient: "from-purple-900 via-purple-800 to-violet-900",
    accent: "text-purple-300",
    pattern: "✝",
    stats: [
      { value: "4,000+", label: "Listings" },
      { value: "650+", label: "Churches Mapped" },
      { value: "3", label: "South FL Counties" },
    ],
  },
  {
    type: "MOSQUE",
    emoji: "🕌",
    label: "Mosque Nearby",
    title: "Find Your Home Near Your Mosque",
    subtitle: "Search homes ranked by proximity to places of worship across South Florida, with smart distance filters.",
    gradient: "from-emerald-900 via-emerald-800 to-teal-900",
    accent: "text-emerald-300",
    pattern: "☪",
    stats: [
      { value: "4,000+", label: "Listings" },
      { value: "20+", label: "Mosques Mapped" },
      { value: "3", label: "South FL Counties" },
    ],
  },
  {
    type: "TEMPLE",
    emoji: "🛕",
    label: "Temple Search",
    title: "Find Your Home Near Your Temple",
    subtitle: "Search homes ranked by proximity to places of worship across South Florida.",
    gradient: "from-amber-900 via-orange-800 to-orange-900",
    accent: "text-amber-300",
    pattern: "🪷",
    stats: [
      { value: "4,000+", label: "Listings" },
      { value: "30+", label: "Temples Mapped" },
      { value: "3", label: "South FL Counties" },
    ],
  },
];

export function LandingHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<WorshipType>("SYNAGOGUE");

  const tab = TABS.find((t) => t.type === activeTab)!;

  function handleSearch(q?: string) {
    const search = q ?? query;
    if (!search.trim()) return;
    router.push(`/results?q=${encodeURIComponent(search.trim())}&worshipType=${activeTab}`);
  }

  return (
    <section className={cn("relative overflow-hidden bg-gradient-to-br text-white transition-all duration-500", tab.gradient)}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 select-none pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><text x="30" y="40" font-size="24" text-anchor="middle" fill="white" font-family="serif">${tab.pattern}</text></svg>`)}")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

        {/* ── 4 branded tabs ── */}
        <div className="mb-10 flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.type}
              onClick={() => setActiveTab(t.type)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border",
                activeTab === t.type
                  ? "bg-white text-slate-900 border-white shadow-lg"
                  : "bg-white/10 text-white border-white/25 hover:bg-white/20"
              )}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
          <MapPin className={cn("h-3.5 w-3.5", tab.accent)} />
          South Florida&apos;s Home Search Built Around Community
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
          {tab.title.split("Near")[0]}
          Near{" "}
          <span className={tab.accent}>{tab.title.split("Near ")[1]}</span>
        </h1>

        <p className={cn("mb-10 max-w-2xl text-lg sm:text-xl", tab.accent.replace("text-", "text-").replace("-300", "-100"))}>
          {tab.subtitle}
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
            className="h-14 px-8 text-base rounded-xl shadow-lg bg-white/20 hover:bg-white/30 text-white font-semibold border border-white/30"
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2">
          <span className={cn("text-sm self-center mr-1", tab.accent)}>Popular:</span>
          {QUICK_CHIPS.map((city) => (
            <button
              key={city}
              onClick={() => handleSearch(city)}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 flex gap-8 sm:gap-12">
          {tab.stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              <div className={cn("text-sm", tab.accent)}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
