import Link from "next/link";

const AREAS = [
  {
    name: "Aventura",
    description: "4 synagogues within 1 mile of many listings",
    shulCount: 4,
    listingCount: 120,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    gradient: "from-blue-900/70",
  },
  {
    name: "Boca Raton",
    description: "Established Jewish community, top-rated schools",
    shulCount: 6,
    listingCount: 98,
    image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&q=80",
    gradient: "from-indigo-900/70",
  },
  {
    name: "Sunny Isles Beach",
    description: "Oceanfront luxury steps from Chabad &amp; Young Israel",
    shulCount: 2,
    listingCount: 74,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    gradient: "from-teal-900/70",
  },
];

export function PopularAreas() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Popular Areas</h2>
            <p className="mt-1 text-slate-500">South Florida&apos;s top Jewish communities</p>
          </div>
          <Link
            href="/results"
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
              <div
                className={`absolute inset-0 bg-gradient-to-t ${area.gradient} to-transparent`}
              />

              {/* Content */}
              <div className="relative p-6 pt-32 text-white">
                <h3 className="text-xl font-bold">{area.name}</h3>
                <p className="mt-1 text-sm text-white/80">{area.description}</p>
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    ✡ {area.shulCount} shuls
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    🏠 {area.listingCount} listings
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
