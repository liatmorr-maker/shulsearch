"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Bed, Bath, Square, MapPin, Calendar, Heart, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestInfoModal } from "@/components/property/request-info-modal";
import { UsageGateModal } from "@/components/usage-gate-modal";
import { useUsageGate } from "@/hooks/use-usage-gate";
import { useUser } from "@clerk/nextjs";
import { formatPrice, formatDistance, DENOMINATION_LABELS, DENOMINATION_COLORS, cn } from "@/lib/utils";
import type { MockProperty } from "@/lib/mock-data";

const ShulSearchMap = dynamic(
  () => import("@/components/map/shul-search-map").then((m) => m.ShulSearchMap),
  { ssr: false }
);

interface Props {
  property: MockProperty;
  nearbyShuls: NonNullable<MockProperty["synagogueDistances"]>;
}

export function PropertyDetailClient({ property, nearbyShuls }: Props) {
  const { isSignedIn } = useUser();
  const { showGate, recordView, dismissGate } = useUsageGate(!!isSignedIn);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [photos, setPhotos] = useState<string[]>(property.imageUrls);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Count this property view toward the usage gate
  useEffect(() => {
    recordView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved state from API on mount
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.ids) && data.ids.includes(property.id)) {
          setSaved(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  async function handleSave() {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setSavePending(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      setSaved(!!data.saved);
    } catch { /* ignore */ }
    setSavePending(false);
  }

  // Fetch full photo gallery from MLS on mount (detail endpoint has all photos)
  useEffect(() => {
    if (!property.externalId) return;
    fetch(`/api/property-photos?externalId=${encodeURIComponent(property.externalId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      })
      .catch(() => {});
  }, [property.externalId]);

  const allSynagogues = nearbyShuls.map((s) => s.synagogue);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Usage gate modal */}
      {showGate && <UsageGateModal onClose={dismissGate} />}

      {/* Back */}
      <Link
        href="/results"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left col: images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo gallery */}
          <div className="overflow-hidden rounded-2xl">
            <div className="relative h-80 sm:h-96">
              <Image
                src={photos[activeImage] ?? ""}
                alt={property.title}
                fill
                className="object-cover"
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={property.listingType === "SALE" ? "default" : "success"}>
                  {property.listingType === "SALE" ? "For Sale" : "For Rent"}
                </Badge>
                {property.isFeatured && (
                  <Badge className="bg-amber-500 text-white">Featured</Badge>
                )}
              </div>
            </div>
            {photos.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      activeImage === i ? "border-[var(--primary)]" : "border-transparent"
                    )}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing info */}
          <div>
            <div className="mb-1 text-3xl font-extrabold text-slate-900">
              {formatPrice(property.price, property.listingType)}
            </div>
            <h1 className="mb-2 text-xl font-semibold text-slate-800">{property.title}</h1>
            <p className="mb-4 flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}, {property.state} {property.zip}
            </p>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-700">
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-slate-400" /> {property.beds} Bedrooms</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-slate-400" /> {property.baths} Bathrooms</span>
              {property.sqft && <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-slate-400" /> {property.sqft.toLocaleString()} sqft</span>}
              {property.yearBuilt && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> Built {property.yearBuilt}</span>}
            </div>

            {property.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
            )}
          </div>

          {/* Nearby synagogues list */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Synagogues Within 1.5 Miles
            </h2>
            <div className="space-y-3">
              {nearbyShuls.map((sd) => (
                <div
                  key={sd.synagogueId}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-lg">
                      ✡
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{sd.synagogue.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", DENOMINATION_COLORS[sd.synagogue.denomination])}>
                          {DENOMINATION_LABELS[sd.synagogue.denomination]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-slate-800">{formatDistance(sd.distanceMi)}</div>
                    <div className="text-xs text-slate-500">{sd.walkMinutes} min walk</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Location &amp; Synagogues</h2>
            <div className="h-80 overflow-hidden rounded-2xl border border-[var(--border)]">
              <ShulSearchMap
                properties={[property]}
                synagogues={allSynagogues}
                center={[property.lng, property.lat]}
                zoom={14}
              />
            </div>
          </div>
        </div>

        {/* Right col: contact card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-card">
              <div className="mb-4 text-2xl font-extrabold text-slate-900">
                {formatPrice(property.price, property.listingType)}
              </div>

              {/* Nearest shul highlight */}
              {nearbyShuls[0] && (
                <div className="mb-5 rounded-xl bg-blue-50 p-3">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                    Nearest Synagogue
                  </div>
                  <div className="font-semibold text-blue-900 text-sm">{nearbyShuls[0].synagogue.name}</div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    {formatDistance(nearbyShuls[0].distanceMi)} · {nearbyShuls[0].walkMinutes} min walk
                  </div>
                </div>
              )}

              <Button className="w-full mb-3" size="lg" onClick={() => setShowRequestModal(true)}>
                <Phone className="mr-2 h-4 w-4" /> Request Info
              </Button>
              <Button
                variant="outline"
                className={cn("w-full", saved && "border-rose-300 text-rose-600 hover:bg-rose-50")}
                onClick={handleSave}
                disabled={savePending}
              >
                <Heart className={cn("mr-2 h-4 w-4", saved && "fill-current text-rose-500")} />
                {saved ? "Saved" : "Save Property"}
              </Button>

              <p className="mt-4 text-center text-xs text-slate-400">
                Listed on ShulSearch · No fees to inquire
              </p>
            </div>

            {/* Shul count badge */}
            <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-4 text-center">
              <div className="text-3xl font-extrabold text-blue-700">{nearbyShuls.length}</div>
              <div className="text-sm text-slate-600 mt-1">
                synagogue{nearbyShuls.length !== 1 ? "s" : ""} within 1.5 miles
              </div>
            </div>
          </div>
        </div>
      </div>

      <RequestInfoModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        propertyAddress={`${property.address}, ${property.city}, ${property.state} ${property.zip}`}
      />

      {/* MLS / IDX Required Property Page Disclaimer */}
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-2 text-xs leading-relaxed text-slate-400">
          <p>
            Listing data is provided by participating MLSs and may not reflect all real estate
            activity in the market. Information is deemed reliable but not guaranteed and should
            be independently verified. The listing broker&apos;s offer of compensation is made only
            to participants of the MLS where the listing is filed.
          </p>
          <p>
            Distances, travel times, and proximity calculations are approximate and may vary.
            ShulSearch does not guarantee the accuracy of mapping or location-based results.
            ShulSearch is not a brokerage and does not represent buyers or sellers.
          </p>
          <p>
            ShulSearch fully supports the Fair Housing Act and all applicable housing laws and
            does not discriminate based on race, color, religion, sex, national origin,
            disability, familial status, or any other protected class.
          </p>
        </div>
      </div>
    </div>
  );
}
