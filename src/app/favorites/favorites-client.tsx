"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Trash2, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property/property-card";
import { DENOMINATION_LABELS, DENOMINATION_COLORS, cn } from "@/lib/utils";
import { PROPERTIES, SYNAGOGUES } from "@/lib/mock-data";

// Seeded mock saved state — in production these come from the DB via Clerk user ID
const MOCK_SAVED_PROPERTY_IDS = ["prop_004", "prop_001", "prop_006"];
const MOCK_SAVED_SYNAGOGUE_IDS = ["syn_001", "syn_009", "syn_016", "syn_013"];

export function FavoritesClient() {
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(MOCK_SAVED_PROPERTY_IDS);
  const [savedSynagogueIds, setSavedSynagogueIds] = useState<string[]>(MOCK_SAVED_SYNAGOGUE_IDS);

  const savedProperties = PROPERTIES.filter((p) => savedPropertyIds.includes(p.id));
  const savedSynagogues = SYNAGOGUES.filter((s) => savedSynagogueIds.includes(s.id));

  function removeProp(id: string) {
    setSavedPropertyIds((prev) => prev.filter((x) => x !== id));
  }

  function removeSyn(id: string) {
    setSavedSynagogueIds((prev) => prev.filter((x) => x !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Favorites</h1>
          <p className="text-sm text-slate-500">
            {savedPropertyIds.length} propert{savedPropertyIds.length !== 1 ? "ies" : "y"} ·{" "}
            {savedSynagogueIds.length} synagogue{savedSynagogueIds.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties" className="gap-2">
            <span>🏠</span> Saved Properties
            {savedPropertyIds.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {savedPropertyIds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="synagogues" className="gap-2">
            <span>✡</span> Saved Synagogues
            {savedSynagogueIds.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {savedSynagogueIds.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Properties tab ──────────────────────────────── */}
        <TabsContent value="properties">
          {savedProperties.length === 0 ? (
            <EmptyState
              icon="🏠"
              title="No saved properties yet"
              desc="Browse listings and tap the heart icon to save properties here."
              cta="Browse Listings"
              href="/results"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedProperties.map((p) => (
                <div key={p.id} className="relative">
                  <PropertyCard property={p} />
                  <button
                    onClick={() => removeProp(p.id)}
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Synagogues tab ──────────────────────────────── */}
        <TabsContent value="synagogues">
          {savedSynagogues.length === 0 ? (
            <EmptyState
              icon="✡"
              title="No saved synagogues yet"
              desc="Find a synagogue on a property listing or results map and save it here."
              cta="Browse Listings"
              href="/results"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedSynagogues.map((syn) => (
                <SavedSynagogueCard
                  key={syn.id}
                  synagogue={syn}
                  onRemove={() => removeSyn(syn.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Saved synagogue card ────────────────────────────────────────────────────

function SavedSynagogueCard({
  synagogue,
  onRemove,
}: {
  synagogue: (typeof SYNAGOGUES)[0];
  onRemove: () => void;
}) {
  const denomLabel = DENOMINATION_LABELS[synagogue.denomination] ?? synagogue.denomination;
  const denomColor = DENOMINATION_COLORS[synagogue.denomination] ?? "bg-gray-100 text-gray-800";

  // Count of active listings within 1.5 mi (from mock data)
  const nearbyCount = PROPERTIES.filter(
    (p) =>
      p.isApproved &&
      p.status === "ACTIVE" &&
      p.synagogueDistances?.some(
        (sd) => sd.synagogueId === synagogue.id && sd.distanceMi <= 1.5
      )
  ).length;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow">
      {/* Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
        ✡
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/synagogue/${synagogue.id}`}
              className="block font-semibold text-slate-900 hover:text-[var(--primary)] truncate"
            >
              {synagogue.name}
            </Link>
            <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium", denomColor)}>
              {denomLabel}
            </span>
          </div>
          <button
            onClick={onRemove}
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Remove from saved"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {synagogue.address}, {synagogue.city}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {nearbyCount > 0
              ? `${nearbyCount} listing${nearbyCount !== 1 ? "s" : ""} nearby`
              : "No active listings"}
          </span>
          <Link
            href={`/synagogue/${synagogue.id}`}
            className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline font-medium"
          >
            View details <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  icon, title, desc, cta, href,
}: {
  icon: string; title: string; desc: string; cta: string; href: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-slate-500">{desc}</p>
      <Link href={href}>
        <Button variant="outline">{cta}</Button>
      </Link>
    </div>
  );
}
