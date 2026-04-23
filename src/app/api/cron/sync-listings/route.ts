import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured (local dev), allow all calls
  if (!secret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
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
  { city: "Cooper City",       state: "FL" },
  { city: "Davie",             state: "FL" },
];

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const REALTOR_HOST = "realty-in-us.p.rapidapi.com";
const ZILLOW_HOST  = "zillow-scraper-api.p.rapidapi.com";

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

function normaliseAddress(addr: string): string {
  return addr.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function upgradePhotoUrl(url: string): string {
  if (!url.includes("rdcpix.com")) return url;
  return url.replace(/(\d+)[std]\.jpg$/, "$1o.jpg");
}

// ─── Realtor.com parser ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRealtorProperty(raw: any, listingType: "SALE" | "RENT") {
  const addr  = raw.location?.address;
  const coord = addr?.coordinate;
  if (!coord?.lat || !coord?.lon) return null;
  const desc  = raw.description ?? {};
  const beds  = desc.beds ?? 0;
  const baths = (desc.baths_full_calc ?? 0) + (desc.baths_partial_calc ?? 0) * 0.5 || 1;
  if (!raw.list_price || beds === 0) return null;

  const photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    for (const p of raw.photos) { if (p?.href) photos.push(upgradePhotoUrl(p.href)); }
  }
  if (photos.length === 0 && raw.primary_photo?.href) photos.push(upgradePhotoUrl(raw.primary_photo.href));

  const propType  = desc.sub_type ?? desc.type ?? "";
  const typeLabel = propType ? ` – ${propType.charAt(0).toUpperCase() + propType.slice(1).replace(/_/g, " ")}` : "";

  return {
    externalId:  `realtor_${raw.property_id as string}`,
    addressKey:  normaliseAddress(`${addr.line ?? ""} ${addr.city ?? ""} ${addr.state_code ?? ""}`),
    title:       `${beds}BR${typeLabel} at ${addr.line ?? ""}`.trim(),
    description: null as string | null,
    address:     addr.line ?? "",
    city:        addr.city ?? "",
    state:       addr.state_code ?? "FL",
    zip:         addr.postal_code ?? "",
    lat:         coord.lat as number,
    lng:         coord.lon as number,
    listingType,
    status:      "ACTIVE" as const,
    price:       Math.round(raw.list_price * 100),
    beds,
    baths,
    sqft:        desc.sqft ?? null,
    yearBuilt:   null as number | null,
    imageUrls:   photos,
    amenities:   [] as string[],
    isApproved:  true,
    isFeatured:  false,
  };
}

