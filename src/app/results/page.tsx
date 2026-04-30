import { getAllActiveProperties, getAllSynagogues } from "@/lib/db-helpers";
import { ResultsClient } from "./results-client";
import type { WorshipType } from "@/store/filter-store";

// Always fetch fresh data so ?q= params are never stale-cached
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Results – ShulSearch",
};

const VALID_WORSHIP_TYPES: WorshipType[] = ["SYNAGOGUE", "CHURCH", "MOSQUE", "TEMPLE"];

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; zip?: string; worshipType?: string };
}) {
  const cityParam = searchParams.city ?? searchParams.q ?? undefined;
  const initialWorshipType: WorshipType =
    VALID_WORSHIP_TYPES.includes(searchParams.worshipType as WorshipType)
      ? (searchParams.worshipType as WorshipType)
      : "SYNAGOGUE";

  const [properties, synagogues] = await Promise.all([
    getAllActiveProperties(cityParam),
    getAllSynagogues(),
  ]);

  return (
    <ResultsClient
      searchParams={searchParams}
      initialProperties={properties}
      initialSynagogues={synagogues}
      initialWorshipType={initialWorshipType}
    />
  );
}
