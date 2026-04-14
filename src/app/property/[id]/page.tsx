import { notFound } from "next/navigation";
import { PROPERTIES } from "@/lib/mock-data";
import { PropertyDetailClient } from "./property-detail-client";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = PROPERTIES.find((p) => p.id === params.id);
  if (!property) notFound();

  // All shuls within 1.5 miles (from distances table)
  const nearbyShuls = (property.synagogueDistances ?? [])
    .filter((sd) => sd.distanceMi <= 1.5)
    .sort((a, b) => a.distanceMi - b.distanceMi);

  return <PropertyDetailClient property={property} nearbyShuls={nearbyShuls} />;
}
