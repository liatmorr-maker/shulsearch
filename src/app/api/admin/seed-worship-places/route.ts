import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// South Florida bounding box: covers all target cities
const BBOX = "25.4,-80.9,26.6,-80.0"; // south,west,north,east

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function overpassQuery(religion: "christian" | "muslim") {
  return `[out:json][timeout:60];
(
  node["amenity"="place_of_worship"]["religion"="${religion}"](${BBOX});
  way["amenity"="place_of_worship"]["religion"="${religion}"](${BBOX});
);
out center;`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePlaces(elements: any[], worshipType: "CHURCH" | "MOSQUE") {
  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) return null;

      const tags = el.tags ?? {};
      const name = tags.name ?? tags["name:en"] ?? (worshipType === "CHURCH" ? "Church" : "Mosque");
      const city = tags["addr:city"] ?? "";
      const state = tags["addr:state"] ?? "FL";
      const zip = tags["addr:postcode"] ?? "";
      const address = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || name;

      return {
        externalId: `osm_${el.type}_${el.id}`,
        name,
        worshipType,
        denomination: "OTHER" as const,
        address,
        city,
        state,
        zip,
        lat: lat as number,
        lng: lng as number,
        isVerified: false,
      };
    })
    .filter(Boolean);
}

export async function POST() {
  try {
    const [churchRes, mosqueRes] = await Promise.all([
      fetch(OVERPASS_URL, { method: "POST", body: overpassQuery("christian"), headers: { "Content-Type": "text/plain" } }),
      fetch(OVERPASS_URL, { method: "POST", body: overpassQuery("muslim"),    headers: { "Content-Type": "text/plain" } }),
    ]);

    if (!churchRes.ok || !mosqueRes.ok) {
      return NextResponse.json({ error: "Overpass API request failed" }, { status: 502 });
    }

    const [churchJson, mosqueJson] = await Promise.all([churchRes.json(), mosqueRes.json()]);

    const churches = parsePlaces(churchJson.elements ?? [], "CHURCH");
    const mosques  = parsePlaces(mosqueJson.elements ?? [],  "MOSQUE");
    const all = [...churches, ...mosques].filter(Boolean);

    let upserted = 0;
    for (const place of all) {
      if (!place) continue;
      const { externalId, ...data } = place;
      await prisma.$executeRaw`
        INSERT INTO synagogues (id, name, "worshipType", denomination, address, city, state, zip, lat, lng, "isVerified", "createdAt", "updatedAt")
        VALUES (
          ${`wp_${externalId}`},
          ${data.name},
          ${data.worshipType}::"PlaceOfWorshipType",
          ${data.denomination}::"Denomination",
          ${data.address},
          ${data.city},
          ${data.state},
          ${data.zip},
          ${data.lat},
          ${data.lng},
          false,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          lat  = EXCLUDED.lat,
          lng  = EXCLUDED.lng,
          city = EXCLUDED.city
      `;
      upserted++;
    }

    return NextResponse.json({
      churches: churches.length,
      mosques:  mosques.length,
      upserted,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
