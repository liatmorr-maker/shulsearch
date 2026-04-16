import { notFound } from "next/navigation";
import { getSynagogueById, getAllSynagogues, getPropertiesNearSynagogue } from "@/lib/db-helpers";
import { SynagogueDetailClient } from "./synagogue-detail-client";

export async function generateStaticParams() {
  const synagogues = await getAllSynagogues();
  return synagogues.map((s) => ({ id: s.id }));
}

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
