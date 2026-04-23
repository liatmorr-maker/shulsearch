import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radiusMi = parseFloat(searchParams.get("radius") ?? "2");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  // Rough bounding box to limit DB rows (1 degree ≈ 69 miles)
  const delta = radiusMi / 69;
  const properties = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "ACTIVE",
      lat: { gte: lat - delta, lte: lat + delta },
      lng: { gte: lng - delta, lte: lng + delta },
    },
    include: {
      synagogueDistances: {
        include: { synagogue: true },
        orderBy: { distanceMi: "asc" },
        take: 1,
      },
    },
    take: 50,
  });

  // Filter + add exact distance from searched point
  const results = properties
    .map((p) => ({
      id: p.id,
      title: p.title,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      lat: p.lat,
      lng: p.lng,
      price: p.price,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      listingType: p.listingType,
      imageUrls: p.imageUrls,
      distanceMi: distanceMiles(lat, lng, p.lat, p.lng),
      nearestShul: p.synagogueDistances[0]
        ? {
            name: p.synagogueDistances[0].synagogue.name,
            distanceMi: p.synagogueDistances[0].distanceMi,
            walkMinutes: p.synagogueDistances[0].walkMinutes,
          }
        : null,
    }))
    .filter((p) => p.distanceMi <= radiusMi)
    .sort((a, b) => a.distanceMi - b.distanceMi);

  return NextResponse.json({ results });
}
