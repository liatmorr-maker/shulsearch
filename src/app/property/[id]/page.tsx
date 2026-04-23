import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/db-helpers";
import { PropertyDetailClient } from "./property-detail-client";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  const nearbyShuls = (property.synagogueDistances ?? [])
    .filter((sd) => sd.distanceMi <= 1.5)
    .sort((a, b) => a.distanceMi - b.distanceMi);

  return <PropertyDetailClient property={property} nearbyShuls={nearbyShuls} />;
}
