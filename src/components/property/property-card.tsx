"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Square, MapPin, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDistance, DENOMINATION_LABELS, cn } from "@/lib/utils";
import type { MockProperty } from "@/lib/mock-data";
import { useState } from "react";

interface PropertyCardProps {
  property: MockProperty;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export function PropertyCard({ property, isHighlighted, onHover }: PropertyCardProps) {
  const [saved, setSaved] = useState(false);
  const nearestShul = property.synagogueDistances?.[0];

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
      {/* Image */}
      <Link href={`/property/${property.id}`} className="block relative h-48 overflow-hidden">
        {property.imageUrls[0] ? (
          <Image
            src={property.imageUrls[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={property.listingType === "SALE" ? "default" : "success"}>
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </Badge>
          {property.isFeatured && (
            <Badge className="bg-amber-500 text-white">
              <Star className="mr-1 h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved((v) => !v); }}
          className={cn(
            "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors shadow-sm",
            saved ? "bg-rose-500 text-white" : "bg-white/90 text-slate-500 hover:bg-white hover:text-rose-500"
          )}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </Link>

      {/* Content */}
      <Link href={`/property/${property.id}`} className="block p-4">
        {/* Price */}
        <div className="mb-1 text-xl font-bold text-slate-900">
          {formatPrice(property.price, property.listingType)}
        </div>

        {/* Title */}
        <h3 className="mb-1 text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {property.title}
        </h3>

        {/* Address */}
        <p className="mb-3 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {property.address}, {property.city}
        </p>

        {/* Stats row */}
        <div className="mb-3 flex gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.beds} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.baths} ba
          </span>
          {property.sqft && (
            <span className="flex items-center gap-1">
              <Square className="h-3.5 w-3.5" /> {property.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Nearest shul */}
        {nearestShul && (
          <Link
            href={`/synagogue/${nearestShul.synagogueId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs hover:bg-blue-100 transition-colors"
          >
            <span className="text-base">✡</span>
            <div className="min-w-0">
              <div className="font-medium text-blue-900 truncate">{nearestShul.synagogue.name}</div>
              <div className="text-blue-600">
                {formatDistance(nearestShul.distanceMi)} · {nearestShul.walkMinutes} min walk
                {nearestShul.synagogue.denomination !== "OTHER" && (
                  <> · {DENOMINATION_LABELS[nearestShul.synagogue.denomination]}</>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Shul count */}
        {property.synagogueCount1mi > 1 && (
          <p className="mt-2 text-xs text-slate-500">
            +{property.synagogueCount1mi - 1} more shul{property.synagogueCount1mi > 2 ? "s" : ""} within 1 mi
          </p>
        )}
      </Link>
    </div>
  );
}
