import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const maxDuration = 300;

// ─── Credentials ──────────────────────────────────────────────────────────────

const SIMPLYRETS_KEY    = process.env.SIMPLYRETS_KEY    ?? "simplyrets";
const SIMPLYRETS_SECRET = process.env.SIMPLYRETS_SECRET ?? "simplyrets";
const RAPIDAPI_KEY      = process.env.RAPIDAPI_KEY ?? "";
const REALTOR_HOST      = "realty-in-us.p.rapidapi.com";

const IS_DEMO = SIMPLYRETS_KEY === "simplyrets"; // true until real MLS creds arrive

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
  { city: "Bal Harbour",       state: "FL" },
  { city: "Miami Beach",       state: "FL" },
  { city: "North Miami Beach", state: "FL" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function normaliseAddress(addr: string) {
  return addr.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function upgradePhotoUrl(url: string) {
  if (!url.includes("rdcpix.com")) return url;
  return url.replace(/(\d+)[std]\.jpg$/, "$1o.jpg");
}

async function fetchWithTimeout(url: string, options: RequestInit, ms = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── RapidAPI / Realtor.com (used while SimplyRETS is on demo) ────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRealtorProperty(raw: any, listingType: "SALE" | "RENT") {
  const addr  = raw.location?.address;
  const coord = addr?.coordinate;
  if (!coord?.lat || !coord?.lon) return null;
  const desc  = raw.description ?? {};
  const beds  = desc.beds ?? 0;
  const baths = (desc.baths_full_calc ?? desc.baths_full ?? 0) + (desc.baths_partial_calc ?? desc.baths_half ?? 0) * 0.5 || 1;
  const listPrice = raw.list_price ?? 0;
  if (!listPrice || beds === 0) return null;

  const photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    for (const p of raw.photos) if (p?.href) photos.push(upgradePhotoUrl(p.href));
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
    price:       Math.min(Math.round(listPrice * 100), 2_000_000_000),
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

async function fetchRealtorPage(city: string, state: string, status: "for_sale" | "for_rent"): Promise<unknown[]> {
  try {
    const res = await fetchWithTimeout(
      `https://${REALTOR_HOST}/properties/v3/list`,
      {
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
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.home_search?.results ?? [];
  } catch { return []; }
}

// ─── SimplyRETS (used when real MLS credentials are set) ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSimplyRetsProperty(raw: any, listingType: "SALE" | "RENT") {
  const geo  = raw.geo;
  const addr = raw.address;
  const prop = raw.property ?? {};
  if (!geo?.lat || !geo?.lng) return null;
  if (!raw.listPrice || raw.listPrice === 0) return null;
  if (!prop.bedrooms || prop.bedrooms === 0) return null;

  const beds      = prop.bedrooms ?? 0;
  const baths     = prop.bathrooms ?? prop.bathsFull ?? 1;
  const streetAddr = addr?.full ?? `${addr?.streetNumber ?? ""} ${addr?.streetName ?? ""}`.trim();
  const subType   = prop.subType ?? prop.type ?? "";
  const typeLabel = subType ? ` – ${subType}` : "";
  const photos: string[] = Array.isArray(raw.photos) ? raw.photos : [];

  return {
    externalId:  `simplyrets_${raw.mlsId as string}`,
    addressKey:  normaliseAddress(`${streetAddr} ${addr?.city ?? ""} ${addr?.state ?? ""}`),
    title:       `${beds}BR${typeLabel} at ${streetAddr}`.trim(),
    description: (raw.remarks as string) ?? null,
    address:     streetAddr,
    city:        addr?.city ?? "",
    state:       addr?.state ?? "FL",
    zip:         addr?.postalCode ?? "",
    lat:         geo.lat as number,
    lng:         geo.lng as number,
    listingType,
    status:      "ACTIVE" as const,
    price:       Math.min(Math.round((raw.listPrice as number) * 100), 2_000_000_000),
    beds,
    baths,
    sqft:        prop.area ?? null,
    yearBuilt:   prop.yearBuilt ?? null,
    imageUrls:   photos,
    amenities:   [] as string[],
    isApproved:  true,
    isFeatured:  false,
  };
}

async function fetchSimplyRetsPage(type: "residential" | "rental"): Promise<unknown[]> {
  try {
    const params = new URLSearchParams();
    TARGET_CITIES.forEach(({ city }) => params.append("cities", city));
    params.set("limit", "500");
    params.set("status", "Active");
    if (type === "rental") params.set("type", "rental");

    const credentials = Buffer.from(`${SIMPLYRETS_KEY}:${SIMPLYRETS_SECRET}`).toString("base64");
    const res = await fetch(`https://api.simplyrets.com/properties?${params}`, {
      headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch { return []; }
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

type ParsedProperty = NonNullable<ReturnType<typeof parseRealtorProperty>>;

async function upsertProperty(prop: ParsedProperty, synagogues: { id: string; lat: number; lng: number }[]): Promise<"imported" | "skipped"> {
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
      update: { title: propData.title, price: propData.price, status: propData.status, imageUrls: propData.imageUrls, isApproved: true, nearestSynagogueId: nearest.synagogue.id, nearestSynagugueDist: nearest.dist, synagogueCount1mi: count1mi, proximityScore },
    });

    await Promise.all(
      nearby.slice(0, 5).map(({ synagogue, dist }) =>
        prisma.propertySynagogueDistance.upsert({
          where:  { propertyId_synagogueId: { propertyId: upserted.id, synagogueId: synagogue.id } },
          create: { propertyId: upserted.id, synagogueId: synagogue.id, distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
          update: { distanceMi: dist, walkMinutes: Math.round((dist / 3) * 60) },
        })
      )
    );
    return "imported";
  } catch { return "skipped"; }
}

async function batchUpsert(props: ParsedProperty[], synagogues: { id: string; lat: number; lng: number }[], batchSize = 20) {
  let imported = 0, skipped = 0;
  for (let i = 0; i < props.length; i += batchSize) {
    const results = await Promise.all(props.slice(i, i + batchSize).map((p) => upsertProperty(p, synagogues)));
    imported += results.filter((r) => r === "imported").length;
    skipped  += results.filter((r) => r === "skipped").length;
  }
  return { imported, skipped };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST() {
  if (IS_DEMO && !RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set. Add it in Vercel → Settings → Environment Variables." },
      { status: 500 }
    );
  }

  const synagogues = await prisma.synagogue.findMany();

  try {
    let allRaw: { raw: unknown; listingType: "SALE" | "RENT" }[] = [];

    if (IS_DEMO) {
      // ── Use RapidAPI / Realtor.com while SimplyRETS creds are not set ──
      const fetches = TARGET_CITIES.flatMap(({ city, state }) => [
        fetchRealtorPage(city, state, "for_sale").then((rows) => rows.map((r) => ({ raw: r, listingType: "SALE" as const }))),
        fetchRealtorPage(city, state, "for_rent").then((rows) => rows.map((r) => ({ raw: r, listingType: "RENT" as const }))),
      ]);
      const results = await Promise.all(fetches);
      allRaw = results.flat();
    } else {
      // ── Use real SimplyRETS MLS feed ──
      const [saleRows, rentRows] = await Promise.all([
        fetchSimplyRetsPage("residential"),
        fetchSimplyRetsPage("rental"),
      ]);
      allRaw = [
        ...saleRows.map((r) => ({ raw: r, listingType: "SALE" as const })),
        ...rentRows.map((r) => ({ raw: r, listingType: "RENT" as const })),
      ];
    }

    // Parse + deduplicate
    const seenAddresses = new Set<string>();
    const toUpsert: ParsedProperty[] = [];

    for (const { raw, listingType } of allRaw) {
      const prop = IS_DEMO
        ? parseRealtorProperty(raw, listingType)
        : parseSimplyRetsProperty(raw, listingType);
      if (!prop || seenAddresses.has(prop.addressKey)) continue;
      seenAddresses.add(prop.addressKey);
      toUpsert.push(prop as ParsedProperty);
    }

    const { imported, skipped } = await batchUpsert(toUpsert, synagogues, 20);

    return NextResponse.json({
      source:        IS_DEMO ? "RapidAPI/Realtor.com" : "SimplyRETS MLS",
      fetched:       allRaw.length,
      totalImported: imported,
      skipped,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
