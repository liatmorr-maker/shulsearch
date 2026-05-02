import { getAllSynagogues } from "@/lib/db-helpers";
import { NearClient } from "./near-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Find Places of Worship Near an Address – ShulSearch" };

export default async function NearPage() {
  const synagogues = await getAllSynagogues();
  return <NearClient synagogues={synagogues} />;
}
