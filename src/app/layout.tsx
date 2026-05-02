import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import { Analytics } from "@/components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shulsearch.com"),
  title: { default: "ShulSearch – Find Homes Near Places of Worship", template: "%s | ShulSearch" },
  description: "Discover homes for sale and rent ranked by proximity to synagogues, churches, mosques, and temples across South Florida.",
  keywords: ["real estate near places of worship", "synagogue proximity homes", "Aventura homes", "Boca Raton real estate", "South Florida real estate", "walkable community homes"],
  openGraph: {
    siteName: "ShulSearch",
    url: "https://www.shulsearch.com",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen bg-[var(--background)]">
          <Analytics />
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
