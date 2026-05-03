"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Square, MapPin, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDistance, daysOnMarket, DENOMINATION_LABELS, cn } from "@/lib/utils";
import type { MockProperty } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

const WORSHIP_INFO: Record<string, { icon: string; bg: string; text: string; label: string }> = {
  SYNAGOGUE: { icon: "✡", bg: "bg-blue-50 hover:bg-blue-100",  text: "text-blue-900", label: "Synagogue" },
  CHURCH:    { icon: "✝", bg: "bg-purple-50 hover:bg-purple-100", text: "text-purple-900", label: "Church" },
  MOSQUE:    { icon: "☪", bg: "bg-emerald-50 hover:bg-emerald-100", text: "text-emerald-900", label: "Mosque" },
  TEMPLE:    { icon: "🛕", bg: "bg-amber-50 hover:bg-amber-100", text: "text-amber-900", label: "Temple" },
};

interface PropertyCardProps {
  property: MockProperty;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
  initialSaved?: boolean;
  worshipType?: string;
}

export function PropertyCard({ property, isHighlighted, onHover, initialSaved = false, worshipType = "SYNAGOGUE" }: PropertyCardProps) {
  const [saved, setSaved]     = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const { isSignedIn }        = useUser();
  const { openSignIn }        = useClerk();
  const nearestShul           = property.synagogueDistances?.[0];
  const worship               = WORSHIP_INFO[worshipType] ?? WORSHIP_INFO.SYNAGOGUE;

  // Distance to nearest place of the active worship type
  const nearestDist: number | undefined =
    worshipType === "SYNAGOGUE" ? nearestShul?.distanceMi :
    worshipType === "CHURCH"    ? property.nearestChurchDist :
    worshipType === "MOSQUE"    ? property.nearestMosqueDist :
    worshipType === "TEMPLE"    ? property.nearestTempleDist :
    undefined;

  const walkMins = nearestDist != null ? Math.round(nearestDist * 20) : null;
  const dom = daysOnMarket(property.listedAt);

  // Sync with server-side saved state when it loads
  useEffect(() => { setSaved(initialSaved); }, [initialSaved]);

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/saved", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      setSaved(data.saved);
    } catch { /* keep current state */ }
    setLoading(false);
  }

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border overflow-hidden transition-all duration-200",
        isHighlighted
          ? "border-blue-500 shadow-card-hover ring-2 ring-blue-200"
          : "border-[var(--border)] shadow-card hover:shadow-card-hover hover:border-slate-300"
      )}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Full-card overlay link */}
      <Link href={`/property/${property.id}`} className="absolute inset-0 z-0" aria-label={property.title} />

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {property.imageUrls[0] ? (
          <Image
            src={property.imageUrls[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
            quality={85}
          />
        ) : (
          <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
          <Badge variant={property.listingType === "SALE" ? "default" : "success"}>
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </Badge>
          {property.isFeatured && (
            <Badge className="bg-amber-500 text-white">
              <Star className="mr-1 h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
          {dom !== null && dom <= 3 && (
            <Badge className="bg-emerald-500 text-white">New</Badge>
          )}
        </div>

        {/* Days on market — bottom-left of image */}
        {dom !== null && dom > 3 && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {dom} days on market
          </div>
        )}

        {/* Save / heart button */}
        <button
          onClick={toggleSave}
          disabled={loading}
          className={cn(
            "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all shadow-sm",
            saved
              ? "bg-rose-500 text-white scale-110"
              : "bg-white/90 text-slate-500 hover:bg-white hover:text-rose-500",
            loading && "opacity-60"
          )}
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <Heart className={cn("h-4 w-4 transition-all", saved && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pointer-events-none">
        <div className="mb-1 text-xl font-bold text-slate-900">
          {formatPrice(property.price, property.listingType)}
        </div>

        <h3 className="mb-1 text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {property.title}
        </h3>

        <p className="mb-3 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {property.address}, {property.city}
        </p>

        <div className="mb-3 flex gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.beds} bd</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.baths} ba</span>
          {property.sqft && (
            <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {property.sqft.toLocaleString()} sqft</span>
          )}
        </div>

        {worshipType === "SYNAGOGUE" && nearestShul ? (
          <Link
            href={`/synagogue/${nearestShul.synagogueId}`}
            className={`pointer-events-auto flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${worship.bg}`}
          >
            <span className="text-base">{worship.icon}</span>
            <div className="min-w-0">
              <div className={`font-medium truncate ${worship.text}`}>{nearestShul.synagogue.name}</div>
              <div className="text-blue-600">
                {formatDistance(nearestShul.distanceMi)} · {nearestShul.walkMinutes} min walk
                {nearestShul.synagogue.denomination !== "OTHER" && (
                  <> · {DENOMINATION_LABELS[nearestShul.synagogue.denomination]}</>
                )}
              </div>
            </div>
          </Link>
        ) : worshipType !== "SYNAGOGUE" && nearestDist != null ? (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${worship.bg}`}>
            <span className="text-base">{worship.icon}</span>
            <div className="min-w-0">
              <div className={`font-medium ${worship.text}`}>Nearest {worship.label}</div>
              <div className="text-slate-500">
                {formatDistance(nearestDist)}{walkMins != null ? ` · ${walkMins} min walk` : ""}
              </div>
            </div>
          </div>
        ) : null}

        {worshipType === "SYNAGOGUE" && property.synagogueCount1mi > 1 && (
          <p className="mt-2 text-xs text-slate-500">
            +{property.synagogueCount1mi - 1} more shul{property.synagogueCount1mi > 2 ? "s" : ""} within 1 mi
          </p>
        )}
      </div>
    </div>
  );
}
