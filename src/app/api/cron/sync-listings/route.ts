import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel calls this with a secret to prevent unauthorized triggers
function isAuthorized(req: Request) {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

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

const RAPIDAPI_HOST = "realty-in-us.p.rapidapi.com";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProperty(raw: any, listingType: "SALE" | "RENT") {
  const addr = raw.location?.address;
  const coord = addr?.coordinate;
  if (!coord?.lat || !coord?.lon) return null;
  const desc = raw.description ?? {};
  const beds = desc.beds ?? 0;
  const baths = (desc.baths_full_calc ?? 0) + (desc.baths_partial_calc ?? 0) * 0.5 || 1;
  if (!raw.list_price || beds === 0) return null;
  const propType = desc.sub_type ?? desc.type ?? "";
  const typeLabel = propType ? ` – ${propType.charAt(0).toUpperCase() + propType.slice(1).replace(/_/g, " ")}` : "";
  return {
    externalId: raw.property_id as string,
    title: `${beds}BR${typeLabel} at ${addr.line ?? ""}`.trim(),
    description: null as string | null,
    address: addr.line ?? "",
    city: addr.city ?? "",
    state: addr.state_code ?? "FL",
    zip: addr.postal_code ?? "",
    lat: coord.lat as number,
    lng: coord.lon as number,
    listingType,
    status: "ACTIVE" as const,
    price: Math.round(raw.list_price * 100),
    beds,
    baths,
    sqft: desc.sqft ?? null,
    yearBuilt: null as number | null,
    imageUrls: raw.primary_photo?.href ? [raw.primary_photo.href] : [],
    amenities: [] as string[],
    isApproved: true, // auto-approve on cron
    isFeatured: false,
  };
}

async function fetchPage(city: string, state: string, status: "for_sale" | "for_rent") {
  const res = await fetch(`https://${RAPIDAPI_HOST}/properties/v3/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      limit: 200, offset: 0, city, state_code: state,
      status: [status],
      sort: { direction: "desc", field: "list_date" },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.home_search?.results ?? [];
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const synagogues = await prisma.synagogue.findMany();
  let imported = 0;
  let skipped = 0;

  for (const { city, state } of TARGET_CITIES) {
    for (const [apiStatus, listingType] of [
      ["for_sale", "SALE"], ["for_rent", "RENT"],
    ] as [string, "SALE" | "RENT"][]) {
      const rows = await fetchPage(city, state, apiStatus as "for_sale" | "for_rent");

      for (const raw of rows) {
        const prop = parseProperty(raw, listingType);
        if (!prop) { skipped++; continue; }

        const nearby = synagogues
          .map((s) => ({ synagogue: s, dist: distanceMiles(prop.lat, prop.lng, s.lat, s.lng) }))
          .filter((x) => x.dist <= 2.0)
          .sort((a, b) => a.dist - b.dist);

        if (nearby.length === 0) { skipped++; continue; }

        const nearest = nearby[0];
        const count1mi = nearby.filter((x) => x.dist <= 1.0).length;
        const proximityScore = (1.0 / nearest.dist) * 5 + count1mi * 0.8 + 1.5;

        try {
          const upserted = await prisma.property.upsert({
            where: { externalId: prop.externalId },
            create: { ...prop, nearestSynagogueId: nearest.synagogue.id, nearestSynagugueDist: nearest.dist, synagogueCount1mi: count1mi, proximityScore },
            update: { title: prop.title, price: prop.price, status: prop.status, imageUrls: prop.imageUrls, nearestSynagogueId: nearest.synagogue.id, nearestSynagugueDist: nearest.dist, synagogueCount1mi: count1mi, proximityScore },
          });

          for (const { synagogue, dist } of nearby.slice(0, 5)) {
            await prisma.propertySynagogueDistance.upsert({
              where: { propertyId_synagogueId: { propertyId: upserted.id, synagogueId: synagogue.id } },
              create: { propertyId: upserted.id, synagogueId: synagogue.id, distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
              update: { distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
            });
          }
          imported++;
        } catch { skipped++; }
      }
    }
  }

  // Mark listings no longer in MLS as inactive (not seen in last 2 days)
  await prisma.property.updateMany({
    where: {
      externalId: { not: null },
      updatedAt: { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    },
    data: { status: "INACTIVE" },
  });

  console.log(`[cron] sync complete: ${imported} imported, ${skipped} skipped`);
  return NextResponse.json({ imported, skipped });
}
