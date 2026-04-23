import { getAllSynagogues } from "@/lib/db-helpers";
import { NearClient } from "./near-client";

export const metadata = { title: "Find Shuls Near an Address – ShulSearch" };

export default async function NearPage() {
  const synagogues = await getAllSynagogues();
  return <NearClient synagogues={synagogues} />;
}
