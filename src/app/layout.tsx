import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShulSearch – Find Homes Near Synagogues",
  description:
    "Discover homes for sale and rent ranked by proximity to synagogues across South Florida.",
  keywords: ["Jewish real estate", "synagogue proximity", "Aventura homes", "Boca Raton real estate"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen bg-[var(--background)]">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
