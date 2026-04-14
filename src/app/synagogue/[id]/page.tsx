import { notFound } from "next/navigation";
import { SYNAGOGUES, PROPERTIES } from "@/lib/mock-data";
import { SynagogueDetailClient } from "./synagogue-detail-client";

export function generateStaticParams() {
  return SYNAGOGUES.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const syn = SYNAGOGUES.find((s) => s.id === params.id);
  if (!syn) return {};
  return { title: `${syn.name} – ShulSearch` };
}

export default function SynagogueDetailPage({ params }: { params: { id: string } }) {
  const synagogue = SYNAGOGUES.find((s) => s.id === params.id);
  if (!synagogue) notFound();

  // Properties that list this synagogue in their distances, within 1.5 mi
  const nearbyProperties = PROPERTIES.filter(
    (p) =>
      p.isApproved &&
      p.status === "ACTIVE" &&
      p.synagogueDistances?.some(
        (sd) => sd.synagogueId === params.id && sd.distanceMi <= 1.5
      )
  ).sort((a, b) => {
    const da = a.synagogueDistances?.find((sd) => sd.synagogueId === params.id)?.distanceMi ?? 99;
    const db = b.synagogueDistances?.find((sd) => sd.synagogueId === params.id)?.distanceMi ?? 99;
    return da - db;
  });

  return <SynagogueDetailClient synagogue={synagogue} nearbyProperties={nearbyProperties} />;
}
