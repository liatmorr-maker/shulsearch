import { ResultsClient } from "./results-client";

export const metadata = {
  title: "Search Results – ShulSearch",
};

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; zip?: string };
}) {
  return <ResultsClient searchParams={searchParams} />;
}
