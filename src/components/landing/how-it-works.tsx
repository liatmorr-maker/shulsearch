import { MapPin, SlidersHorizontal, Heart } from "lucide-react";

const STEPS = [
  {
    icon: MapPin,
    color: "bg-blue-100 text-blue-700",
    title: "Search Your Area",
    desc: "Enter a city, zip, or neighborhood to explore available properties and view nearby synagogues on the map.",
  },
  {
    icon: SlidersHorizontal,
    color: "bg-indigo-100 text-indigo-700",
    title: "Filter by Distance",
    desc: "Set max walking distance (0.25–1.5 mi), denomination, price, beds, and listing type.",
  },
  {
    icon: Heart,
    color: "bg-rose-100 text-rose-700",
    title: "Save Favorites",
    desc: "Save properties and synagogues. Come back anytime — your list is always ready.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">How ShulSearch Works</h2>
          <p className="mt-3 text-slate-500">
            Find homes based on proximity to synagogues and community amenities — so you can easily explore walkable options that fit your lifestyle.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}>
                <step.icon className="h-7 w-7" />
              </div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Step {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
