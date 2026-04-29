/**
 * Helpers to fetch data from Prisma and convert to the shape
 * expected by UI components (compatible with MockProperty / MockSynagogue).
 */
import { prisma } from "./prisma";
import type { MockProperty, MockSynagogue } from "./mock-data";

// ─── Synagogues ──────────────────────────────────────────────────────────────

export async function getAllSynagogues(): Promise<MockSynagogue[]> {
  const rows = await prisma.synagogue.findMany({ orderBy: { name: "asc" } });
  return rows.map(synToMock);
}

export async function getSynagogueById(id: string): Promise<MockSynagogue | null> {
  const row = await prisma.synagogue.findUnique({ where: { id } });
  return row ? synToMock(row) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function synToMock(s: any): MockSynagogue {
  return {
    id: s.id,
    name: s.name,
    denomination: s.denomination,
    worshipType: (s.worshipType ?? "SYNAGOGUE") as MockSynagogue["worshipType"],
    address: s.address,
    city: s.city,
    state: s.state,
    zip: s.zip,
    phone: s.phone ?? undefined,
    email: s.email ?? undefined,
    website: s.website ?? undefined,
    lat: s.lat,
    lng: s.lng,
    isVerified: s.isVerified,
  };
}

// ─── Properties ──────────────────────────────────────────────────────────────

const PROPERTY_INCLUDE = {
  synagogueDistances: {
    include: { synagogue: true },
    orderBy: { distanceMi: "asc" as const },
  },
} as const;

export async function getAllActiveProperties(city?: string): Promise<MockProperty[]> {
  const cityFilter = city
    ? {
        OR: [
          { city: { contains: city, mode: "insensitive" as const } },
          { zip: { contains: city, mode: "insensitive" as const } },
          { address: { contains: city, mode: "insensitive" as const } },
        ],
      }
    : {};

  const baseWhere = { isApproved: true, status: "ACTIVE" as const, ...cityFilter };

  // Fetch SALE and RENT separately so neither type gets squeezed out by the cap
  const [saleRows, rentRows] = await Promise.all([
    prisma.property.findMany({
      where: { ...baseWhere, listingType: "SALE" },
      include: PROPERTY_INCLUDE,
      orderBy: { proximityScore: "desc" },
      take: 400,
    }),
    prisma.property.findMany({
      where: { ...baseWhere, listingType: "RENT" },
      include: PROPERTY_INCLUDE,
      orderBy: { proximityScore: "desc" },
      take: 400,
    }),
  ]);

  return [...saleRows, ...rentRows].map(propToMock);
}

export async function getFeaturedProperties(limit = 3): Promise<MockProperty[]> {
  // First: explicitly featured listings
  const featured = await prisma.property.findMany({
    where: { isApproved: true, isFeatured: true, status: "ACTIVE" },
    include: PROPERTY_INCLUDE,
    orderBy: { proximityScore: "desc" },
  });

  // Prefer synced (MLS) listings that have real photos over mock-seeded ones
  const synced = featured.filter((p) => p.externalId !== null && p.imageUrls.length > 0);
  const manual = featured.filter((p) => p.externalId === null);
  const sorted = [...synced, ...manual];

  if (sorted.length >= limit) return sorted.slice(0, limit).map(propToMock);

  // Fallback: top-scoring approved listings with real MLS photos
  const fallback = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "ACTIVE",
      externalId: { not: null },
      imageUrls: { isEmpty: false },
      id: { notIn: sorted.map((p) => p.id) },
    },
    include: PROPERTY_INCLUDE,
    take: limit - sorted.length,
    orderBy: { proximityScore: "desc" },
  });

  return [...sorted, ...fallback].map(propToMock);
}

export async function getPropertyById(id: string): Promise<MockProperty | null> {
  const row = await prisma.property.findUnique({
    where: { id },
    include: PROPERTY_INCLUDE,
  });
  return row ? propToMock(row) : null;
}

export async function getPropertiesNearSynagogue(
  synagogueId: string,
  maxMi = 1.5
): Promise<MockProperty[]> {
  const rows = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "ACTIVE",
      synagogueDistances: {
        some: { synagogueId, distanceMi: { lte: maxMi } },
      },
    },
    include: PROPERTY_INCLUDE,
    orderBy: { proximityScore: "desc" },
  });
  return rows
    .map(propToMock)
    .sort((a, b) => {
      const da = a.synagogueDistances?.find((sd) => sd.synagogueId === synagogueId)?.distanceMi ?? 99;
      const db = b.synagogueDistances?.find((sd) => sd.synagogueId === synagogueId)?.distanceMi ?? 99;
      return da - db;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function propToMock(p: any): MockProperty {
  return {
    id: p.id,
    externalId: p.externalId ?? undefined,
    title: p.title,
    description: p.description ?? undefined,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    neighborhood: p.neighborhood ?? undefined,
    lat: p.lat,
    lng: p.lng,
    listingType: p.listingType,
    status: p.status,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft ?? undefined,
    yearBuilt: p.yearBuilt ?? undefined,
    imageUrls: p.imageUrls ?? [],
    amenities: p.amenities ?? [],
    isApproved: p.isApproved,
    isFeatured: p.isFeatured,
    nearestSynagogueId: p.nearestSynagogueId ?? undefined,
    nearestSynagugueDist: p.nearestSynagugueDist ?? undefined,
    nearestChurchId: p.nearestChurchId ?? undefined,
    nearestChurchDist: p.nearestChurchDist ?? undefined,
    nearestMosqueId: p.nearestMosqueId ?? undefined,
    nearestMosqueDist: p.nearestMosqueDist ?? undefined,
    nearestTempleId: p.nearestTempleId ?? undefined,
    nearestTempleDist: p.nearestTempleDist ?? undefined,
    synagogueCount1mi: p.synagogueCount1mi,
    proximityScore: p.proximityScore ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    synagogueDistances: (p.synagogueDistances ?? []).map((sd: any) => ({
      synagogueId: sd.synagogueId,
      distanceMi: sd.distanceMi,
      walkMinutes: sd.walkMinutes,
      synagogue: {
        denomination: sd.synagogue.denomination,
        worshipType: (sd.synagogue.worshipType ?? "SYNAGOGUE") as MockSynagogue["worshipType"],
        name: sd.synagogue.name,
        lat: sd.synagogue.lat,
        lng: sd.synagogue.lng,
      },
    })),
  };
}