async function fetchRealtorPage(city: string, state: string, status: "for_sale" | "for_rent") {
  const res = await fetch(`https://${REALTOR_HOST}/properties/v3/list`, {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "X-RapidAPI-Key":  RAPIDAPI_KEY,
      "X-RapidAPI-Host": REALTOR_HOST,
    },
    body: JSON.stringify({
      limit: 200, offset: 0, city, state_code: state,
      status: [status], sort: { direction: "desc", field: "list_date" },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.home_search?.results ?? [];
}

// ─── Zillow parser ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseZillowProperty(raw: any, listingType: "SALE" | "RENT") {
  const lat = raw.latitude ?? raw.lat;
  const lng = raw.longitude ?? raw.lon ?? raw.lng;
  if (!lat || !lng) return null;

  const beds  = raw.bedrooms  ?? raw.beds  ?? 0;
  const baths = raw.bathrooms ?? raw.baths ?? 1;
  const price = raw.price ?? raw.listPrice ?? raw.unformattedPrice ?? 0;
  if (!price || beds === 0) return null;

  const photos: string[] = [];
  if (Array.isArray(raw.carouselPhotos)) {
    for (const p of raw.carouselPhotos) {
      if (p?.url) photos.push(p.url);
      if (p?.src) photos.push(p.src);
    }
  }
  if (photos.length === 0 && raw.imgSrc) photos.push(raw.imgSrc);

  const fullAddr: string = raw.address ?? "";
  const parts    = fullAddr.split(",").map((s: string) => s.trim());
  const line     = parts[0] ?? "";
  const cityPart = parts[1] ?? "";
  const stateZip = (parts[2] ?? "").trim().split(" ");
  const statePart = stateZip[0] ?? "FL";
  const zipPart   = stateZip[1] ?? "";

  const propType  = raw.propertyType ?? "";
  const typeLabel = propType
    ? ` – ${propType.charAt(0).toUpperCase() + propType.slice(1).toLowerCase().replace(/_/g, " ")}`
    : "";

  return {
    externalId:  `zillow_${raw.zpid as string}`,
    addressKey:  normaliseAddress(fullAddr),
    title:       `${beds}BR${typeLabel} at ${line}`.trim(),
    description: null as string | null,
    address:     line,
    city:        cityPart,
    state:       statePart,
    zip:         zipPart,
    lat:         lat as number,
    lng:         lng as number,
    listingType,
    status:      "ACTIVE" as const,
    price:       Math.round(price * 100),
    beds,
    baths:       typeof baths === "number" ? baths : parseFloat(baths) || 1,
    sqft:        raw.livingArea ?? raw.sqft ?? null,
    yearBuilt:   raw.yearBuilt ?? null,
    imageUrls:   photos,
    amenities:   [] as string[],
    isApproved:  true,
    isFeatured:  false,
  };
}

async function fetchZillowPage(city: string, state: string, listingType: "for_sale" | "for_rent", page = 1): Promise<unknown[]> {
  try {
    const location = encodeURIComponent(`${city}, ${state}`);
    const res = await fetch(
      `https://${ZILLOW_HOST}/zillow/search?location=${location}&listing_type=${listingType}&sort=newest&page=${page}`,
      {
        headers: {
          "X-RapidAPI-Key":  RAPIDAPI_KEY,
          "X-RapidAPI-Host": ZILLOW_HOST,
        },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const raw = json?.results ?? json?.data ?? json;
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

// ─── Core upsert ──────────────────────────────────────────────────────────────
type ParsedProp = NonNullable<ReturnType<typeof parseRealtorProperty>>;

async function upsertProperty(
  prop: ParsedProp,
  synagogues: { id: string; lat: number; lng: number }[]
): Promise<"imported" | "skipped"> {
  const nearby = synagogues
    .map((s) => ({ synagogue: s, dist: distanceMiles(prop.lat, prop.lng, s.lat, s.lng) }))
    .filter((x) => x.dist <= 2.0)
    .sort((a, b) => a.dist - b.dist);

  if (nearby.length === 0) return "skipped";

  const nearest        = nearby[0];
  const count1mi       = nearby.filter((x) => x.dist <= 1.0).length;
  const proximityScore = (1.0 / nearest.dist) * 5 + count1mi * 0.8 + 1.5;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addressKey, ...propData } = prop;

  try {
    const upserted = await prisma.property.upsert({
      where:  { externalId: prop.externalId },
      create: { ...propData, nearestSynagogueId: nearest.synagogue.id, nearestSynagugueDist: nearest.dist, synagogueCount1mi: count1mi, proximityScore },
      update: { title: propData.title, price: propData.price, status: propData.status, imageUrls: propData.imageUrls, nearestSynagogueId: nearest.synagogue.id, nearestSynagugueDist: nearest.dist, synagogueCount1mi: count1mi, proximityScore },
    });

    for (const { synagogue, dist } of nearby.slice(0, 5)) {
      await prisma.propertySynagogueDistance.upsert({
        where:  { propertyId_synagogueId: { propertyId: upserted.id, synagogueId: synagogue.id } },
        create: { propertyId: upserted.id, synagogueId: synagogue.id, distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
        update: { distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
      });
    }
    return "imported";
  } catch {
    return "skipped";
  }
}

// ─── GET handler (called by Vercel cron 3× daily) ────────────────────────────
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt  = new Date().toISOString();
  const synagogues = await prisma.synagogue.findMany();
  const stats = {
    realtor:     { imported: 0, skipped: 0 },
    zillow:      { imported: 0, skipped: 0 },
    deduped:     0,
    deactivated: 0,
  };

  const seenAddresses   = new Set<string>();
  const seenExternalIds: string[] = [];

  for (const { city, state } of TARGET_CITIES) {
    // ── Realtor.com ──────────────────────────────────────────────────────────
    for (const [apiStatus, listingType] of [["for_sale", "SALE"], ["for_rent", "RENT"]] as [string, "SALE" | "RENT"][]) {
      const rows = await fetchRealtorPage(city, state, apiStatus as "for_sale" | "for_rent");
      for (const raw of rows) {
        const prop = parseRealtorProperty(raw, listingType);
        if (!prop) { stats.realtor.skipped++; continue; }
        seenAddresses.add(prop.addressKey);
        seenExternalIds.push(prop.externalId);
        const r = await upsertProperty(prop, synagogues);
        stats.realtor[r === "imported" ? "imported" : "skipped"]++;
      }
    }

    // ── Zillow ───────────────────────────────────────────────────────────────
    for (const [zStatus, listingType] of [["for_sale", "SALE"], ["for_rent", "RENT"]] as [string, "SALE" | "RENT"][]) {
      for (const page of [1, 2]) {
        const rows = await fetchZillowPage(city, state, zStatus as "for_sale" | "for_rent", page);
        if (rows.length === 0) break;
        for (const raw of rows) {
          const prop = parseZillowProperty(raw, listingType);
          if (!prop) { stats.zillow.skipped++; continue; }
          if (seenAddresses.has(prop.addressKey)) { stats.deduped++; continue; }
          seenAddresses.add(prop.addressKey);
          seenExternalIds.push(prop.externalId);
          const r = await upsertProperty(prop, synagogues);
          stats.zillow[r === "imported" ? "imported" : "skipped"]++;
        }
      }
    }
  }

  // ── Deactivate listings no longer appearing in the API (sold / off-market) ──
  // Any synced listing whose externalId wasn't seen this run gets marked INACTIVE
  if (seenExternalIds.length > 0) {
    const result = await prisma.property.updateMany({
      where: {
        externalId: { not: null, notIn: seenExternalIds },
        status: "ACTIVE",
      },
      data: { status: "INACTIVE" },
    });
    stats.deactivated = result.count;
  }

  const totalImported = stats.realtor.imported + stats.zillow.imported;
  console.log(`[cron/sync] ${startedAt} | realtor=${JSON.stringify(stats.realtor)} zillow=${JSON.stringify(stats.zillow)} deduped=${stats.deduped} deactivated=${stats.deactivated}`);

  return NextResponse.json({ ok: true, startedAt, ...stats, totalImported });
}
