import { getAllSynagogues } from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Panel – ShulSearch" };

export default async function AdminPage() {
  const [properties, synagogues, leads] = await Promise.all([
    prisma.property.findMany({
      include: {
        synagogueDistances: {
          include: { synagogue: true },
          orderBy: { distanceMi: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getAllSynagogues(),
    prisma.lead.findMany({
      include: { property: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const serializedProperties = properties.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    listingType: p.listingType as "SALE" | "RENT",
    status: p.status as string,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft ?? undefined,
    imageUrls: p.imageUrls,
    isApproved: p.isApproved,
    isFeatured: p.isFeatured,
    nearestSynagugueDist: p.nearestSynagugueDist ?? undefined,
    synagogueCount1mi: p.synagogueCount1mi,
    proximityScore: p.proximityScore ?? undefined,
    synagogueDistances: p.synagogueDistances.map((sd) => ({
      synagogueId: sd.synagogueId,
      distanceMi: sd.distanceMi,
      walkMinutes: sd.walkMinutes,
      synagogue: {
        denomination: sd.synagogue.denomination,
        name: sd.synagogue.name,
        lat: sd.synagogue.lat,
        lng: sd.synagogue.lng,
      },
    })),
  }));

  const serializedLeads = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone ?? null,
    message: l.message ?? null,
    createdAt: l.createdAt.toISOString(),
    property: l.property
      ? {
          id: l.property.id,
          title: l.property.title,
          price: l.property.price,
          listingType: l.property.listingType as "SALE" | "RENT",
        }
      : null,
  }));

  return (
    <AdminClient
      initialProperties={serializedProperties}
      synagogues={synagogues}
      leads={serializedLeads}
    />
  );
}
