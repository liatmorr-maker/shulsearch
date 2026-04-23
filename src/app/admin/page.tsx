import { getAllSynagogues } from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Panel – ShulSearch" };

export default async function AdminPage() {
  const [properties, synagogues, leads, users] = await Promise.all([
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
      include: {
        property: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      include: {
        savedProperties: { include: { property: true } },
        leads: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedProperties = properties.map((p: typeof properties[number]) => ({
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

  const serializedLeads = leads.map((l) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyLead = l as any;
    return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone ?? null,
    message: l.message ?? null,
    status: (anyLead.status ?? "NEW") as string,
    notes: (anyLead.notes ?? null) as string | null,
    source: (anyLead.source ?? "request_info") as string,
    createdAt: l.createdAt.toISOString(),
    property: l.property ? {
      id: l.property.id,
      title: l.property.title,
      address: l.property.address,
      city: l.property.city,
      price: l.property.price,
      listingType: l.property.listingType as "SALE" | "RENT",
    } : null,
    user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email } : null,
  };
  });

  const serializedUsers = users.map((u) => ({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    name: u.name ?? null,
    role: u.role as string,
    createdAt: u.createdAt.toISOString(),
    savedCount: u.savedProperties.length,
    leadsCount: u.leads.length,
    lastLead: u.leads[0]?.createdAt.toISOString() ?? null,
  }));

  return (
    <AdminClient
      initialProperties={serializedProperties}
      synagogues={synagogues}
      leads={serializedLeads}
      users={serializedUsers}
    />
  );
}
