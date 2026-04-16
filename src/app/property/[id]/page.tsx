import { notFound } from "next/navigation";
import { getPropertyById, getAllActiveProperties } from "@/lib/db-helpers";
import { PropertyDetailClient } from "./property-detail-client";

export async function generateStaticParams() {
  const properties = await getAllActiveProperties();
  return properties.map((p) => ({ id: p.id }));
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  const nearbyShuls = (property.synagogueDistances ?? [])
    .filter((sd) => sd.distanceMi <= 1.5)
    .sort((a, b) => a.distanceMi - b.distanceMi);

  return <PropertyDetailClient property={property} nearbyShuls={nearbyShuls} />;
}
