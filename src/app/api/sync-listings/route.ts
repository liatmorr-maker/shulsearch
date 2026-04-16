import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TARGET_CITIES = [
  { city: "Aventura",          state: "FL" },
  { city: "Sunny Isles Beach", state: "FL" },
  { city: "Hollywood",         state: "FL" },
  { city: "Boca Raton",        state: "FL" },
  { city: "Hallandale Beach",  state: "FL" },
  { city: "Pembroke Pines",    state: "FL" },
  { city: "Surfside",          state: "FL" },
  { city: "Fort Lauderdale",   state: "FL" },
];

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = "realty-in-us.p.rapidapi.com";

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

/**
 * rdcpix.com URLs use a numeric suffix + size letter before .jpg
 * e.g. "...l-m2291172589s.jpg" (small) → "...l-m2291172589o.jpg" (original)
 * Size letters: s=small, t=thumbnail, d=display, o=original
 */
function upgradePhotoUrl(url: string): string {
  if (!url.includes("rdcpix.com")) return url;
  // Replace trailing size letter (s/t/d) with 'o' (original full-res)
  return url.replace(/(\d+)[std]\.jpg$/, "$1o.jpg");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProperty(raw: any, listingType: "SALE" | "RENT") {
  const addr = raw.location?.address;
  const coord = addr?.coordinate;
  if (!coord?.lat || !coord?.lon) return null;

  const desc = raw.description ?? {};
  const beds = desc.beds ?? 0;
  const bathsFull = desc.baths_full_calc ?? desc.baths_full ?? 0;
  const bathsHalf = desc.baths_partial_calc ?? desc.baths_half ?? 0;
  const baths = bathsFull + bathsHalf * 0.5 || 1;
  const listPrice = raw.list_price ?? 0;
  if (!listPrice || beds === 0) return null;

  // Collect full-resolution photos — prefer photos[] array, fall back to primary_photo
  const photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    for (const p of raw.photos) {
      const href: string | undefined = p?.href;
      if (href) photos.push(upgradePhotoUrl(href));
    }
  }
  if (photos.length === 0 && raw.primary_photo?.href) {
    photos.push(upgradePhotoUrl(raw.primary_photo.href));
  }

  const propType = desc.sub_type ?? desc.type ?? "";
  const typeLabel = propType ? ` – ${propType.charAt(0).toUpperCase() + propType.slice(1).replace(/_/g, " ")}` : "";
  const title = `${beds}BR${typeLabel} at ${addr.line ?? ""}`.trim();

  return {
    externalId: raw.property_id as string,
    title,
    description: null as string | null,
    address: addr.line ?? "",
    city: addr.city ?? "",
    state: addr.state_code ?? "FL",
    zip: addr.postal_code ?? "",
    lat: coord.lat as number,
    lng: coord.lon as number,
    listingType,
    status: "ACTIVE" as const,
    // API gives price in dollars; store in cents
    price: Math.round(listPrice * 100),
    beds,
    baths,
    sqft: desc.sqft ?? null,
    yearBuilt: null as number | null,
    imageUrls: photos,
    amenities: [] as string[],
    isApproved: false,
    isFeatured: false,
  };
}

async function fetchPage(city: string, state: string, status: "for_sale" | "for_rent") {
  const res = await fetch(`https://${RAPIDAPI_HOST}/properties/v3/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      limit: 200,
      offset: 0,
      city,
      state_code: state,
      status: [status],
      sort: { direction: "desc", field: "list_date" },
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.home_search?.results ?? [];
}

export async function POST() {
  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });
  }

  const synagogues = await prisma.synagogue.findMany();
  let imported = 0;
  let skipped = 0;

  for (const { city, state } of TARGET_CITIES) {
    for (const [apiStatus, listingType] of [
      ["for_sale", "SALE"],
      ["for_rent", "RENT"],
    ] as [string, "SALE" | "RENT"][]) {
      const rows = await fetchPage(city, state, apiStatus as "for_sale" | "for_rent");

      for (const raw of rows) {
        const prop = parseProperty(raw, listingType);
        if (!prop) { skipped++; continue; }

        // Find synagogues within 2 miles
        const nearby = synagogues
          .map((s) => ({
            synagogue: s,
            dist: distanceMiles(prop.lat, prop.lng, s.lat, s.lng),
          }))
          .filter((x) => x.dist <= 2.0)
          .sort((a, b) => a.dist - b.dist);

        if (nearby.length === 0) { skipped++; continue; }

        const nearest = nearby[0];
        const count1mi = nearby.filter((x) => x.dist <= 1.0).length;
        const proximityScore = (1.0 / nearest.dist) * 5 + count1mi * 0.8 + 1.5;

        try {
          const upserted = await prisma.property.upsert({
            where: { externalId: prop.externalId },
            create: {
              ...prop,
              nearestSynagogueId: nearest.synagogue.id,
              nearestSynagugueDist: nearest.dist,
              synagogueCount1mi: count1mi,
              proximityScore,
            },
            update: {
              title: prop.title,
              price: prop.price,
              status: prop.status,
              imageUrls: prop.imageUrls,
              nearestSynagogueId: nearest.synagogue.id,
              nearestSynagugueDist: nearest.dist,
              synagogueCount1mi: count1mi,
              proximityScore,
            },
          });

          for (const { synagogue, dist } of nearby.slice(0, 5)) {
            await prisma.propertySynagogueDistance.upsert({
              where: { propertyId_synagogueId: { propertyId: upserted.id, synagogueId: synagogue.id } },
              create: { propertyId: upserted.id, synagogueId: synagogue.id, distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
              update: { distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
            });
          }

          imported++;
        } catch (err) {
          console.error("upsert error", prop.externalId, err);
          skipped++;
        }
      }
    }
  }

  return NextResponse.json({ imported, skipped });
}
