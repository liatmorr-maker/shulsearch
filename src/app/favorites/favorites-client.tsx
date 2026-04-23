"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import type { MockProperty } from "@/lib/mock-data";

export function FavoritesClient() {
  const [properties, setProperties] = useState<MockProperty[]>([]);
  const [savedIds, setSavedIds]     = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [idsRes, propsRes] = await Promise.all([
          fetch("/api/saved"),
          fetch("/api/favorites/properties"),
        ]);
        const { ids }     = await idsRes.json();
        const { results } = await propsRes.json();
        setSavedIds(ids ?? []);
        setProperties(results ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  function removeProperty(id: string) {
    setSavedIds((prev) => prev.filter((x) => x !== id));
    setProperties((prev) => prev.filter((p) => p.id !== id));
    fetch("/api/saved", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ propertyId: id }),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Listings</h1>
          <p className="text-sm text-slate-500">
            {properties.length} saved propert{properties.length !== 1 ? "ies" : "y"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties" className="gap-2">
            🏠 Saved Properties
            {properties.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {properties.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <div className="mb-4 text-5xl">🏠</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">No saved listings yet</h3>
              <p className="mb-6 max-w-xs text-sm text-slate-500">
                Browse listings and tap the ♥ heart icon to save properties here.
              </p>
              <Link href="/results?city=Aventura">
                <Button variant="outline">Browse Listings</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <div key={p.id} className="relative">
                  <PropertyCard
                    property={p}
                    initialSaved={savedIds.includes(p.id)}
                  />
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600 transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
