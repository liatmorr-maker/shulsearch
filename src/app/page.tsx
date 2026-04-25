import { LandingHero } from "@/components/landing/landing-hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PopularAreas } from "@/components/landing/popular-areas";
import { FeaturedListings } from "@/components/landing/featured-listings";
import { DisclaimerFooter } from "@/components/landing/disclaimer-footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <LandingHero />
      <HowItWorks />
      <PopularAreas />
      <FeaturedListings />
      <DisclaimerFooter />
    </div>
  );
}
