import { notFound } from "next/navigation";
import { getSynagogueById, getPropertiesNearSynagogue } from "@/lib/db-helpers";
import { SynagogueDetailClient } from "./synagogue-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const syn = await getSynagogueById(params.id);
  if (!syn) return {};
  return { title: `${syn.name} – ShulSearch` };
}

export default async function SynagogueDetailPage({ params }: { params: { id: string } }) {
  const [synagogue, nearbyProperties] = await Promise.all([
    getSynagogueById(params.id),
    getPropertiesNearSynagogue(params.id, 1.5),
  ]);

  if (!synagogue) notFound();

  return <SynagogueDetailClient synagogue={synagogue} nearbyProperties={nearbyProperties} />;
}
