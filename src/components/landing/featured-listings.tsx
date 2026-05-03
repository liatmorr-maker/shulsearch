import Link from "next/link";
import { getFeaturedProperties } from "@/lib/db-helpers";
import { PropertyCard } from "@/components/property/property-card";

export async function FeaturedListings() {
  const featured = await getFeaturedProperties(3);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Listings</h2>
            <p className="mt-1 text-slate-500">Hand-picked homes in walkable locations near places of worship</p>
          </div>
          <Link
            href="/results"
            aria-label="View all listings"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            View all listings →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
