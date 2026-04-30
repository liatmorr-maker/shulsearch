import { getAllActiveProperties, getAllSynagogues } from "@/lib/db-helpers";
import { ResultsClient } from "./results-client";

// Always fetch fresh data so ?q= params are never stale-cached
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Results – ShulSearch",
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; zip?: string };
}) {
  // Filter by city on the server so we don't ship 2000+ listings to the browser
  const cityParam = searchParams.city ?? searchParams.q ?? undefined;
  const [properties, synagogues] = await Promise.all([
    getAllActiveProperties(cityParam),
    getAllSynagogues(),
  ]);

  return (
    <ResultsClient
      searchParams={searchParams}
      initialProperties={properties}
      initialSynagogues={synagogues}
    />
  );
}
