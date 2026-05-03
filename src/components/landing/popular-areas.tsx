import Link from "next/link";
import { prisma } from "@/lib/prisma";

const AREAS = [
  {
    name: "Aventura",
    description: "Luxury high-rises in a walkable community with easy access to multiple places of worship and vibrant amenities",
    image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600&q=80",
    gradient: "from-blue-900/70",
  },
  {
    name: "Boca Raton",
    description: "Beautiful single-family homes in an established neighborhood with top-rated schools and diverse community resources",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    gradient: "from-amber-900/60",
  },
  {
    name: "Sunny Isles Beach",
    description: "Oceanfront luxury condos with proximity to multiple places of worship, world-class beaches, and vibrant community life",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    gradient: "from-teal-900/70",
  },
];

export async function PopularAreas() {
  // Fetch real counts from DB in parallel
  const [synagogueCounts, listingCounts] = await Promise.all([
    prisma.synagogue.groupBy({
      by: ["city"],
      where: { city: { in: AREAS.map((a) => a.name) } },
      _count: { id: true },
    }),
    prisma.property.groupBy({
      by: ["city"],
      where: {
        city: { in: AREAS.map((a) => a.name) },
        isApproved: true,
        status: "ACTIVE",
      },
      _count: { id: true },
    }),
  ]);

  const shulByCity = Object.fromEntries(synagogueCounts.map((r) => [r.city, r._count.id]));
  const listingsByCity = Object.fromEntries(listingCounts.map((r) => [r.city, r._count.id]));

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Popular Areas</h2>
          </div>
          <Link
            href="/results"
            aria-label="View all areas"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {AREAS.map((area) => (
            <Link
              key={area.name}
              href={`/results?q=${encodeURIComponent(area.name)}`}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${area.image})` }}
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${area.gradient} to-transparent`} />

              {/* Content */}
              <div className="relative p-6 pt-32 text-white">
                <h3 className="text-xl font-bold">{area.name}</h3>
                <p className="mt-1 text-sm text-white/80">{area.description}</p>
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <span role="img" aria-label="places of worship">🛐</span> {shulByCity[area.name] ?? 0} places of worship
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <span role="img" aria-label="home">🏠</span> {listingsByCity[area.name] ?? 0} listings
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
